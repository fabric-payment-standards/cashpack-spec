import { Router, Request, Response } from "express";
import { getPack } from "../services/store";
import { ErrorResponse } from "../types";

export const statusRouter = Router();

statusRouter.get("/:packId/status", (req: Request, res: Response) => {
  //console.log("Status: Raw request bytes:", (req as any).rawBodyLength);
  const { packId } = req.params;
  const record = getPack(packId);

  if (!record) {
    return res.status(404).json({ error: "INSTRUMENT_NOT_ACTIVE", message: "Instrument not found." } as ErrorResponse);
  }

  const { pack } = record;

  // Auto-mark expired instruments
  if (pack.status === "ACTIVE" && new Date(pack.expiry) <= new Date()) {
    pack.status = "EXPIRED";
  }

  return res.status(200).json({
    pack_id: pack.pack_id,
    status: pack.status,
    amount: pack.amount,
    currency: pack.currency,
    issued_at: pack.issued_at,
    expiry: pack.expiry,
    chain_depth: pack.renewal_chain.length,
    current_bearer_pk: pack.current_bearer_pk,
    operator_id: pack.operator_id,
  });
});
