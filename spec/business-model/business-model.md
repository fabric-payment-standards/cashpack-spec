---
title: CashPack Business Models
description: Revenue models, commercial applications, and deployment strategies for Operators building on the CashPack Protocol (CPP-1.0).
---

# CashPack Business Models

## Table of Contents

- [1. Core Operator Revenue](#1-core-operator-revenue)
  - [1.1 Issuance & Redemption Fee Model](#11--issuance--redemption-fee-model)
  - [1.2 Float Income on Locked Funds](#12--float-income-on-locked-funds)
  - [1.3 API-as-a-Service (Operator Platform)](#13--api-as-a-service-operator-platform)

- [2. Banking & Payments Integrations](#2-banking--payments-integrations)
  - [2.1 Bank-Issued Cash-Pack as a Premium Account Feature](#21--bank-issued-cash-pack-as-a-premium-account-feature)
  - [2.2 Privacy-Preserving Remittance Corridor](#22--privacy-preserving-remittance-corridor)
  - [2.3 Merchant Acceptance Network](#23--merchant-acceptance-network)
  - [2.4 Tokenized Deposit Wrapper](#24--tokenized-deposit-wrapper)

- [3. Platform & Marketplace Models](#3-platform--marketplace-models)
  - [3.1 Corporate Gift & Voucher Platform](#31--corporate-gift--voucher-platform)
  - [3.2 Escrow-as-a-Service for Marketplaces](#%EF%B8%8F-escrow-as-a-service-for-marketplaces)
  - [3.2 Anonymous Payroll Advance (Earned Wage Access)](#32--anonymous-payroll-advance-earned-wage-access)

- [4. Novel & Unorthodox Models](#4-novel--unorthodox-models)
  - [4.1 Whistleblower & Source Protection Payments](#41--whistleblower--source-protection-payments)
  - [4.2 Digital Bearer Bond Issuance Platform](#42--digital-bearer-bond-issuance-platform)
  - [4.3 Healthcare Payment Privacy Layer](#43--healthcare-payment-privacy-layer)
  - [4.4 Peer-to-Peer Privacy Gift Economy](#44--peer-to-peer-privacy-gift-economy)
  - [4.5 Structured Settlement & Legal Payment Privacy](#45--structured-settlement--legal-payment-privacy)

- [Summary](#summary)
- [Get Involved](#get-involved)
---

> **Who this is for:** Licensed financial institutions, payment service providers, fintech ventures, and institutional entrepreneurs evaluating the CashPack Protocol as a commercial foundation.

The CashPack Protocol (CPP-1.0) is a behavioural standard. It defines how bearer instruments are issued, transferred, and redeemed — not how Operators monetise them. That commercial design space is deliberately open.

This document maps the principal revenue models available to Operators, from straightforward fee-and-float structures already validated by the prepaid industry to genuinely novel instrument classes that CPP-1.0 makes possible for the first time.

Models are grouped by deployment context. Each entry describes the commercial mechanics, indicative revenue potential, and strategic considerations relevant to institutions evaluating adoption.

---

## 1. Core Operator Revenue

These models are available to any licensed Operator from day one. They do not require novel regulatory framing or Phase 2 inter-Operator capabilities.

---

### 1.1 🏦 Issuance & Redemption Fee Model

**The baseline revenue line — structurally identical to how prepaid card networks earn.**

The Operator charges a basis-point fee on each instrument issued, redeemed, or both. This is the simplest and most defensible revenue structure: a direct charge for providing the bearer instrument service.

**Mechanics.** A fee of 0.3–1.5% is debited from the principal's locked amount at issuance, or assessed as a flat charge at redemption. Both sides can be combined. A floor fee (e.g., minimum $0.10) protects unit economics on small-denomination instruments.

**Revenue profile.** At $50 average instrument value and 100,000 instruments per month, a 0.75% issuance fee generates approximately $37,500 in monthly recurring revenue with near-zero marginal cost after infrastructure.

**Strategic note.** This is the baseline. Every other model in this document stacks on top of it. The fee must remain below the friction threshold at which users revert to physical cash — empirically around 1–2% for low-value domestic transfers.

---

### 1.2 ⏳ Float Income on Locked Funds

**Scale-dependent, high-margin — the second revenue line for every mature prepaid operator.**

Every issued cash-pack locks the principal's funds with the Operator for up to 90 days. That aggregate float is investable. Visa, PayPal, and every major prepaid programme earn substantial income on exactly this mechanism.

**Mechanics.** The Operator holds aggregate locked balances in short-duration instruments — Treasury bills, overnight repo, or other high-quality liquid assets. No additional customer-facing product is required.

**Revenue profile.** At $100M in outstanding float and a 4.5% annualised yield, net float income exceeds $4M per year. This is frequently the largest single P&L line for mature prepaid operators. The 90-day instrument lifetime specified in CPP-1.0 governance is generous relative to typical prepaid programmes.

**Strategic note.** Float income incentivises longer instrument lifetimes. Operators should monitor the tension between maximising float duration and ensuring instruments are redeemed before expiry — expired instruments return funds to the original requester and terminate the float period.

---

### 1.3 🔌 API-as-a-Service (Operator Platform)

**License the Operator role itself. You become the regulated rails; others build the product.**

The most capital-efficient deployment for a licensed institution is to white-label Operator capabilities to fintechs, retailers, and platforms that want CashPack functionality but lack a payment licence. This is structurally analogous to Stripe's model — regulated infrastructure sold as API access.

**Mechanics.** B2B customers integrate your Operator endpoint, issue instruments under your regulatory umbrella, and build their own product layers. You charge a monthly platform fee plus per-instrument pricing. KYC delegation and liability frameworks must be defined in the partnership agreement.

**Revenue profile.** Platform fees of $2,000–$20,000/month depending on volume tier, plus $0.05–$0.25 per instrument. Fifty B2B customers at an average of $5,000/month yields $3M ARR before per-instrument revenue.

**Strategic note.** The highest-leverage model for any institution already running the infrastructure. Marginal cost per additional B2B customer approaches zero once onboarding is standardised.

---

## 2. Banking & Payments Integrations

These models target deployment within existing banking relationships, correspondent networks, and merchant acceptance infrastructure.

---
.
### 2.1 💳 Bank-Issued Cash-Pack as a Premium Account Feature

**A privacy-tier account differentiator — the digital successor to the cashier's cheque.**

Retail banks can offer CashPack issuance as a feature of premium or private banking tiers, positioning it as a privacy-preserving alternative to standard wire transfer. The instrument resonates particularly with the 35–55 demographic that banks are losing to neobanks.

**Mechanics.** Issuance access is gated to Gold/Platinum account tiers, with the cost absorbed by the monthly account fee. Alternatively, offered as a fee-based add-on at $2–$5 per instrument to all current account holders.

**Revenue profile.** If 5% of a one-million-customer base generates two instruments per month at $2 each, that yields $200,000 in monthly fee revenue. The strategic value — reduced churn and competitive differentiation — exceeds the direct fee income.

**Strategic note.** "Your transfers, your business" is a product message with genuine traction in a market where every neobank competes on cashback. Privacy is a durable differentiator, not a feature cycle.

---

### 2.2 🌍 Privacy-Preserving Remittance Corridor

**Sub-2% cross-border transfers that expose only the sending and receiving institutions — available in Phase 2.**

With inter-Operator settlement agreements (Phase 2 of the protocol), a bank or money services business can offer cross-border cash-pack transfers that cloaks the correspondent bank on the chain. The instrument is issued by the sender's institution and redeemed at the recipient's, with intermediate routing entirely off-ledger.

**Mechanics.** Partner with one regulated Operator per target corridor. The sending institution issues a cash-pack; the recipient redeems through the partner Operator. Transfer fee of 1–2% sits well below the global average. FX spread provides a second revenue line.

**Revenue profile.** The global remittance market carries average fees of 6.2% (World Bank, 2023). A 1.5% corridor product applied to a $500M annual flow generates $7.5M per corridor at dramatically lower infrastructure cost than traditional correspondent banking.

**Strategic note.** This model requires inter-Operator extensions not yet defined in CPP-1.0. It is commercially compelling enough to justify early investment in bilateral settlement agreements with overseas counterparts.

---

### 2.3 🏪 Merchant Acceptance Network

**Interchange-equivalent fee income — without the card network intermediary.**

Operators can build or join a merchant network that accepts cash-packs at point of sale. On each merchant redemption, the Operator deducts a settlement fee before crediting the merchant — similar in economics to card interchange, but without the card scheme taking a cut.

**Mechanics.** Merchants integrate the `/redeem` endpoint. The Operator charges 0.5–1.5% per redemption, with volume discounts to incentivise adoption. Any Operator whose instruments a merchant accepts earns the fee — creating a competitive open-network dynamic rather than a closed-loop system.

**Revenue profile.** A network of 500 merchants averaging 200 transactions per month at $30 and 1% fee yields $300,000 in monthly recurring revenue. A focused vertical — gift vouchers for a national retailer, for example — substantially de-risks the initial build.

---

### 2.4 🔒 Tokenized Deposit Wrapper

**A privacy layer for tokenized deposit pilots and digital currency programmes.**

Banks operating tokenized deposit pilots, CBDC sandboxes, or internal stablecoin programmes can use cash-packs as the bearer-transfer interface on top of the token — gaining privacy-preserving transferability without rewriting token infrastructure.

**Mechanics.** The tokenized deposit is held in custody at the bank. The cash-pack instrument wraps it, providing the bearer-transfer interface defined in CPP-1.0. The bank earns the token's underlying yield; the CashPack layer earns an additional wrapper fee of 25–50 basis points per year on wrapped value.

**Revenue profile.** If a bank has $500M in tokenized deposits and wraps 10% in CashPack instruments, a 0.3% annual wrapper fee generates $150,000 per year with near-zero incremental operational cost.

**Strategic note.** Several central banks and multilateral bodies — including the BIS Innovation Hub and the ECB digital euro project — are actively exploring programmable money with privacy properties. Early Operator engagement positions institutions as credible private-sector partners when regulatory frameworks mature.

---

## 3. Platform & Marketplace Models

These models deploy CashPack instruments as the settlement layer within specific industry verticals.

---

### 3.1 🎁 Corporate Gift & Voucher Platform

**The transferable alternative to fixed-merchant gift cards — in a $242B market.**

Cash-packs are structurally superior to conventional corporate gift instruments: they are denominated in currency, not loyalty points, and can be freely transferred before redemption. This makes them materially more attractive to recipients and more defensible to issuers.

**Mechanics.** Corporate buyers purchase instruments in bulk via a self-serve dashboard. Instruments are transferable and redeemable at any accepting merchant or via bank transfer. The Operator earns 2–4% on face value at issuance.

**Revenue profile.** The global corporate gifting market is approximately $242B (IMARC Group, 2023). A focused digital-cash-gift product for enterprise customers at an average $50,000 contract and 3% margin yields $1,500 per customer in direct fee income, compounded by float. Five hundred enterprise customers generates $750,000 per year before float.

**Strategic note.** The key differentiator against Amazon Business or corporate card programmes: the recipient can pass the instrument on as a genuine cash gift. The privacy dimension resonates in HR contexts where employees are aware that employer-issued gift cards can be monitored for spend category.

---

### ⚖️ Escrow-as-a-Service for Marketplaces

**Programmable escrow for two-sided markets — with the Operator as neutral third party.**

Any two-sided marketplace requiring trust-in-transfer — freelance platforms, real estate, M&A earnouts — can use a cash-pack as programmable escrow: funds locked by the buyer, released to the seller on delivery, with the Operator holding the release trigger.

**Mechanics.** The buyer issues a cash-pack to an escrow address controlled by the marketplace. On confirmed delivery, the marketplace signals the Operator to transfer bearer rights to the seller (or return to the buyer on dispute). The Operator charges 0.5–1% of the escrowed amount.

**Revenue profile.** Mid-market M&A and real estate earnouts are the primary opportunity: escrow fees of 0.25–1% on million-dollar transactions yield $2,500–$10,000 per engagement. Freelance platform volume at scale adds meaningful throughput.

**Strategic note.** The legal architecture of the dispute resolution layer requires careful design — the entity authorising release or return should be a licensed escrow attorney or fiduciary, not the Operator acting unilaterally. Build this as a partnership, not a standalone product.

---

### 3.2 🪙 Anonymous Payroll Advance (Earned Wage Access)

**Privacy-preserving earned wage access — a first-of-kind model with structural labour market advantage.**

Employers can pre-fund cash-pack pools enabling shift workers to access earned wages before payday — without individual advance transactions appearing in employer payment logs. Workers access liquidity on their own terms; employers see only aggregate utilisation.

**Mechanics.** The employer pre-funds a pool with the Operator. Workers request advances via a consumer app (authenticated to the Operator, not the employer). The Operator issues instruments; the employer sees aggregate utilisation data, not per-worker transactions.

**Revenue profile.** Earned wage access processed approximately $9.5B in the US in 2023 (CFPB) and is growing at over 20% per year. A privacy-preserving tier commanding $4 per advance, applied to 10M advances per year, yields $40M in fee revenue at scale.

**Strategic note.** The privacy framing is a genuine labour market advantage: workers are significantly more likely to use advances they know their employer cannot monitor at the transaction level. This directly addresses the primary reason workers cite for avoiding employer-sponsored EWA programmes.

:::note First-of-kind model
This model has no direct precedent in existing earned wage access deployments. The privacy architecture depends on CPP-1.0's separation of principal identity from bearer chain.
:::

---

## 4. Novel & Unorthodox Models

The following models represent commercial opportunities that are either impossible or legally precarious on existing payment rails — and become viable under CPP-1.0's edge-KYC architecture.

---

### 4.1 🕵️ Whistleblower & Source Protection Payments

**Mission-aligned infrastructure for investigative journalism, legal defence funds, and NGOs.**

Investigative journalism organisations, law firms, and human rights bodies need to compensate sources and informants without creating a traceable payment record. CashPack resolves this: the funding institution is the KYC-verified principal; the recipient redeems as a new customer with standard Operator KYC. No mid-chain record connects the two.

**Mechanics.** A journalism fund or NGO issues instruments to anonymous source identifiers known only to editorial staff. The source redeems via any bank account. The fund is identified at issuance; the source is identified at redemption. No intermediate record exists linking them.

**Revenue profile.** Subscription model at $500–$2,000 per month for a protected source payments product tier. Two hundred NGOs and media organisations yields $1.2M ARR with minimal marginal cost. The reputational and press coverage value to the Operator is a significant compounding benefit.

**Strategic note.** This model is viable only with CPP-1.0's disposable key and intermediate bearer architecture — existing payment rails expose the transaction at every step. Legal counsel on non-disclosure obligations and journalist shield law alignment is required before deployment.

:::note First-of-kind model
No existing payment infrastructure provides this property at scale. The closest alternative — physical cash — introduces physical transport risk and geographic constraints.
:::

---

### 4.2 📜 Digital Bearer Bond Issuance Platform

**The instrument structure generalises directly to bearer bonds — under a compliant, auditable framework.**

Regulated bearer bonds were abolished in most jurisdictions during the 1980s and 1990s due to money laundering concerns. CPP-1.0's edge-KYC model — principal and redeemer identified; intermediate chain private — reintroduces the economic function of bearer transferability under a structure compatible with modern AML frameworks.

**Mechanics.** The bond issuer, acting as Operator, locks proceeds in escrow and issues cash-packs denominated in bond units. Holders transfer instruments via the renewal mechanism without on-ledger transfers at each step. At maturity, the final holder redeems against escrow. The full renewal chain provides provenance for settlement and regulatory reporting.

**Revenue profile.** Standard bond structuring fee of 10–50 basis points on issuance, plus 5–10 basis points per secondary transfer. On a $100M bond with an average of 10 secondary trades, that yields $100,000 in issuance fees and $50,000 in transfer fees per instrument.

**Strategic note.** This is a genuine legal-financial innovation. Operators pursuing this model require securities licensing and should engage regulators early, framing the instrument as a supervised bearer structure with full audit capability — not a cryptocurrency or digital asset.

:::note First-of-kind model
This model requires securities licensing and early regulatory engagement. The CPP-1.0 governance layer provides the compliance framing Operators need for regulatory dialogue.
:::

---

### 4.3 💊 Healthcare Payment Privacy Layer

**Potentially the most commercially significant model in this document.**

In the United States, payment records function as a de facto medical record. Patients paying for sensitive services — mental health, reproductive care, addiction treatment — face discrimination risk from insurer and employer access to payment data. Cash-packs eliminate the payment trail at the network level.

**Mechanics.** A patient purchases a cash-pack from their bank or a health privacy operator. They present it to a participating provider as payment. The provider redeems through the Operator. The patient is identified only at issuance; the provider receives a cryptographic identity. No insurer or employer learns of the payment.

**Revenue profile.** One in five Americans delays or avoids mental healthcare due to privacy concerns. A 1% fee on a $10,000 annual mental health spend yields $100 per patient per year. One hundred thousand patients generates $10M in annual Operator fee revenue. A subscription "health privacy plan" at $9.99/month is an alternative model.

**Strategic note.** This is technically feasible today. The barrier is finding a health-sector Operator willing to navigate HIPAA coordination and provider network development. The institution that moves first acquires a durable first-mover position in a multi-billion dollar problem with no existing solution.

:::note First-of-kind model
This model is technically viable under CPP-1.0 without protocol extensions. The deployment barrier is regulatory and commercial, not technical.
:::

---

### 4.4 🔁 Peer-to-Peer Privacy Gift Economy

**Transferability itself as the product — a consumer experience that does not yet exist.**

No consumer payment product has ever made bearer transferability the core experience. Venmo is the inverse — every transaction public by default. A mobile application where cash gifts travel multiple hops through a social graph, with each recipient able to spend, re-gift, or split the instrument, is a genuinely novel consumer product.

**Mechanics.** A sender purchases a gift pack with a custom message or theme. The recipient can redeem to their bank account, pass it to someone else with a new message, or split it across multiple recipients. Network effects compound as instruments travel multiple hops.

**Revenue profile.** 0.5% issuance fee plus float plus premium themed instruments at $0.99 each. At one million instruments per month at an average $50 value and three hops average float duration (~30 days), float income at 5% annualised yields approximately $208,000 per month. Premium theme conversion at scale adds $200,000–$500,000 per month.

**Strategic note.** This is the only model in which bearer transferability is itself the product experience, not a technical property. The market gap is real: private digital cash you can pass on has never been a consumer product.

:::note First-of-kind model
This product category does not currently exist. The closest analogue — Venmo — is architecturally opposite in its privacy defaults.
:::

---

### 4.5 🤝 Structured Settlement & Legal Payment Privacy

**NDA-bound settlements, personal injury awards, and confidential employment resolutions — without a traceable payment record.**

Legal settlements frequently require confidentiality. The amount, parties, and circumstances are often under court order or contractual NDA. Existing payment rails record every settlement payment. Cash-packs allow structured settlements to be paid without the amount or parties appearing in any ledger beyond the two identity edges.

**Mechanics.** The paying party — a company or insurer — is the KYC-verified principal. An attorney or trustee receives the instrument as initial bearer. It travels through the trust structure before the plaintiff redeems. The Operator records only the two edges; the intermediate trust structure is private.

**Revenue profile.** Law firm subscription of $1,000–$5,000 per month for access to a confidential settlement payment product. Five hundred US law firms subscribed yields $3M ARR. Per-instrument premium of $100–$500 for high-value settlements above $500,000 adds material upside.

**Strategic note.** NDA-bound settlements represent a market exceeding $10B annually in the US alone. The practical alternative today is physical cash. CashPack is strictly superior: auditable to the Operator, legally defensible, and without physical transport risk.

:::note First-of-kind model
Physical cash is the only current alternative for confidential settlement payments. This model is superior on every operational dimension while maintaining the privacy property.
:::

---


## Summary

| Model | Category | Revenue Type | Phase |
|---|---|---|---|
| Issuance & Redemption Fees | Core | Transaction fee | CPP-1.0 |
| Float Income | Core | Investment income | CPP-1.0 |
| API-as-a-Service | Core | SaaS platform | CPP-1.0 |
| Bank Premium Feature | Banking | Account fee / retention | CPP-1.0 |
| Remittance Corridor | Banking | Transfer fee + FX | Phase 2 |
| Merchant Acceptance Network | Banking | Settlement fee | CPP-1.0 |
| Tokenized Deposit Wrapper | Banking | Wrapper fee | CPP-1.0 |
| Corporate Gift Platform | Platform | Issuance margin | CPP-1.0 |
| Escrow-as-a-Service | Platform | Transaction fee | CPP-1.0 |
| Earned Wage Access | Platform | Per-advance fee | CPP-1.0 |
| Source Protection Payments | Novel | Subscription | CPP-1.0 |
| Digital Bearer Bonds | Novel | Structuring + transfer fee | CPP-1.0 |
| Healthcare Privacy Layer | Novel | Fee / subscription | CPP-1.0 |
| P2P Gift Economy | Novel | Issuance + float | CPP-1.0 |
| Legal Settlement Privacy | Novel | Subscription + per-instrument | CPP-1.0 | 

---

## Get Involved

These models are presented to inform commercial evaluation and to support institutions considering Foundation membership or Operator deployment.

The Fabric Payment Standards Foundation is an open, community-driven organisation. We welcome engagement from financial institutions, fintech ventures, regulators, academic researchers, and legal practitioners.

- **Read the specification:** [CashPack Protocol CPP-1.0](https://fabricpaymentstandards.org/specs/cashpack/spec)
- **Join the community:** [Discord](https://discord.com/invite/fabric-payment-standards)
- **Contribute or review:** [GitHub](https://github.com/fabric-payment-standards/cashpack-spec)
- **Support the Foundation:** [Donate](https://fabricpaymentstandards.org/donate)
- **Contact:** [contact@fabricpaymentstandards.org](mailto:contact@fabricpaymentstandards.org)

---

*© 2026 Fabric Payment Standards Foundation — Licensed under Apache License 2.0*