// CashPack Protocol CPP-1.0 — Type Definitions

export type InstrumentStatus = "ACTIVE" | "REDEEMED" | "EXPIRED" | "CANCELLED";

export interface LockRequest {
  version: "CPP-1.0";
  request_id: string;          // UUIDv4
  timestamp: string;           // RFC 3339
  operator_id: string;
  principal_pk: string;        // Base64url
  initial_bearer_pk: string;   // Base64url
  amount: number;              // smallest currency unit
  currency: string;            // ISO 4217
  expiry: string;              // RFC 3339
  memo_hash?: string;          // hex SHA-256 of private memo, optional
  principal_signature: string; // Base64url — over canonical JSON of all above fields
}

export interface RenewalEntry {
  renewal_id: string;                   // UUIDv4
  timestamp: string;                    // RFC 3339
  outgoing_bearer_pk: string;           // Base64url
  incoming_bearer_pk: string;           // Base64url
  prev_chain_digest: string;            // hex
  outgoing_bearer_signature: string;    // Base64url
  operator_renewal_signature?: string;  // Base64url — added by Operator
}

export interface CashPack {
  version: "CPP-1.0";
  pack_id: string;             // UUIDv4
  operator_id: string;
  amount: number;
  currency: string;            // ISO 4217
  issued_at: string;           // RFC 3339
  expiry: string;              // RFC 3339
  status: InstrumentStatus;
  current_bearer_pk: string;   // Base64url
  lock_request: LockRequest;
  renewal_chain: RenewalEntry[];
  chain_digest: string;        // hex
  operator_signature: string;  // Base64url
}

export interface RedemptionRequest {
  pack_id: string;             // UUIDv4
  timestamp: string;           // RFC 3339
  redeemer_pk: string;         // Base64url
  destination: PayoutDestination;
  redeemer_signature: string;  // Base64url
}

export interface PayoutDestination {
  type: "BANK_ACCOUNT" | "INTERNAL_ACCOUNT" | "OTHER";
  account_id?: string;
  details?: Record<string, string>;
}

export interface RedemptionConfirmation {
  pack_id: string;
  redeemed_at: string;         // RFC 3339
  amount: number;
  currency: string;
  destination: PayoutDestination;
  operator_signature: string;  // Base64url over canonical JSON of above fields
}

// Internal storage record — not part of the wire protocol
export interface PackRecord {
  pack: CashPack;
  redeemer_identity?: string;  // recorded at redemption for compliance
}

// Error codes per spec §6.4
export type ErrorCode =
  | "INSUFFICIENT_BALANCE"
  | "AMOUNT_EXCEEDS_LIMIT"
  | "INVALID_SIGNATURE"
  | "BEARER_MISMATCH"
  | "CHAIN_DIGEST_MISMATCH"
  | "INSTRUMENT_NOT_ACTIVE"
  | "CHAIN_DEPTH_EXCEEDED"
  | "REDEEMER_NOT_IDENTIFIED"
  | "DUPLICATE_ID"
  | "EXPIRY_INVALID";

export interface ErrorResponse {
  error: ErrorCode;
  message: string;
}

export interface OperatorPolicy {
  protocol_version: string;
  operator_id: string;
  max_amount: number;
  max_lifetime_days: number;
  max_chain_depth: number;
  max_active_per_principal: number;
  supported_currencies: string[];
  redemption_identity_requirement: string;
  operator_pubkey_url: string;
}
