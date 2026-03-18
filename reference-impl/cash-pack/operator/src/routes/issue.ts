import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  LockRequest,
  CashPack,
  ErrorResponse,
} from "../types";
import {
  verifySignature,
  operatorSign,
  computeInitialChainDigest,
} from "../services/crypto";
import {
  ensurePrincipal,
  isSeenId,
  lockFunds,
  markSeenId,
  savePack,
} from "../services/store";
import { OPERATOR_ID, POLICY } from "../services/config";

export const issueRouter = Router();

issueRouter.post("/", (req: Request, res: Response) => {
  const body = req.body as LockRequest;
  //console.log("Issue: Raw request bytes:", (req as any).rawBodyLength);

  // ── Basic structure check ────────────────────────────────────────────────
  if (!body || body.version !== "CPP-1.0") {
    return res.status(400).json({ error: "INVALID_SIGNATURE", message: "Missing or wrong version." } as ErrorResponse);
  }

  // ── Operator check ───────────────────────────────────────────────────────
  if (body.operator_id !== OPERATOR_ID) {
    return res.status(400).json({ error: "INVALID_SIGNATURE", message: "operator_id mismatch." } as ErrorResponse);
  }

  // ── Replay prevention (§5.7 obligation 1 / §6.4 DUPLICATE_ID) ───────────
  if (isSeenId(body.request_id)) {
    return res.status(409).json({ error: "DUPLICATE_ID", message: "request_id already seen." } as ErrorResponse);
  }

  // ── Currency support ─────────────────────────────────────────────────────
  if (!POLICY.supported_currencies.includes(body.currency)) {
    return res.status(422).json({ error: "AMOUNT_EXCEEDS_LIMIT", message: `Currency ${body.currency} not supported.` } as ErrorResponse);
  }

  // ── Amount limit (§5.7 obligation 4) ────────────────────────────────────
  if (body.amount > POLICY.max_amount) {
    return res.status(422).json({ error: "AMOUNT_EXCEEDS_LIMIT", message: `Amount exceeds max ${POLICY.max_amount}.` } as ErrorResponse);
  }
  if (body.amount <= 0) {
    return res.status(422).json({ error: "AMOUNT_EXCEEDS_LIMIT", message: "Amount must be positive." } as ErrorResponse);
  }

  // ── Expiry validation ────────────────────────────────────────────────────
  const now = new Date();
  const expiry = new Date(body.expiry);
  const maxExpiry = new Date(now.getTime() + POLICY.max_lifetime_days * 86_400_000);
  if (isNaN(expiry.getTime()) || expiry <= now || expiry > maxExpiry) {
    return res.status(422).json({ error: "EXPIRY_INVALID", message: "Expiry must be a future date within policy lifetime." } as ErrorResponse);
  }

  // ── Principal account (§5.7 obligation 1: authenticate; here we trust the PK for demo) ──
  const principal = ensurePrincipal(body.principal_pk, body.currency);

  // ── Velocity check ───────────────────────────────────────────────────────
  if (principal.activePacks >= POLICY.max_active_per_principal) {
    return res.status(422).json({ error: "AMOUNT_EXCEEDS_LIMIT", message: "Too many active instruments." } as ErrorResponse);
  }

  // ── Balance check (§5.7 obligation 3) ───────────────────────────────────
  if (principal.balance < body.amount) {
    return res.status(422).json({ error: "INSUFFICIENT_BALANCE", message: "Insufficient balance." } as ErrorResponse);
  }

  // ── Signature verification (§5.7 obligation 2) ──────────────────────────
  const { principal_signature, ...lockRequestPayload } = body;
  if (!verifySignature(lockRequestPayload, principal_signature, body.principal_pk)) {
    return res.status(401).json({ error: "INVALID_SIGNATURE", message: "principal_signature verification failed." } as ErrorResponse);
  }

  // ── Lock funds (§5.7 obligation 5) ──────────────────────────────────────
  lockFunds(body.principal_pk, body.amount);

  // ── Compute initial chain digest (§5.7 obligation 7) ────────────────────
  const chainDigest = computeInitialChainDigest(body);

  // ── Build instrument (§5.7 obligations 6–8) ─────────────────────────────
  const packWithoutSig: Omit<CashPack, "operator_signature"> = {
    version: "CPP-1.0",
    pack_id: uuidv4(),
    operator_id: OPERATOR_ID,
    amount: body.amount,
    currency: body.currency,
    issued_at: now.toISOString(),
    expiry: body.expiry,
    status: "ACTIVE",
    current_bearer_pk: body.initial_bearer_pk,
    lock_request: body,
    renewal_chain: [],
    chain_digest: chainDigest,
  };

  const operatorSignature = operatorSign(packWithoutSig);
  const pack: CashPack = { ...packWithoutSig, operator_signature: operatorSignature };

  // ── Persist ──────────────────────────────────────────────────────────────
  markSeenId(body.request_id);
  savePack(pack);

  return res.status(201).json(pack);
});
