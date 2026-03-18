/**
 * In-memory store — replace with a real database for production.
 * Provides: instrument store, principal ledger, seen-ID deduplication.
 */

import { CashPack, PackRecord } from "../types";

// ─── Instrument Store ─────────────────────────────────────────────────────────

const packs = new Map<string, PackRecord>();

export function savePack(pack: CashPack, redeemerIdentity?: string): void {
  packs.set(pack.pack_id, { pack, redeemer_identity: redeemerIdentity });
}

export function getPack(packId: string): PackRecord | undefined {
  return packs.get(packId);
}

export function updatePack(pack: CashPack): void {
  const record = packs.get(pack.pack_id);
  if (!record) throw new Error(`Pack ${pack.pack_id} not found`);
  record.pack = { ...pack };
  console.log("updatePack stored current_bearer_pk:", packs.get(pack.pack_id)!.pack.current_bearer_pk);

}

// ─── Principal Ledger (mock) ───────────────────────────────────────────────────

interface PrincipalAccount {
  balance: number;           // in smallest currency unit
  currency: string;
  lockedAmount: number;
  activePacks: number;
}

const principals = new Map<string, PrincipalAccount>([
  // Seed some demo accounts (public key → account)
  ["demo-principal-pk-alice", { balance: 1_000_000, currency: "USD", lockedAmount: 0, activePacks: 0 }],
  ["demo-principal-pk-bob", { balance: 500_000, currency: "EUR", lockedAmount: 0, activePacks: 0 }],
]);

export function getPrincipal(pk: string): PrincipalAccount | undefined {
  return principals.get(pk);
}

export function ensurePrincipal(pk: string, currency: string = "USD"): PrincipalAccount {
  if (!principals.has(pk)) {
    // Auto-create with a generous demo balance
    principals.set(pk, { balance: 10_000_000, currency, lockedAmount: 0, activePacks: 0 });
  }
  return principals.get(pk)!;
}

export function lockFunds(pk: string, amount: number): void {
  const acct = ensurePrincipal(pk);
  acct.balance -= amount;
  acct.lockedAmount += amount;
  acct.activePacks += 1;
}

export function releaseFunds(pk: string, amount: number): void {
  const acct = ensurePrincipal(pk);
  acct.lockedAmount -= amount;
  acct.activePacks -= 1;
}

// ─── Seen-ID Registry (replay prevention) ────────────────────────────────────

const seenIds = new Set<string>();

export function isSeenId(id: string): boolean {
  return seenIds.has(id);
}

export function markSeenId(id: string): void {
  seenIds.add(id);
}
