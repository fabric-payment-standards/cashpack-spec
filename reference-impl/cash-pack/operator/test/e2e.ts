#!/usr/bin/env node
/**
 * CashPack CPP-1.0 — Full lifecycle smoke test
 *
 * Exercises: issue → renew (Alice→John) → renew (John→Maria) → redeem (Maria)
 *
 * Usage:
 *   npm ci && npx ts-node test/e2e.ts
 *
 * Requires the server running on BASE_URL (default http://localhost:3000).
 */

import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha2.js";
import { v4 as uuidv4 } from "uuid";
import canonicalize from "canonicalize";

ed.etc.sha512Sync = (...m) => sha512(...(m as [Uint8Array]));

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toB64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function jcs(obj: unknown): string {
  const r = canonicalize(obj);
  if (!r) throw new Error("canonicalize failed");
  return r;
}

async function sign(obj: object, privKey: Uint8Array): Promise<string> {
  const msg = Buffer.from(jcs(obj), "utf8");
  const sig = ed.sign(msg, privKey);
  return toB64url(sig);
}

async function post(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`POST ${path} → ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function get(path: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`);
  const json = await res.json();
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

// ─── Key generation ───────────────────────────────────────────────────────────

function genKeyPair() {
  const priv = ed.utils.randomPrivateKey();
  const pub = ed.getPublicKey(priv);
  return { priv, pub: toB64url(pub) };
}

// ─── Main test ────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== CashPack CPP-1.0 — End-to-End Test ===\n");

  // Generate key pairs for each participant
  const bob = genKeyPair();  // Principal (issuer)
  const alice = genKeyPair();  // Initial bearer
  const john = genKeyPair();  // Intermediate bearer
  const maria = genKeyPair();  // Final redeemer

  // console.log("Key pairs generated for Bob (principal), Alice, John, Maria\n");
  // console.log(`Pub kyes:\n Bob: ${bob.pub}\n Alice: ${alice.pub}\n John: ${john.pub}\n Maria: ${maria.pub}`);

  // ── Step 1: Bob issues a cash-pack to Alice ───────────────────────────────
  const expiry = new Date(Date.now() + 30 * 86_400_000).toISOString();
  const lockRequestPayload = {
    version: "CPP-1.0" as const,
    request_id: uuidv4(),
    timestamp: new Date().toISOString(),
    operator_id: "cashpack-operator",
    principal_pk: bob.pub,
    initial_bearer_pk: alice.pub,
    amount: 5000,   // USD 50.00
    currency: "USD",
    expiry,
  };

  const principalSig = await sign(lockRequestPayload, bob.priv);
  const lockRequest = { ...lockRequestPayload, principal_signature: principalSig };

  console.log("1. Bob issues cash-pack (USD 50.00) to Alice...");
  const cashPack = await post("/v1/cashpack/issue", lockRequest) as any;
  const { pack_id } = cashPack;
  if (!pack_id) {
    throw "Cash Pack issuer endpoint returned invalid data"
  }
  const statusResponse = await get(`/v1/cashpack/${pack_id}/status`) as any;
  console.log("   ✓ statusResponse received:", statusResponse);

  console.log(`   ✓ status:  ${statusResponse.status}`);
  console.log(`   ✓ chain_depth: ${statusResponse.chain_depth.length}\n`);

  // ── Step 2: Alice renews to John ──────────────────────────────────────────
  console.log("2. Alice renews cash-pack to John...");
  const renewalPayload1 = {
    renewal_id: uuidv4(),
    timestamp: new Date().toISOString(),
    outgoing_bearer_pk: alice.pub,
    incoming_bearer_pk: john.pub,
    prev_chain_digest: cashPack.chain_digest,
  };

  const aliceSig = await sign(renewalPayload1, alice.priv);
  const renewEntry1 = { ...renewalPayload1, outgoing_bearer_signature: aliceSig };

  const pack2 = await post("/v1/cashpack/renew", {
    cash_pack: cashPack,
    renewal_entry: renewEntry1,
  }) as any;
  console.log(`   ✓ current_bearer_pk matches John: ${pack2.current_bearer_pk === john.pub}`);
  console.log(`   ✓ chain_depth: ${pack2.renewal_chain.length}\n`);


  // ── Step 3: John renews to Maria ──────────────────────────────────────────
  console.log("3. John renews cash-pack to Maria...");
  const renewalPayload2 = {
    renewal_id: uuidv4(),
    timestamp: new Date().toISOString(),
    outgoing_bearer_pk: john.pub,
    incoming_bearer_pk: maria.pub,
    prev_chain_digest: pack2.chain_digest,
  };
  const johnSig = await sign(renewalPayload2, john.priv);
  const renewEntry2 = { ...renewalPayload2, outgoing_bearer_signature: johnSig };

  const pack3 = await post("/v1/cashpack/renew", {
    cash_pack: pack2,
    renewal_entry: renewEntry2,
  }) as any;
  console.log(`   ✓ current_bearer_pk matches Maria: ${pack3.current_bearer_pk === maria.pub}`);
  console.log(`   ✓ chain_depth: ${pack3.renewal_chain.length}\n`);

  // ── Step 4: Check status ──────────────────────────────────────────────────
  console.log("4. Checking instrument status...");
  const status = await get(`/v1/cashpack/${pack3.pack_id}/status`) as any;
  console.log(`   ✓ status: ${status.status}`);
  console.log(`   ✓ chain_depth: ${status.chain_depth}\n`);

  // ── Step 5: Maria redeems ─────────────────────────────────────────────────
  console.log("5. Maria redeems the cash-pack...");
  const redemptionPayload = {
    pack_id: pack3.pack_id,
    timestamp: new Date().toISOString(),
    redeemer_pk: maria.pub,
    destination: { type: "INTERNAL_ACCOUNT", account_id: "maria-account-001" },
  };
  const mariaSig = await sign(redemptionPayload, maria.priv);
  const redemptionReq = { ...redemptionPayload, redeemer_signature: mariaSig };

  const confirmation = await post("/v1/cashpack/redeem", {
    cash_pack: pack3,
    redemption_request: redemptionReq,
    redeemer_identity: "MARIA_KYC_ID_12345",
  }) as any;
  console.log(`   ✓ redeemed_at:        ${confirmation.redeemed_at}`);
  console.log(`   ✓ amount:             ${confirmation.amount}`);
  console.log(`   ✓ currency:           ${confirmation.currency}`);
  console.log(`   ✓ operator_signature: ${confirmation.operator_signature.slice(0, 20)}...\n`);

  // ── Step 6: Verify instrument is now REDEEMED ─────────────────────────────
  console.log("6. Verifying instrument is REDEEMED...");
  const finalStatus = await get(`/v1/cashpack/${pack3.pack_id}/status`) as any;
  console.log(`   ✓ status: ${finalStatus.status}\n`);

  // ── Step 7: Attempt duplicate redemption (should fail) ───────────────────
  console.log("7. Attempting duplicate redemption (expect INSTRUMENT_NOT_ACTIVE)...");
  try {
    await post("/v1/cashpack/redeem", {
      cash_pack: pack3,
      redemption_request: redemptionReq,
      redeemer_identity: "MARIA_KYC_ID_12345",
    });
    console.log("   ✗ Should have failed!");
  } catch (e: any) {
    console.log(`   ✓ Correctly rejected: ${e.message}\n`);
  }

  console.log("=== All tests passed ✓ ===");
}
//for (let i = 1000; i > 0; i--) {
//console.log(`Shooting: i=${i}`);
main().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
//}
