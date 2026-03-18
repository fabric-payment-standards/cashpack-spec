import * as ed from "@noble/ed25519";
import * as nodeCrypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import canonicalize from "canonicalize";

// Wire up sha512 for @noble/ed25519 v2 sync API using Node built-in
ed.etc.sha512Sync = (...msgs: Uint8Array[]) => {
  const h = nodeCrypto.createHash("sha512");
  for (const m of msgs) h.update(m);
  return new Uint8Array(h.digest());
};

// ─── Key Management ──────────────────────────────────────────────────────────

let operatorPrivKey: Uint8Array;
let operatorPubKey: Uint8Array;

export function loadOrGenerateOperatorKey(): void {
  const privPath = path.join(process.cwd(), "keys", "operator.priv");
  const pubPath  = path.join(process.cwd(), "keys", "operator.pub");

  if (fs.existsSync(privPath) && fs.existsSync(pubPath)) {
    operatorPrivKey = Buffer.from(fs.readFileSync(privPath, "utf8").trim(), "hex");
    operatorPubKey  = Buffer.from(fs.readFileSync(pubPath,  "utf8").trim(), "hex");
    console.log("Loaded operator key pair from disk.");
  } else {
    operatorPrivKey = ed.utils.randomPrivateKey();
    operatorPubKey  = ed.getPublicKey(operatorPrivKey);
    fs.mkdirSync(path.dirname(privPath), { recursive: true });
    fs.writeFileSync(privPath, Buffer.from(operatorPrivKey).toString("hex"));
    fs.writeFileSync(pubPath,  Buffer.from(operatorPubKey).toString("hex"));
    console.log("Generated new operator key pair.");
  }
}

export function getOperatorPublicKeyBase64url(): string {
  return toBase64url(operatorPubKey);
}

// ─── Encoding Helpers ────────────────────────────────────────────────────────

export function toBase64url(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function fromBase64url(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const mod = padded.length % 4;
  const b64 = mod ? padded + "====".slice(mod) : padded;
  return new Uint8Array(Buffer.from(b64, "base64"));
}

// ─── Canonical JSON (RFC 8785 / JCS) ─────────────────────────────────────────

export function canonicalJson(obj: unknown): string {
  const result = (canonicalize as (o: unknown) => string | undefined)(obj);
  if (!result) throw new Error("canonicalize returned undefined");
  return result;
}

// ─── Hashing ─────────────────────────────────────────────────────────────────

function sha256Bytes(input: string | Buffer): Buffer {
  return nodeCrypto.createHash("sha256").update(input).digest();
}

export function sha256Hex(input: string): string {
  return sha256Bytes(input).toString("hex");
}

/** chain_digest[0] = SHA256(canonical_json(lock_request)) */
export function computeInitialChainDigest(lockRequest: object): string {
  return sha256Hex(canonicalJson(lockRequest));
}

/**
 * chain_digest[n] = SHA256(chain_digest[n-1] || canonical_json(renewal_entry[n]))
 * Concatenation is raw bytes: hex-decoded prev + UTF-8 of canonical JSON.
 */
export function computeChainedDigest(prevDigestHex: string, renewalEntry: object): string {
  const prev       = Buffer.from(prevDigestHex, "hex");
  const entryBytes = Buffer.from(canonicalJson(renewalEntry), "utf8");
  const combined   = Buffer.concat([prev, entryBytes]);
  return nodeCrypto.createHash("sha256").update(combined).digest("hex");
}

// ─── Operator Signing ─────────────────────────────────────────────────────────

export function operatorSign(obj: object): string {
  const message = Buffer.from(canonicalJson(obj), "utf8");
  const sig = ed.sign(message, operatorPrivKey);
  return toBase64url(sig);
}

// ─── Signature Verification ───────────────────────────────────────────────────

export function verifySignature(
  payload: object,
  signatureB64url: string,
  pubkeyB64url: string
): boolean {
  try {
    const message = Buffer.from(canonicalJson(payload), "utf8");
    const sig     = fromBase64url(signatureB64url);
    const pubkey  = fromBase64url(pubkeyB64url);
    return ed.verify(sig, message, pubkey);
  } catch {
    return false;
  }
}

/** Verify the operator's own signature on a CashPack. */
export function verifyOperatorSignature(pack: Record<string, unknown>): boolean {
  const sig = pack["operator_signature"] as string | undefined;
  if (!sig) return false;
  const { operator_signature: _omit, ...rest } = pack;
  void _omit;
  return verifySignature(rest, sig, toBase64url(operatorPubKey));
}
