import { OperatorPolicy } from "../types";

export const OPERATOR_ID = process.env.OPERATOR_ID ?? "cashpack-operator-prototype";

export const POLICY: OperatorPolicy = {
  protocol_version: "CPP-1.0",
  operator_id: OPERATOR_ID,
  // 10 000 USD in cents (regulatory threshold, §4.2)
  max_amount: parseInt(process.env.MAX_AMOUNT ?? "1000000"),
  max_lifetime_days: parseInt(process.env.MAX_LIFETIME_DAYS ?? "90"),
  max_chain_depth: parseInt(process.env.MAX_CHAIN_DEPTH ?? "20"),
  max_active_per_principal: parseInt(process.env.MAX_ACTIVE_PER_PRINCIPAL ?? "10"),
  supported_currencies: (process.env.SUPPORTED_CURRENCIES ?? "USD,EUR,BRL,GBP").split(","),
  redemption_identity_requirement:
    "Redeemer must be an existing KYC-verified account holder, or complete KYC at redemption.",
  operator_pubkey_url: `${process.env.BASE_URL ?? "http://localhost:3000"}/.well-known/cashpack-pubkey.json`,
};
