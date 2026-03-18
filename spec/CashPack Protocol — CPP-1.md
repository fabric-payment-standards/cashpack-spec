# CashPack Protocol — CPP-1.0

> **Layered Documentation · DRAFT · Infrastructure-Agnostic · For Discussion and Adoption**

---

## Document Metadata

| Field | Value |
|---|---|
| **Document ID** | FPSF-SPEC-001 |
| **Title** | CashPack Protocol |
| **Version** | 1.0.0 |
| **Status** | Draft |
| **Date** | 2026-03-15 |
| **Author(s)** | Adalton Reis [reis@fabricpaymentstandards.org](mailto:reis@fabricpaymentstandards.org) |
| **Reviewers** | — |
| **Organization** | Fabric Payment Standards Foundation |
| **Specification Family** | CashPack Protocol (CPP) |
| **Canonical URL** | `https://fabricpaymentstandards.org/specs/cashpack/spec` |
| **Repository** | `https://github.com/fabric-payment-standards/cashpack-spec` |
| **Contact** | [contact@fabricpaymentstandards.org](mailto:contact@fabricpaymentstandards.org) |
| **License** | Apache License 2.0 |

---

## Document Map

| Layer | Name | Purpose |
|---|---|---|
| 1 | Overview | What this is and why it exists |
| 2 | Core Concepts | Mental models and key ideas |
| 3 | Guides | How to use it — flows, privacy, disposable keys |
| 4 | Governance | Compliance, risk, and operator obligations |
| 5 | Formal Specification | Data structures and protocol rules |
| 6 | Reference | Algorithms, endpoints, error codes, glossary |

> **IMPORTANT — Infrastructure Agnosticism**
>
> This standard is infrastructure-agnostic. It does not require or prefer any particular settlement layer. Operators MAY implement it on top of a traditional core banking system, a tokenized deposit platform, a permissioned ledger, or any other settlement infrastructure. The protocol defines behavior *above* the settlement layer.

---

---

# Layer 1 — Overview

*What this is and why it exists*

---

## 1. Overview

### 1.1 The Problem

Digital payments today expose every party in a transaction to the payment network at every step. The sender, the receiver, the amount, and the timestamp are all recorded by intermediaries. This is by design for fraud prevention and regulatory compliance — but it eliminates the practical privacy that individuals have long exercised with physical cash.

Physical cash allows a person to pass value to another without that transfer being recorded by a bank, a network, or a government. Every participant in the chain is identified only to the person immediately before and after them. The system works because the instrument — the banknote — is the bearer of value, not an account ledger entry.

No digital equivalent of this exists at scale today. Blockchain-based systems introduced bearer-like properties but at the cost of public ledgers, volatility, and regulatory friction. Account-based digital money is entirely trackable. The CashPack Protocol fills this gap.

### 1.2 The Solution in One Paragraph

The CashPack Protocol defines a signed, transferable digital instrument — the **cash-pack** — that can be passed from person to person without each transfer being recorded by the Operator. An identified account holder (Bob) asks a licensed Operator to lock a specific amount and issue a cash-pack addressed to a recipient identified only by a public key (Alice). Alice can pass it to John, John to Maria, and so on, each time asking the Operator to update the bearer field. The Operator countersigns every update. The final holder redeems it. The Operator sees who locked the funds and who redeemed them; the intermediate chain is visible only to its participants.

### 1.3 Infrastructure Agnosticism

The CashPack Protocol is a behavioral standard. It defines data structures, cryptographic rules, and protocol flows. It does not mandate any particular settlement or record-keeping infrastructure.

| Settlement Layer | Compatibility |
|---|---|
| Traditional core banking | Fully supported. The Operator's internal ledger records the lock and the redemption. Cash-pack data is stored off-ledger or in any database. |
| Tokenized deposits | Fully supported. The locked amount can be represented as a tokenized deposit; the cash-pack is the off-chain bearer wrapper around it. |
| Permissioned distributed ledger | Fully supported. The Operator may record instrument state on a permissioned ledger for auditability while maintaining privacy of bearer transfers. |
| Public blockchain | Supported as a settlement layer for Operators who choose it. The protocol places no requirement on this choice. |
| Security bond / digital asset issuance | The instrument structure generalizes to any locked value. An Operator may use cash-packs to represent bearer vouchers for bonds, commodities, or other financial instruments. |

> **NOTE:** Choosing the settlement layer is an Operator implementation decision. This specification is silent on it except to say: the Operator MUST be able to lock value at issuance and release it at redemption. Everything else is up to the Operator.

### 1.4 Target Use Cases

- Low-to-moderate value person-to-person domestic transfers where the sender and receiver prefer not to expose their relationship to the financial system.
- Merchant payments where the payer wants cash-like privacy.
- Gift instruments, vouchers, and prepaid value that can be freely passed before redemption.
- Tokenized deposit wrappers enabling privacy-preserving transfer of bank money.
- Bearer bonds or digital securities that need to change hands without on-ledger transfers at every hop.
- Cross-border payments *(Phase 2)*: with inter-Operator settlement agreements, instruments issued by one Operator may be honored by another.

### 1.5 What This Standard Covers

- Data structures for all instrument lifecycle states.
- Cryptographic requirements for signing and chain integrity.
- Protocol flows for issuance, transfer (renewal), and redemption.
- Operator interface requirements (endpoints, error codes).
- Governance obligations for Operators (limits, compliance, reporting).

**Out of scope:** specific key management architectures, banking system integration, currency exchange, inter-Operator settlement protocols, and any distributed consensus mechanism.

---

---

# Layer 2 — Core Concepts

*Mental models and key ideas*

---

## 2. Core Concepts

### 2.1 The Bearer Principle

A bearer instrument is a document that grants its holder the right to a value, regardless of how the holder came to possess it. Physical cash is the most familiar example. The CashPack Protocol implements this principle digitally: whoever controls the private key corresponding to the `current_bearer_pk` field of a cash-pack is entitled to renew or redeem it.

The Operator does not track who holds the instrument between issuance and redemption. The instrument travels off-ledger, passing from key-pair to key-pair, with the Operator serving only as the countersigning authority when a holder presents it for renewal or redemption.

### 2.2 The Trust Model

Unlike blockchain-based bearer systems, the CashPack Protocol is a **trusted model**. The Operator is the single source of truth for instrument validity. There is no consensus mechanism, no mining, and no distributed agreement. If the Operator says an instrument is valid, it is valid. If the Operator marks it redeemed, it is redeemed.

This is not a weakness — it is a feature. It means the system is:

- Auditable and supervisable by regulators.
- Operationally simple and fast.
- Legally accountable (the Operator has a known domicile, a license, and assets).
- Compatible with existing financial infrastructure.

> **NOTE:** Participants must trust only one counterparty: the Operator. They do not need to trust each other, any network, or any protocol. The Operator's signature is the guarantee.

### 2.3 The Chain Structure

Each cash-pack carries its full history. The lock request (signed by the original requester) is embedded in the instrument. Every subsequent renewal is appended as a signed entry. Each entry includes a hash of all previous entries (the **chain digest**), creating a tamper-evident log — analogous in structure to a blockchain, but maintained and validated by the Operator alone.

This chain serves two purposes:

- **Non-repudiation:** every transfer is cryptographically attested by the outgoing bearer.
- **Auditability:** in a legal investigation, the full transfer history is available to the Operator and, through the Operator, to authorized investigators.

### 2.4 Disposable Keys and Privacy

A fundamental privacy-enhancing practice within this protocol is the use of **disposable (ephemeral) key pairs**. Because bearers are identified only by public key, a bearer who generates a fresh key pair for each instrument they receive achieves a much stronger privacy guarantee:

- Their identity cannot be linked across instruments even if two instruments are examined together.
- The public key appearing in the chain cannot be associated with any previously known key, preventing correlation attacks.
- Even if a later holder's identity becomes known (e.g., at redemption), it cannot be retroactively linked to earlier holdings.

---

> **PRIVACY BENEFIT — DISPOSABLE KEYS**
>
> Alice generates a new key pair specifically for receiving this cash-pack. She uses the public key to receive the instrument from Bob. When she passes it to John, she signs the renewal with the same disposable private key, then discards it. To any observer examining the chain, Alice's entry is a public key with no prior history and no future activity. It is unlinked to her real-world identity unless she chooses to reveal it.

---

Operators and application developers SHOULD encourage or enforce the generation of new key pairs per instrument. The protocol supports this natively — there is no requirement that a public key be reused.

### 2.5 The Intermediate Bearer's Advantage

Intermediate bearers — those who receive a cash-pack and pass it on rather than redeeming it — enjoy the **strongest privacy protection** in the system:

- They are never identified to the Operator. The Operator sees their public key but has no obligation or mechanism to link it to an identity.
- If they use a disposable key pair, the public key in the chain is a one-time artifact with no prior or subsequent history.
- They control the timing of transfer: they can hold the instrument and pass it at any moment before expiry.
- They receive a cryptographically guaranteed instrument: the Operator's countersignature on the renewal confirms the instrument is active and the amount is intact.

This makes intermediate bearers the primary beneficiaries of the privacy model. The two parties necessarily exposed to the Operator are the original requester (who has an account) and the final redeemer (who must be identifiable to receive funds). Everyone in between is shielded.

### 2.6 Relationship to Existing Instruments

| Instrument | Relationship |
|---|---|
| Physical cash | Cash-packs replicate the bearer property and privacy of cash in digital form, with the advantage of cryptographic verification and no physical transport. |
| Cashier's cheques | Similar trust model (bank-issued, identifiable at edges) but cash-packs are transferable multiple times without bank involvement at each step. |
| Prepaid cards | Similar use case but prepaid cards are account-based and each swipe is logged. Cash-packs are not. |
| Hash Time-Lock Contracts (HTLCs) | Shares the concept of cryptographically locked value with a conditional release. Cash-packs generalize this without requiring a blockchain or a shared secret reveal. |
| Tokenized deposits | A cash-pack can wrap a tokenized deposit, providing a privacy layer above the token's settlement infrastructure. |
| Bearer bonds | The instrument structure directly maps to a bearer bond: locked value, transferable by key, redeemable by the current holder. |

---

---

# Layer 3 — Guides

*How to use the protocol — flows and practical patterns*

---

## 3. Guides

### 3.1 The Issuance Flow (Bob → Alice)

This guide walks through the creation of a cash-pack from Bob's perspective.

#### Prerequisites

- Bob is a KYC-verified account holder with the Operator.
- Bob has a private key (generated by the Operator's app or a compatible third-party tool).
- Alice has provided Bob with her public key through any out-of-band channel (messaging, in person, QR code, etc.).

#### Steps

1. Bob constructs a Lock Request containing: his public key, Alice's public key, the amount, the currency, the Operator identifier, a unique request ID, and a timestamp.
2. Bob signs the Lock Request with his private key using Ed25519 (or ECDSA P-256).
3. Bob submits the signed Lock Request to the Operator's issuance endpoint.
4. The Operator authenticates Bob, verifies his signature, checks his available balance, and confirms the amount does not exceed the configured maximum.
5. The Operator locks the amount (holding it from Bob's account without debiting), constructs the cash-pack instrument, and signs it.
6. The Operator returns the signed cash-pack to Bob.
7. Bob delivers the cash-pack to Alice through any channel (no network required — it is just data).

> **NOTE:** The cash-pack is just a JSON document. Bob can send it to Alice as an attachment, a QR code, over an encrypted message, or even printed and handed over physically. The Operator is not involved in delivery.

---

### 3.2 The Renewal Flow (Alice → John)

Alice holds a cash-pack. She wants to pass it to John. She does not redeem it; she transfers the bearer right.

#### Prerequisites

- Alice holds a cash-pack where `current_bearer_pk` matches her public key.
- John has provided Alice with his public key.
- Alice has internet access to the Operator's renewal endpoint.

#### Steps

1. Alice constructs a Renewal Entry: her public key as outgoing bearer, John's public key as incoming bearer, the current chain digest, and a timestamp.
2. Alice signs the Renewal Entry with her private key.
3. Alice submits the current cash-pack plus the Renewal Entry to the Operator's renewal endpoint.
4. The Operator verifies: its own prior signature on the instrument, Alice's signature on the entry, that Alice's key matches `current_bearer_pk`, and that the chain digest is consistent.
5. The Operator updates `current_bearer_pk` to John's public key, appends the Renewal Entry to the chain, recomputes the chain digest, re-signs the updated instrument, and returns it to Alice.
6. Alice delivers the updated cash-pack to John.

---

> **PRIVACY HIGHLIGHT — THE INVISIBLE MIDDLE**
>
> In this flow, the Operator processes Alice's renewal request but does not know who Alice is. It sees a public key and a valid signature. If Alice used a disposable key pair, that public key has never appeared in any prior transaction and will never appear again. Alice is, from the Operator's perspective, a cryptographic identity with no history. John faces the same property when he later renews or redeems.

---

#### Chaining Renewals

John can repeat this exact process for any subsequent bearer. The `renewal_chain` in the instrument grows by one entry per hop. Operators impose a maximum chain depth; the recommended minimum is 20 hops, which is sufficient for all practical use cases.

---

### 3.3 The Redemption Flow (Final Bearer → Funds)

The current bearer wants to convert the cash-pack into spendable funds.

#### Prerequisites

- The bearer holds a cash-pack where `current_bearer_pk` matches their public key.
- The instrument is in `ACTIVE` status and not expired.
- The bearer is identifiable to the Operator (existing account holder, or willing to complete KYC at redemption).

#### Steps

1. The bearer constructs a Redemption Request: `pack_id`, their public key, a payout destination, and a timestamp.
2. The bearer signs the Redemption Request with their private key.
3. The bearer submits the Redemption Request plus the full cash-pack to the Operator's redemption endpoint.
4. The Operator verifies all signatures in the chain and confirms the bearer's identity.
5. The Operator marks the instrument `REDEEMED`, releases funds to the payout destination, and returns a signed Redemption Confirmation.

> **IMPORTANT:** The redeemer's identity is necessarily disclosed to the Operator at redemption. This is by design and is a regulatory requirement. The protocol does not attempt to conceal the redemption edge.

---

### 3.4 Using Disposable Keys: A Practical Guide

For maximum privacy, every participant other than the original requester should generate a fresh key pair specifically for each instrument received.

#### Generating a disposable key pair (Ed25519)

```bash
# Using OpenSSL:
openssl genpkey -algorithm ed25519 -out disposable_sk.pem
openssl pkey -in disposable_sk.pem -pubout -out disposable_pk.pem

# The public key (Base64url encoded) is what you share with the sender.
# The private key signs your Renewal or Redemption request.
# Discard both after the instrument is renewed or redeemed.
```

Application developers implementing CashPack-compatible wallets SHOULD make disposable key generation the default behavior, with reusable keys as an explicit opt-in.

---

### 3.5 Extended Use Cases

#### Tokenized Deposits

An Operator running a tokenized deposit system can issue cash-packs whose locked value corresponds to a tokenized deposit token held in escrow. The token is locked at issuance and transferred (or burned and reissued) at redemption. The cash-pack provides the privacy-preserving bearer layer on top of the token's settlement infrastructure.

#### Digital Securities and Bearer Bonds

A bond issuer acting as Operator can issue cash-packs representing bearer bond entitlements. The instrument is passed among investors without on-chain transfers at each step. Only the final holder's identity is disclosed at settlement. The renewal chain provides a complete provenance record for regulatory purposes.

#### Merchant Vouchers and Gift Instruments

A retailer or platform acting as Operator can issue cash-packs as vouchers or gift instruments. Recipients can pass them freely. Redemption is at point of sale or service, where the merchant's system acts as the Operator endpoint.

#### Cross-Border Payments *(Phase 2)*

Two Operators in different jurisdictions may establish a bilateral settlement agreement allowing one Operator's cash-packs to be redeemed by the other. The bearer chain crosses the border; only the redemption Operator needs to identify the redeemer. This phase requires inter-Operator protocol extensions not defined in CPP-1.0.

---

---

# Layer 4 — Governance

*Compliance, risk, and operator obligations*

---

## 4. Governance

### 4.1 Operator Eligibility

Any entity wishing to act as an Operator under this protocol MUST:

- Be licensed and regulated in the jurisdiction(s) where it operates.
- Maintain KYC and AML compliance programs applicable to its instrument type and jurisdiction.
- Be capable of locking and releasing funds with finality.
- Publish a Policy Document (see Section 4.4) before issuing any instruments.

This standard does not restrict which type of entity may be an Operator: traditional banks, electronic money institutions, payment service providers, digital asset custodians, and other regulated entities are all eligible, subject to their local licensing requirements.

### 4.2 Amount Limits and Regulatory Alignment

The privacy properties of this protocol are strongest for intermediate bearers who are not identified. To remain compatible with anti-money laundering and counter-terrorist financing regulations in most jurisdictions, Operators MUST enforce a per-instrument maximum amount.

The appropriate limit is jurisdiction-specific. Operators MUST consult their legal and compliance teams to determine the applicable threshold. Common reference points include:

| Jurisdiction | Reference Threshold |
|---|---|
| United States | USD 10,000 (Bank Secrecy Act cash transaction report threshold). |
| European Union | EUR 10,000 (4th/5th AMLD anonymous instrument threshold). |
| Brazil | BRL 10,000 (general cash transaction reference). |
| Others | Operators MUST determine the applicable threshold independently. |

> **IMPORTANT:** Setting the limit below the reporting threshold does not guarantee regulatory compliance. Operators remain responsible for their full AML program, including transaction monitoring, velocity controls, and suspicious activity reporting. This standard sets a structural floor, not a compliance ceiling.

### 4.3 Identity at the Edges

| Edge | Requirement |
|---|---|
| Issuance (Bob) | MUST be a KYC-verified account holder. Identity recorded by Operator at issuance. |
| Intermediate bearers | NOT required to be identified to the Operator. The protocol deliberately provides no mechanism for Operators to identify intermediate bearers. |
| Redemption (final bearer) | MUST be identifiable to the Operator. Either an existing account holder or a person completing KYC at redemption. Identity recorded at redemption. |

### 4.4 Operator Policy Document

Before issuing any cash-packs, an Operator MUST publish a Policy Document at a well-known URL:

```
RECOMMENDED: https://{operator-domain}/.well-known/cashpack-policy.json
```

The Policy Document MUST include:

- Supported protocol version (e.g., `CPP-1.0`).
- Maximum instrument amount per instrument.
- Maximum instrument lifetime *(RECOMMENDED: no more than 90 days)*.
- Maximum renewal chain depth *(RECOMMENDED: no fewer than 20 hops)*.
- Velocity limits (maximum active instruments per principal).
- Supported currencies.
- Redemption identity requirements.
- Operator signing public key (or reference to a JWKS endpoint).

### 4.5 Traceability

While intermediate bearers are not identified to the Operator, the protocol is not anonymous in the absolute sense. Social traceability exists: Alice received the instrument from Bob, who knows Alice's public key. John received it from Alice, who knows John's public key. The chain of custody mirrors the social trust network.

In a legal investigation, the Operator can produce the full `renewal_chain` (all public keys in order, with timestamps and signatures). Law enforcement may trace participants through subpoenas to communication providers, correlation with other transaction data, or voluntary disclosure. The protocol provides practical privacy for ordinary transactions, not legally impenetrable anonymity.

### 4.6 Operator Risk Controls

The following controls are RECOMMENDED for all Operator implementations:

| Control | Recommendation |
|---|---|
| Maximum instrument lifetime | No more than 90 days. Expired instruments return funds to the original requester. |
| Maximum chain depth | At least 20 hops supported. Operators MAY set a lower maximum subject to use case requirements. |
| Velocity limits | Maximum number of simultaneously active instruments per principal. |
| Aggregate exposure cap | Total value of all outstanding instruments. Subject to Operator's capital and liquidity management. |
| Cooling-off on redemption | Operators MAY impose a short delay on first-time redemption to facilitate AML monitoring. |
| Instrument freeze | Operators MUST have a mechanism to mark an instrument `CANCELLED` in response to a legal order, with funds held pending instruction. |

### 4.7 Regulatory Framing Guidance

Operators seeking regulatory approval or sandboxing for this instrument type are advised to frame it as follows:

> **RECOMMENDED FRAMING**
>
> *"A standardized, operator-controlled, privacy-preserving payment instrument with delayed traceability, strict value limits, and full operator authority — designed as a digital analogue of low-value physical cash."*

Operators should avoid framing that invokes cryptocurrency, virtual currency, decentralized money, or alternative monetary systems. The protocol is technically and legally closer to a prepaid instrument or cashier's cheque with bearer transferability than to any crypto asset.

---

---

# Layer 5 — Formal Specification

*Data structures, cryptographic rules, and protocol obligations*

---

## 5. Formal Specification

### 5.1 Normative Language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this layer are to be interpreted as described in RFC 2119.

### 5.2 Cryptographic Requirements

| Primitive | Requirement |
|---|---|
| Asymmetric signing | Ed25519 **(REQUIRED)**. ECDSA P-256 *(OPTIONAL for implementations with HSM constraints)*. |
| Hash function | SHA-256 for all chain digest computation. |
| Key encoding | Base64url (RFC 4648 § 5), no padding. |
| Signature encoding | Base64url, no padding. |
| Canonical JSON | RFC 8785 (JCS) MUST be applied to all JSON objects before signing. |
| Timestamp format | ISO 8601 / RFC 3339, UTC (e.g., `2025-06-01T14:30:00Z`). |

#### Chain Digest Computation

```
chain_digest[0] = SHA256(canonical_json(lock_request))
chain_digest[n] = SHA256(chain_digest[n-1] || canonical_json(renewal_entry[n]))
// || denotes concatenation of raw bytes
```

### 5.3 Lock Request

Constructed by the Principal. Signed with the Principal's private key. Submitted to the Issuance endpoint.

| Field | Type | Description |
|---|---|---|
| `version` | string | MUST be `"CPP-1.0"`. |
| `request_id` | string (UUIDv4) | Unique ID generated by the Principal. |
| `timestamp` | string (RFC 3339) | Creation time. |
| `operator_id` | string | Unique identifier of the target Operator. |
| `principal_pk` | string (Base64url) | Principal's public key. |
| `initial_bearer_pk` | string (Base64url) | Public key of the intended first bearer. |
| `amount` | integer | Amount in smallest currency unit (e.g., cents). |
| `currency` | string (ISO 4217) | e.g., `"USD"`, `"EUR"`, `"BRL"`. |
| `expiry` | string (RFC 3339) | Expiry set by Operator policy. |
| `memo_hash` | string (hex, optional) | SHA-256 of a private memo. Not stored in plaintext. |
| `principal_signature` | string (Base64url) | Signature over canonical JSON of all fields above. |

### 5.4 Cash-Pack Instrument

Constructed by the Operator at issuance. Operator-signed. Updated at each renewal.

| Field | Type | Description |
|---|---|---|
| `version` | string | `"CPP-1.0"` |
| `pack_id` | string (UUIDv4) | Globally unique. Assigned by Operator at issuance. |
| `operator_id` | string | Issuing Operator identifier. |
| `amount` | integer | Locked amount. Immutable after issuance. |
| `currency` | string (ISO 4217) | Currency. Immutable after issuance. |
| `issued_at` | string (RFC 3339) | Operator's issuance timestamp. |
| `expiry` | string (RFC 3339) | Expiry datetime. |
| `status` | string (enum) | `ACTIVE` \| `REDEEMED` \| `EXPIRED` \| `CANCELLED` |
| `current_bearer_pk` | string (Base64url) | Public key of the current authorized bearer. |
| `lock_request` | object | Full original Lock Request object. |
| `renewal_chain` | array | Ordered array of Renewal Entry objects. Empty at issuance. |
| `chain_digest` | string (hex) | Current chain digest. |
| `operator_signature` | string (Base64url) | Operator signature over canonical JSON of all above fields (excluding this field). |

### 5.5 Renewal Entry

Constructed by the outgoing bearer. Counter-signed by the Operator. Appended to `renewal_chain`.

| Field | Type | Description |
|---|---|---|
| `renewal_id` | string (UUIDv4) | Unique ID for this renewal. |
| `timestamp` | string (RFC 3339) | Renewal request time. |
| `outgoing_bearer_pk` | string (Base64url) | Current bearer's public key. MUST match `current_bearer_pk`. |
| `incoming_bearer_pk` | string (Base64url) | New bearer's public key. |
| `prev_chain_digest` | string (hex) | Chain digest before this renewal. Used for binding. |
| `outgoing_bearer_signature` | string (Base64url) | Signature over canonical JSON of all above fields. |
| `operator_renewal_signature` | string (Base64url) | Operator countersignature over canonical JSON of all fields including bearer signature. |

### 5.6 Redemption Request

Constructed by the current bearer (redeemer). Signed with the redeemer's private key.

| Field | Type | Description |
|---|---|---|
| `pack_id` | string (UUIDv4) | Instrument being redeemed. |
| `timestamp` | string (RFC 3339) | Request time. |
| `redeemer_pk` | string (Base64url) | Redeemer's public key. MUST match `current_bearer_pk`. |
| `destination` | object | Operator-defined payout destination schema. |
| `redeemer_signature` | string (Base64url) | Signature over canonical JSON of all above fields. |

### 5.7 Protocol Obligations

#### Issuance

1. Operator MUST authenticate the Principal (account holder verification).
2. Operator MUST verify `principal_signature` on the Lock Request.
3. Operator MUST verify available balance ≥ `amount`.
4. Operator MUST verify `amount` ≤ Operator's configured maximum.
5. Operator MUST lock the amount before issuing the instrument.
6. Operator MUST set `current_bearer_pk` = `initial_bearer_pk` from the Lock Request.
7. Operator MUST compute `chain_digest[0]` = `SHA256(canonical_json(lock_request))`.
8. Operator MUST sign the full instrument and return it.

#### Renewal

1. Operator MUST verify its own prior `operator_signature` on the submitted instrument.
2. Operator MUST verify instrument `status` = `ACTIVE` and expiry has not passed.
3. Operator MUST verify `outgoing_bearer_pk` = `current_bearer_pk`.
4. Operator MUST verify `outgoing_bearer_signature` on the Renewal Entry.
5. Operator MUST verify `prev_chain_digest` matches the instrument's current `chain_digest`.
6. Operator MUST verify renewal chain depth has not exceeded its configured maximum.
7. Operator MUST update `current_bearer_pk` = `incoming_bearer_pk`.
8. Operator MUST compute new `chain_digest` and re-sign the updated instrument.
9. Operator MUST record the `renewal_id` and reject duplicate `renewal_id` values.

#### Redemption

1. Operator MUST verify the full instrument signature chain.
2. Operator MUST verify `redeemer_pk` = `current_bearer_pk`.
3. Operator MUST verify `redeemer_signature` on the Redemption Request.
4. Operator MUST verify instrument `status` = `ACTIVE` and not expired.
5. Operator MUST verify the redeemer's identity per its compliance policy.
6. Operator MUST mark the instrument `REDEEMED` before releasing funds.
7. Operator MUST release locked funds to the specified destination.

---

---

# Layer 6 — Reference

*Endpoints, error codes, algorithms, and glossary*

---

## 6. Reference

### 6.1 Mandatory API Endpoints

| Endpoint | Description |
|---|---|
| `POST /v1/cashpack/issue` | Submit a Lock Request. Returns a signed cash-pack on success. |
| `POST /v1/cashpack/renew` | Submit a cash-pack plus a Renewal Entry. Returns updated signed cash-pack. |
| `POST /v1/cashpack/redeem` | Submit a Redemption Request plus the cash-pack. Returns Redemption Confirmation. |
| `GET /v1/cashpack/{pack_id}/status` | Query instrument status. Restricted: available to issuing Principal and Operator only. |

### 6.2 Transport Requirements

- All endpoints MUST be served over TLS 1.3 or higher.
- `Content-Type: application/json` on all requests and responses.
- The `issue` and `status` endpoints MUST require authenticated sessions (OAuth 2.0, mTLS, or equivalent).
- The `renew` and `redeem` endpoints accept unauthenticated sessions; bearer authorization is derived from cryptographic signature verification.

### 6.3 Well-Known Resources

| URL | Purpose |
|---|---|
| `/.well-known/cashpack-policy.json` | Operator Policy Document (see Section 4.4). |
| `/.well-known/cashpack-pubkey.json` | Operator's current public signing key in JWK format (RFC 7517). |

### 6.4 Error Codes

| Error Code | Meaning |
|---|---|
| `INSUFFICIENT_BALANCE` | Principal's available balance is less than the requested amount. |
| `AMOUNT_EXCEEDS_LIMIT` | Amount exceeds the Operator's configured maximum. |
| `INVALID_SIGNATURE` | One or more signatures failed verification. |
| `BEARER_MISMATCH` | Submitting public key does not match `current_bearer_pk`. |
| `CHAIN_DIGEST_MISMATCH` | `prev_chain_digest` does not match the instrument's current `chain_digest`. |
| `INSTRUMENT_NOT_ACTIVE` | Instrument status is `REDEEMED`, `EXPIRED`, or `CANCELLED`. |
| `CHAIN_DEPTH_EXCEEDED` | `renewal_chain` has reached the Operator's configured maximum depth. |
| `REDEEMER_NOT_IDENTIFIED` | Redeemer could not be verified to the required identity level. |
| `DUPLICATE_ID` | `request_id` or `renewal_id` has been seen before (replay prevention). |
| `EXPIRY_INVALID` | Requested expiry is outside the Operator's permitted range. |

### 6.5 Versioning

The `version` field is set to `"CPP-1.0"` for this specification. Future versions will increment the minor version for backward-compatible additions and the major version for breaking changes. Operators MUST reject instruments with unrecognized major versions. Extensions MAY be added in an `extensions` object within any structure and MUST be ignored by non-recognizing implementations.

### 6.6 Normative References

| Reference | Description |
|---|---|
| RFC 2119 | Key words for use in RFCs to Indicate Requirement Levels. |
| RFC 3339 | Date and Time on the Internet: Timestamps. |
| RFC 4648 | The Base16, Base32, and Base64 Data Encodings. |
| RFC 7517 | JSON Web Key (JWK). |
| RFC 8032 | Edwards-Curve Digital Signature Algorithm (EdDSA). |
| RFC 8785 | JSON Canonicalization Scheme (JCS). |
| ISO 4217 | Currency Codes. |
| FIPS 180-4 | Secure Hash Standard (SHA-2 family). |

### 6.7 Glossary

| Term | Definition |
|---|---|
| Bearer | The entity currently authorized to renew or redeem a cash-pack, identified by control of the private key corresponding to `current_bearer_pk`. |
| cash-pack | The signed digital instrument defined in this specification. |
| Chain Digest | A rolling SHA-256 hash binding each entry in the renewal chain to all previous entries. |
| Disposable Key Pair | An asymmetric key pair generated for a single instrument, then discarded after use. |
| Initial Bearer | The first recipient of a cash-pack, whose public key is specified in the Lock Request. |
| Intermediate Bearer | Any bearer who renews the instrument rather than redeeming it. |
| Lock Request | The signed message submitted by the Principal to initiate issuance. |
| Operator | The regulated entity that issues, countersigns, and redeems cash-packs. |
| Principal | The identified account holder who requests issuance ("Bob" in examples). |
| Renewal | The act of updating `current_bearer_pk` to a new public key, transferring bearer rights. |
| Redemption | The final conversion of a cash-pack into spendable funds by the current bearer. |

---

---

*CashPack Protocol CPP-1.0 — DRAFT — Infrastructure-Agnostic — For Discussion and Adoption*

*© 2026 Fabric Payment Standards Foundation — Licensed under Apache License 2.0*