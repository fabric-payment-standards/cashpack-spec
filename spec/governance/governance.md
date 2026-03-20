---
title: Governance
description: Operator eligibility, compliance obligations, amount limits, identity requirements, and risk controls for CashPack Protocol deployments.
---

# CashPack Protocol — Governance

> **Layer 4 of 6** · Audience: compliance officers, legal teams, regulators, risk managers  
> For normative protocol requirements, see [Formal Specification](../SPEC.md).

---

## 1. Operator Eligibility

Any entity wishing to act as an Operator under this protocol must:

- Be licensed and regulated in the jurisdiction(s) where it operates.
- Maintain KYC and AML compliance programmes applicable to its instrument type and jurisdiction.
- Be capable of locking and releasing funds with finality.
- Publish a Policy Document (see [Section 4](#4-operator-policy-document)) before issuing any instruments.

This standard does not restrict which type of entity may be an Operator. Traditional banks, electronic money institutions, payment service providers, digital asset custodians, and other regulated entities are all eligible, subject to their local licensing requirements.

---

## 2. Amount Limits and Regulatory Alignment

The privacy properties of this protocol are strongest for intermediate bearers who are not identified. To remain compatible with anti-money laundering and counter-terrorist financing regulations in most jurisdictions, Operators must enforce a per-instrument maximum amount.

The appropriate limit is jurisdiction-specific. Operators must consult their legal and compliance teams to determine the applicable threshold. Common reference points:

| Jurisdiction | Reference Threshold |
|---|---|
| United States | USD 10,000 (Bank Secrecy Act cash transaction report threshold) |
| European Union | EUR 10,000 (4th/5th AMLD anonymous instrument threshold) |
| Brazil | BRL 10,000 (general cash transaction reference) |
| Others | Operators must determine the applicable threshold independently |

:::important Limits are a structural floor, not a compliance ceiling
Setting the limit below the reporting threshold does not guarantee regulatory compliance. Operators remain responsible for their full AML programme, including transaction monitoring, velocity controls, and suspicious activity reporting.
:::

---

## 3. Identity at the Edges

| Edge | Requirement |
|---|---|
| **Issuance (Principal)** | Must be a KYC-verified account holder. Identity recorded by Operator at issuance. |
| **Intermediate bearers** | Not required to be identified to the Operator. The protocol deliberately provides no mechanism for Operators to identify intermediate bearers. |
| **Redemption (final bearer)** | Must be identifiable to the Operator — either an existing account holder or a person completing KYC at redemption. Identity recorded at redemption. |

This edge-KYC model is the foundation of the protocol's privacy architecture. The Operator can satisfy regulatory identity obligations at the two endpoints of every instrument's lifecycle without tracking intermediate transfers.

---

## 4. Operator Policy Document

Before issuing any cash-packs, an Operator must publish a Policy Document at a well-known URL:

```
https://{operator-domain}/.well-known/cashpack-policy.json
```

The Policy Document must include:

- Supported protocol version (e.g., `CPP-1.0`).
- Maximum instrument amount per instrument.
- Maximum instrument lifetime *(recommended: no more than 90 days)*.
- Maximum renewal chain depth *(recommended: no fewer than 20 hops)*.
- Velocity limits (maximum active instruments per Principal).
- Supported currencies.
- Redemption identity requirements.
- Operator signing public key (or reference to a JWKS endpoint).

---

## 5. Traceability

While intermediate bearers are not identified to the Operator, the protocol is not anonymous in the absolute sense. **Social traceability exists:** Alice received the instrument from Bob, who knows Alice's public key. John received it from Alice, who knows John's public key. The chain of custody mirrors the social trust network through which the instrument travels.

In a legal investigation, the Operator can produce the full `renewal_chain` — all public keys in order, with timestamps and signatures. Law enforcement may trace participants through subpoenas to communication providers, correlation with other transaction data, or voluntary disclosure.

The protocol provides **practical privacy for ordinary transactions**, not legally impenetrable anonymity. It is designed to be the digital equivalent of low-value physical cash — not an instrument for circumventing law enforcement.

---

## 6. Operator Risk Controls

The following controls are recommended for all Operator implementations:

| Control | Recommendation |
|---|---|
| Maximum instrument lifetime | No more than 90 days. Expired instruments return funds to the original requester. |
| Maximum chain depth | At least 20 hops supported. Operators may set a lower maximum subject to use case requirements. |
| Velocity limits | Maximum number of simultaneously active instruments per Principal. |
| Aggregate exposure cap | Total value of all outstanding instruments, subject to Operator's capital and liquidity management. |
| Cooling-off on redemption | Operators may impose a short delay on first-time redemption to facilitate AML monitoring. |
| Instrument freeze | Operators must have a mechanism to mark an instrument `CANCELLED` in response to a legal order, with funds held pending instruction. |

---

## 7. Regulatory Framing Guidance

Operators seeking regulatory approval or sandboxing for this instrument type are advised to frame it as follows:

> *"A standardised, operator-controlled, privacy-preserving payment instrument with delayed traceability, strict value limits, and full operator authority — designed as a digital analogue of low-value physical cash."*

Operators should avoid framing that invokes cryptocurrency, virtual currency, decentralised money, or alternative monetary systems. The protocol is technically and legally closer to a prepaid instrument or cashier's cheque with bearer transferability than to any crypto asset.

---

*CashPack Protocol CPP-1.0 · DRAFT · Infrastructure-Agnostic · For Discussion and Adoption*  
*© 2026 Fabric Payment Standards Foundation — Licensed under Apache License 2.0*