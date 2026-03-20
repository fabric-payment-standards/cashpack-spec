---
title: Overview
description: What the CashPack Protocol is, why it exists, and what problems it solves.
---

# CashPack Protocol — Overview

> **Layer 1 of 6** · Audience: executives, regulators, institutional evaluators, press  
> For normative protocol requirements, see [Formal Specification](../SPEC.md).

---

## 1. The Problem

Digital payments today expose every party in a transaction to the payment network at every step. The sender, the receiver, the amount, and the timestamp are all recorded by intermediaries — by design, for fraud prevention and regulatory compliance. But this eliminates the practical privacy that individuals have long exercised with physical cash.

Physical cash allows a person to pass value to another without that transfer being recorded by a bank, a network, or a government. Each participant in the chain is identified only to the person immediately before and after them. The system works because the instrument — the banknote — is the bearer of value, not an account ledger entry.

No digital equivalent of this exists at scale today. Blockchain-based systems introduced bearer-like properties, but at the cost of public ledgers, volatility, and regulatory friction. Account-based digital money is entirely trackable. The CashPack Protocol fills this gap.

---

## 2. The Solution

The CashPack Protocol defines a signed, transferable digital instrument — the **cash-pack** — that can be passed from person to person without each transfer being recorded by the Operator.

An identified account holder (the Principal) asks a licensed Operator to lock a specific amount and issue a cash-pack addressed to a recipient identified only by a public key. That recipient can pass it to the next person, who can pass it to the next, each time asking the Operator to update the bearer field. The Operator countersigns every update. The final holder redeems it.

**The Operator sees who locked the funds and who redeemed them. The intermediate chain is visible only to its participants.**

This is structurally analogous to how physical cash works — with three critical improvements: cryptographic verification at every step, a tamper-evident audit trail available to authorised investigators, and no physical transport risk.

---

## 3. Infrastructure Agnosticism

The CashPack Protocol is a behavioural standard. It defines data structures, cryptographic rules, and protocol flows. It does not mandate any particular settlement or record-keeping infrastructure.

| Settlement Layer | Compatibility |
|---|---|
| Traditional core banking | Fully supported. The Operator's internal ledger records the lock and the redemption. Cash-pack data is stored off-ledger or in any database. |
| Tokenized deposits | Fully supported. The locked amount can be represented as a tokenized deposit; the cash-pack is the bearer wrapper around it. |
| Permissioned distributed ledger | Fully supported. The Operator may record instrument state on a permissioned ledger for auditability while maintaining intermediate privacy. |
| Public blockchain | Supported as a settlement layer for Operators who choose it. The protocol places no requirement on this choice. |
| Digital securities / bearer bonds | The instrument structure generalises to any locked value — bonds, commodities, or other financial instruments. |

Choosing the settlement layer is an Operator implementation decision. The Operator must be able to lock value at issuance and release it at redemption. Everything else is up to the Operator.

---

## 4. Target Use Cases

- **Person-to-person domestic transfers** where sender and receiver prefer not to expose their relationship to the financial system.
- **Merchant payments** where the payer wants cash-like privacy at point of sale.
- **Gift instruments, vouchers, and prepaid value** that can be freely passed before redemption.
- **Tokenized deposit wrappers** enabling privacy-preserving transfer of bank money.
- **Digital securities and bearer bonds** that need to change hands without on-ledger transfers at every hop.
- **Cross-border payments** *(Phase 2)*: with inter-Operator settlement agreements, instruments issued by one Operator may be honoured by another.

---

## 5. What This Standard Covers

- Data structures for all instrument lifecycle states.
- Cryptographic requirements for signing and chain integrity.
- Protocol flows for issuance, transfer (renewal), and redemption.
- Operator interface requirements (endpoints, error codes).
- Governance obligations for Operators (limits, compliance, reporting).

**Out of scope:** specific key management architectures, banking system integration, currency exchange, inter-Operator settlement protocols, and any distributed consensus mechanism.

---

## 6. Document Map

| Layer | Document | Purpose |
|---|---|---|
| 1 | **Overview** *(this document)* | What this is and why it exists |
| 2 | [Core Concepts](../core-concepts) | Mental models and key ideas |
| 3 | [Guides](../guides) | How to use it — flows, privacy, disposable keys |
| 4 | [Governance](../governance) | Compliance, risk, and Operator obligations |
| 5 | [Formal Specification](../SPEC.md) | **Normative.** Data structures and protocol rules |
| 6 | [Reference](../reference) | Algorithms, endpoints, error codes, glossary |

---

*CashPack Protocol CPP-1.0 · DRAFT · Infrastructure-Agnostic · For Discussion and Adoption*  
*© 2026 Fabric Payment Standards Foundation — Licensed under Apache License 2.0*