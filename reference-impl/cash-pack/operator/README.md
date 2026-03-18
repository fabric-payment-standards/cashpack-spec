# CashPack Operator — CPP-1.0 Prototype

A minimal TypeScript implementation of the **CashPack Protocol CPP-1.0** Operator, implementing all mandatory Cash-Pack endpoints. KYC is deliberately omitted per requirements (the redeemer identity field accepts any non-empty string in this prototype).

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/cashpack/issue` | Submit a Lock Request → returns signed CashPack |
| `POST` | `/v1/cashpack/renew` | Submit cash-pack + Renewal Entry → returns updated CashPack |
| `POST` | `/v1/cashpack/redeem` | Submit Redemption Request + cash-pack → returns Redemption Confirmation |
| `GET`  | `/v1/cashpack/:pack_id/status` | Query instrument status |
| `GET`  | `/.well-known/cashpack-policy.json` | Operator Policy Document (§4.4) |
| `GET`  | `/.well-known/cashpack-pubkey.json` | Operator public key (JWK) |
| `GET`  | `/health` | Health check |

---

## Quick Start

### Docker Compose

```bash
docker compose up --build
```

The operator starts on **port 3000**.

### Manual (Node.js 20+)

```bash
npm ci
npm run build
npm start
```

---

## Configuration (environment variables)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `OPERATOR_ID` | `cashpack-operator` | Operator identifier |
| `MAX_AMOUNT` | `1000000` | Max per-instrument amount (cents) |
| `MAX_LIFETIME_DAYS` | `90` | Max instrument lifetime |
| `MAX_CHAIN_DEPTH` | `20` | Max renewal hops |
| `MAX_ACTIVE_PER_PRINCIPAL` | `10` | Velocity limit |
| `SUPPORTED_CURRENCIES` | `USD,EUR,BRL,GBP` | Comma-separated ISO 4217 |
| `BASE_URL` | `http://localhost:3000` | Public base URL |

---

## Operator Keys

On first startup the operator generates an **Ed25519 key pair** and writes it to `./keys/operator.priv` (hex) and `./keys/operator.pub` (hex). Mount the `keys/` directory as a Docker volume to persist across restarts.

---

## Running the E2E Test

With the server running:

```bash
npm ci
npx ts-node test/e2e.ts
```

The test exercises the full `Bob → Alice → John → Maria` lifecycle:

1. Bob issues a USD 50.00 cash-pack addressed to Alice.
2. Alice renews to John (disposable key, invisible to Operator).
3. John renews to Maria.
4. Maria redeems with identity verification.
5. Duplicate redemption attempt is rejected.

---

## Cryptographic Details

- **Signing algorithm**: Ed25519 (`@noble/ed25519`)
- **Canonical JSON**: RFC 8785 / JCS (`canonicalize`)
- **Chain digest**: `SHA-256(prev_digest || canonical_json(entry))`
- **Key encoding**: Base64url (no padding)

---

## Notable Omissions (prototype scope)

- **KYC/AML**: `redeemer_identity` accepts any non-empty string. Wire up a real identity provider for production.
- **Persistence**: In-memory store only — data is lost on restart.
- **Authentication on `/issue` and `/status`**: The spec requires OAuth 2.0 / mTLS; this prototype trusts the submitted `principal_pk` directly.
- **TLS**: Add a reverse proxy (nginx, Caddy) in front for production.
- **Inter-Operator settlement**: CPP-1.0 Phase 2 is out of scope.
