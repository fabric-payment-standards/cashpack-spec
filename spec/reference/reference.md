---
title: Reference
description: API endpoints, transport requirements, error codes, versioning, and glossary for the CashPack Protocol.
---

# CashPack Protocol — Reference

> **Layer 6 of 6** · Audience: developers (daily reference)  
> For normative protocol requirements, see [Formal Specification](../SPEC.md).

---

## 1. Mandatory API Endpoints

| Endpoint | Description |
|---|---|
| `POST /v1/cashpack/issue` | Submit a Lock Request. Returns a signed cash-pack on success. |
| `POST /v1/cashpack/renew` | Submit a cash-pack plus a Renewal Entry. Returns updated signed cash-pack. |
| `POST /v1/cashpack/redeem` | Submit a Redemption Request plus the cash-pack. Returns Redemption Confirmation. |
| `GET /v1/cashpack/{pack_id}/status` | Query instrument status. Restricted: available to issuing Principal and Operator only. |

---

## 2. Transport Requirements

- All endpoints MUST be served over TLS 1.3 or higher.
- `Content-Type: application/json` on all requests and responses.
- The `issue` and `status` endpoints MUST require authenticated sessions (OAuth 2.0, mTLS, or equivalent).
- The `renew` and `redeem` endpoints accept unauthenticated sessions; bearer authorisation is derived from cryptographic signature verification.

---

## 3. Well-Known Resources

| URL | Purpose |
|---|---|
| `/.well-known/cashpack-policy.json` | Operator Policy Document (see [Governance §4](../governance/governance.md#4-operator-policy-document)). |
| `/.well-known/cashpack-pubkey.json` | Operator's current public signing key in JWK format (RFC 7517). |

---

## 4. Error Codes

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

---

## 5. Instrument Status Values

| Status | Meaning |
|---|---|
| `ACTIVE` | Instrument is valid and can be renewed or redeemed. |
| `REDEEMED` | Instrument has been redeemed. Funds have been released. Terminal state. |
| `EXPIRED` | Instrument reached its expiry datetime without redemption. Funds returned to Principal. Terminal state. |
| `CANCELLED` | Instrument was cancelled by the Operator, typically in response to a legal order. Funds held pending instruction. Terminal state. |

---

## 6. Glossary

| Term | Definition |
|---|---|
| **Bearer** | The entity currently authorised to renew or redeem a cash-pack, identified by control of the private key corresponding to `current_bearer_pk`. |
| **cash-pack** | The signed digital instrument defined in this specification. |
| **Chain Digest** | A rolling SHA-256 hash binding each entry in the renewal chain to all previous entries. |
| **Disposable Key Pair** | An asymmetric key pair generated for a single instrument, then discarded after use. |
| **Initial Bearer** | The first recipient of a cash-pack, whose public key is specified in the Lock Request. |
| **Intermediate Bearer** | Any bearer who renews the instrument rather than redeeming it. Intermediate bearers are not identified to the Operator. |
| **Lock Request** | The signed message submitted by the Principal to initiate issuance. |
| **Operator** | The regulated entity that issues, countersigns, and redeems cash-packs. |
| **Principal** | The identified account holder who requests issuance. |
| **Renewal** | The act of updating `current_bearer_pk` to a new public key, transferring bearer rights to the next holder. |
| **Redemption** | The final conversion of a cash-pack into spendable funds by the current bearer. |

---

*CashPack Protocol CPP-1.0 · DRAFT · Infrastructure-Agnostic · For Discussion and Adoption*  
*© 2026 Fabric Payment Standards Foundation — Licensed under Apache License 2.0*