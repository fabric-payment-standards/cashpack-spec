import { Router, Request, Response } from "express";
import {
  CashPack,
  RedemptionRequest,
  RedemptionConfirmation,
  ErrorResponse,
} from "../types";
import {
  verifySignature,
  verifyOperatorSignature,
  operatorSign,
} from "../services/crypto";
import {
  getPack,
  isSeenId,
  markSeenId,
  releaseFunds,
  savePack,
} from "../services/store";

export const redeemRouter = Router();

interface RedeemRequestBody {
  cash_pack: CashPack;
  redemption_request: RedemptionRequest;
  /**Identity verification is trivially accepted simplified. Not for production*/
  redeemer_identity: string;
}

redeemRouter.post("/", (req: Request, res: Response) => {
  const body = req.body as RedeemRequestBody;
  //console.log("Redeem: Raw request bytes:", (req as any).rawBodyLength);

  if (!body?.cash_pack || !body?.redemption_request) {
    return res.status(400).json({ error: "INVALID_SIGNATURE", message: "Body must contain cash_pack and redemption_request." } as ErrorResponse);
  }

  const submitted = body.cash_pack;
  const rr = body.redemption_request;

  // ── pack_id consistency ──────────────────────────────────────────────────
  if (rr.pack_id !== submitted.pack_id) {
    return res.status(400).json({ error: "INVALID_SIGNATURE", message: "pack_id mismatch between cash_pack and redemption_request." } as ErrorResponse);
  }

  // ── Load stored record ───────────────────────────────────────────────────
  const record = getPack(submitted.pack_id);
  if (!record) {
    return res.status(404).json({ error: "INSTRUMENT_NOT_ACTIVE", message: "Instrument not found." } as ErrorResponse);
  }

  const stored = record.pack;

  // ── Verify full instrument signature chain (§5.7 redemption obligation 1) ─
  if (!verifyOperatorSignature(stored as object & { operator_signature: string })) {
    return res.status(401).json({ error: "INVALID_SIGNATURE", message: "Operator signature invalid." } as ErrorResponse);
  }

  // ── Status and expiry check (§5.7 redemption obligation 4) ───────────────
  if (stored.status !== "ACTIVE") {
    return res.status(422).json({ error: "INSTRUMENT_NOT_ACTIVE", message: `Instrument status is ${stored.status}.` } as ErrorResponse);
  }
  if (new Date(stored.expiry) <= new Date()) {
    stored.status = "EXPIRED";
    savePack(stored);
    return res.status(422).json({ error: "INSTRUMENT_NOT_ACTIVE", message: "Instrument has expired." } as ErrorResponse);
  }

  // ── Bearer match (§5.7 redemption obligation 2) ───────────────────────────
  if (rr.redeemer_pk !== stored.current_bearer_pk) {
    return res.status(401).json({ error: "BEARER_MISMATCH", message: "redeemer_pk does not match current bearer." } as ErrorResponse);
  }

  // ── Verify redeemer signature (§5.7 redemption obligation 3) ─────────────
  const { redeemer_signature, ...rrPayload } = rr;
  if (!verifySignature(rrPayload, redeemer_signature, rr.redeemer_pk)) {
    return res.status(401).json({ error: "INVALID_SIGNATURE", message: "redeemer_signature verification failed." } as ErrorResponse);
  }

  // ── Identity check (§5.7 redemption obligation 5) ────────────────────────
  // Prototype: any non-empty identity string is accepted.
  if (!body.redeemer_identity || body.redeemer_identity.trim() === "") {
    return res.status(422).json({ error: "REDEEMER_NOT_IDENTIFIED", message: "Redeemer identity required for redemption." } as ErrorResponse);
  }

  // ── Mark REDEEMED before releasing funds (§5.7 redemption obligation 6) ───
  stored.status = "REDEEMED";
  savePack(stored, body.redeemer_identity);

  // ── Release locked funds (§5.7 redemption obligation 7) ──────────────────
  releaseFunds(stored.lock_request.principal_pk, stored.amount);

  // ── Build Redemption Confirmation ─────────────────────────────────────────
  const now = new Date().toISOString();
  const confirmationPayload = {
    pack_id: stored.pack_id,
    redeemed_at: now,
    amount: stored.amount,
    currency: stored.currency,
    destination: rr.destination,
  };

  const confirmation: RedemptionConfirmation = {
    ...confirmationPayload,
    operator_signature: operatorSign(confirmationPayload),
  };

  return res.status(200).json(confirmation);
});
