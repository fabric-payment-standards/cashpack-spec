---
title: Core Concepts
description: The mental models and key ideas underlying the CashPack Protocol — bearer instruments, the trust model, chain integrity, and privacy through disposable keys.
---

# CashPack Protocol — Core Concepts

> **Layer 2 of 6** · Audience: technical evaluators, architects, product teams  
> For normative protocol requirements, see [Formal Specification](../SPEC.md).

---

## 1. The Bearer Principle

A bearer instrument grants its holder the right to a value, regardless of how the holder came to possess it. Physical cash is the most familiar example. The CashPack Protocol implements this principle digitally: whoever controls the private key corresponding to the `current_bearer_pk` field of a cash-pack is entitled to renew or redeem it.

The Operator does not track who holds the instrument between issuance and redemption. The instrument travels off-ledger, passing from key-pair to key-pair, with the Operator serving only as the countersigning authority when a holder presents it for renewal or redemption.

---

## 2. The Trust Model

Unlike blockchain-based bearer systems, the CashPack Protocol is a **trusted model**. The Operator is the single source of truth for instrument validity. There is no consensus mechanism, no mining, and no distributed agreement. If the Operator says an instrument is valid, it is valid. If the Operator marks it redeemed, it is redeemed.

This is not a weakness — it is a deliberate design choice. It means the system is:

- **Auditable and supervisable** by regulators.
- **Operationally simple and fast** — no consensus latency.
- **Legally accountable** — the Operator has a known domicile, a licence, and assets.
- **Compatible with existing financial infrastructure** — no new settlement rails required.

Participants must trust only one counterparty: the Operator. They do not need to trust each other, any network, or any protocol. The Operator's countersignature on every update is the guarantee.

---

## 3. The Chain Structure

Each cash-pack carries its full history. The lock request — signed by the original requester — is embedded in the instrument. Every subsequent renewal is appended as a signed entry. Each entry includes a hash of all previous entries (the **chain digest**), creating a tamper-evident log.

This chain serves two purposes:

- **Non-repudiation:** every transfer is cryptographically attested by the outgoing bearer.
- **Auditability:** in a legal investigation, the full transfer history is available to the Operator and, through the Operator, to authorised investigators.

The chain is analogous in structure to a hash chain or blockchain — but it is maintained and validated by the Operator alone, not by a distributed network. This gives it the auditability of a ledger without the public visibility.

---

## 4. Disposable Keys and Privacy

A fundamental privacy-enhancing practice within this protocol is the use of **disposable (ephemeral) key pairs**. Because bearers are identified only by public key, a bearer who generates a fresh key pair for each instrument they receive achieves a significantly stronger privacy guarantee:

- Their identity cannot be linked across instruments even if two instruments are examined together.
- The public key appearing in the chain has no prior history and no future activity — it cannot be correlated with any previously known key.
- Even if a later holder's identity becomes known (e.g., at redemption), it cannot be retroactively linked to earlier holdings.

> **Example.** Alice generates a new key pair specifically for receiving this cash-pack. She uses the public key to receive the instrument from Bob. When she passes it to John, she signs the renewal with that disposable private key, then discards it. To any observer examining the chain, Alice's entry is a public key with no prior history and no future activity — unlinked to her real-world identity unless she chooses to reveal it.

Operators and application developers should make disposable key generation the default behaviour, with reusable keys as an explicit opt-in. The protocol supports this natively — there is no requirement that a public key be reused.

---

## 5. The Intermediate Bearer's Advantage

Intermediate bearers — those who receive a cash-pack and pass it on rather than redeeming it — enjoy the **strongest privacy protection** in the system:

- They are never identified to the Operator. The Operator sees their public key but has no obligation or mechanism to link it to an identity.
- If they use a disposable key pair, that public key is a one-time artefact with no prior or subsequent history.
- They control the timing of transfer — they can hold the instrument and pass it at any moment before expiry.
- They receive a cryptographically guaranteed instrument: the Operator's countersignature on the renewal confirms the instrument is active and the amount is intact.

The two parties necessarily exposed to the Operator are the original requester (who holds an account) and the final redeemer (who must be identifiable to receive funds). Everyone in between is shielded.

---

## 6. Relationship to Existing Instruments

| Instrument | Relationship |
|---|---|
| Physical cash | Cash-packs replicate the bearer property and privacy of cash in digital form, with cryptographic verification and no physical transport risk. |
| Cashier's cheques | Similar trust model (bank-issued, identifiable at edges) but cash-packs are transferable multiple times without bank involvement at each intermediate step. |
| Prepaid cards | Similar use case, but prepaid cards are account-based and each transaction is logged. Cash-packs are not. |
| Hash Time-Lock Contracts | Shares the concept of cryptographically locked value with a conditional release, but without requiring a blockchain or shared-secret reveal. |
| Tokenized deposits | A cash-pack can wrap a tokenized deposit, providing a privacy layer above the token's settlement infrastructure. |
| Bearer bonds | The instrument structure directly maps to a bearer bond: locked value, transferable by key, redeemable by the current holder. |

---

*CashPack Protocol CPP-1.0 · DRAFT · Infrastructure-Agnostic · For Discussion and Adoption*  
*© 2026 Fabric Payment Standards Foundation — Licensed under Apache License 2.0*