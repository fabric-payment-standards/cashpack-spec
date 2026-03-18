import { Router, Request, Response } from "express";
import { POLICY } from "../services/config";
import { getOperatorPublicKeyBase64url } from "../services/crypto";

export const wellKnownRouter = Router();

wellKnownRouter.get("/cashpack-policy.json", (_req: Request, res: Response) => {
  res.json(POLICY);
});

wellKnownRouter.get("/cashpack-pubkey.json", (_req: Request, res: Response) => {
  // JWK (RFC 7517) representation of the operator's Ed25519 public key
  const raw = getOperatorPublicKeyBase64url();
  res.json({
    kty: "OKP",
    crv: "Ed25519",
    use: "sig",
    kid: POLICY.operator_id,
    x: raw,
  });
});
