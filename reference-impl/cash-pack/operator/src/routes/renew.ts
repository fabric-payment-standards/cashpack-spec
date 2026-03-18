import { Router, Request, Response } from "express";
import {
  CashPack,
  RenewalEntry,
  ErrorResponse,
} from "../types";
import {
  verifySignature,
  verifyOperatorSignature,
  operatorSign,
  computeChainedDigest,
} from "../services/crypto";
import {
  getPack,
  isSeenId,
  markSeenId,
  updatePack,
} from "../services/store";
import { POLICY } from "../services/config";

export const renewRouter = Router();

interface RenewRequestBody {
  cash_pack: CashPack;
  renewal_entry: RenewalEntry;
}

renewRouter.post("/", (req: Request, res: Response) => {
  const body = req.body as RenewRequestBody;
  //console.log("Renew: Raw request bytes:", (req as any).rawBodyLength);

  if (!body?.cash_pack || !body?.renewal_entry) {
    return res.status(400).json({ error: "INVALID_SIGNATURE", message: "Body must contain cash_pack and renewal_entry." } as ErrorResponse);
  }

  const submitted = body.cash_pack;
  const entry = body.renewal_entry;

  // ── Replay prevention ────────────────────────────────────────────────────
  if (isSeenId(entry.renewal_id)) {
    return res.status(409).json({ error: "DUPLICATE_ID", message: "renewal_id already seen." } as ErrorResponse);
  }

  // ── Load stored record ───────────────────────────────────────────────────
  const record = getPack(submitted.pack_id);
  if (!record) {
    return res.status(404).json({ error: "INSTRUMENT_NOT_ACTIVE", message: "Instrument not found." } as ErrorResponse);
  }

  const stored = record.pack;

  // ── Verify Operator's prior signature (§5.7 renewal obligation 1) ────────
  if (!verifyOperatorSignature(stored as object & { operator_signature: string })) {
    return res.status(401).json({ error: "INVALID_SIGNATURE", message: "Operator signature on stored instrument is invalid." } as ErrorResponse);
  }

  // ── Status and expiry check (§5.7 renewal obligation 2) ─────────────────
  if (stored.status !== "ACTIVE") {
    return res.status(422).json({ error: "INSTRUMENT_NOT_ACTIVE", message: `Instrument status is ${stored.status}.` } as ErrorResponse);
  }
  if (new Date(stored.expiry) <= new Date()) {
    // Auto-mark expired
    stored.status = "EXPIRED";
    updatePack(stored);
    return res.status(422).json({ error: "INSTRUMENT_NOT_ACTIVE", message: "Instrument has expired." } as ErrorResponse);
  }

  // ── Bearer match (§5.7 renewal obligation 3) ────────────────────────────
  if (entry.outgoing_bearer_pk !== stored.current_bearer_pk) {
    console.log("BEARER CHECK stored:", stored.current_bearer_pk);
    console.log("BEARER CHECK entry: ", entry.outgoing_bearer_pk);
    return res.status(401).json({ error: "BEARER_MISMATCH", message: "outgoing_bearer_pk does not match current bearer." } as ErrorResponse);
  }

  // ── Chain depth check (§5.7 renewal obligation 6) ───────────────────────
  if (stored.renewal_chain.length >= POLICY.max_chain_depth) {
    return res.status(422).json({ error: "CHAIN_DEPTH_EXCEEDED", message: `Max chain depth ${POLICY.max_chain_depth} reached.` } as ErrorResponse);
  }

  // ── Chain digest consistency (§5.7 renewal obligation 5) ────────────────
  if (entry.prev_chain_digest !== stored.chain_digest) {
    return res.status(422).json({ error: "CHAIN_DIGEST_MISMATCH", message: "prev_chain_digest does not match current chain_digest." } as ErrorResponse);
  }

  // ── Verify bearer signature (§5.7 renewal obligation 4) ─────────────────
  const { outgoing_bearer_signature, operator_renewal_signature: _ors, ...entryPayload } = entry;
  if (!verifySignature(entryPayload, outgoing_bearer_signature, entry.outgoing_bearer_pk)) {
    return res.status(401).json({ error: "INVALID_SIGNATURE", message: "outgoing_bearer_signature verification failed." } as ErrorResponse);
  }

  // ── Compute new chain digest (§5.7 renewal obligation 8) ────────────────
  const newChainDigest = computeChainedDigest(stored.chain_digest, entry);

  // ── Operator countersigns the entry ─────────────────────────────────────
  const signedEntry: RenewalEntry = {
    ...entry,
    operator_renewal_signature: operatorSign({ ...entry }),
  };

  // ── Update instrument ────────────────────────────────────────────────────
  // const updatedWithoutSig: Omit<CashPack, "operator_signature"> = {
  //   ...stored,
  //   current_bearer_pk: entry.incoming_bearer_pk,
  //   renewal_chain: [...stored.renewal_chain, signedEntry],
  //   chain_digest: newChainDigest,
  // };

  const { operator_signature: _oldSig, ...storedWithoutSig } = stored;
  const updatedWithoutSig = { ...storedWithoutSig };
  updatedWithoutSig.current_bearer_pk = entry.incoming_bearer_pk
  updatedWithoutSig.renewal_chain = [...stored.renewal_chain, signedEntry]
  updatedWithoutSig.chain_digest = newChainDigest

  const newOperatorSig = operatorSign(updatedWithoutSig); // clean payload

  const updatedPack: CashPack = {
    ...updatedWithoutSig,
    operator_signature: newOperatorSig,
  };

  markSeenId(entry.renewal_id);
  updatePack(updatedPack);

  return res.status(200).json(updatedPack);
});
