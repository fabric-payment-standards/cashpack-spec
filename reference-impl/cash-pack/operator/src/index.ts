import express from "express";
import { wellKnownRouter } from "./routes/wellknown";
import client from "prom-client";
import { loadOrGenerateOperatorKey } from "./services/crypto";
import { issueRouter } from "./routes/issue";
import { renewRouter } from "./routes/renew";
import { redeemRouter } from "./routes/redeem";
import { statusRouter } from "./routes/status";
import { metricsMiddleware } from "./routes/metricsMiddleware";
import { metricsRouter } from "./routes/metrics";

// Load/generate operator key pair before handling any requests
loadOrGenerateOperatorKey();

const app = express();
const PORT = parseInt(process.env.PORT ?? "3000");

// collect default system metrics
client.collectDefaultMetrics();


// const httpRequestDuration = new client.Histogram({
//   name: "http_request_duration_seconds",
//   help: "HTTP request duration",
//   labelNames: ["method", "route", "status"],
//   buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2]
// });

// app.use((req, res, next) => {
//   const end = httpRequestDuration.startTimer();

//   res.on("finish", () => {
//     end({
//       method: req.method,
//       route: req.path,
//       status: res.statusCode
//     });
//   });

//   next();
// });

app.use(express.json({ limit: "1mb" }));
// app.use(express.json({
//   limit: "1mb",
//   verify: (req: any, res, buf) => {
//     req.rawBodyLength = buf.length;
//   }
// }));


// ── Metrics  ─────────────────────────────────────────────
app.use(metricsMiddleware);
app.use("/metrics", metricsRouter);

// ── CashPack endpoints (§6.1) ───────────────────────────────────────────────
app.use("/v1/cashpack/issue", issueRouter);
app.use("/v1/cashpack/renew", renewRouter);
app.use("/v1/cashpack/redeem", redeemRouter);
app.use("/v1/cashpack", statusRouter);

// ── Well-known resources (§6.3) ─────────────────────────────────────────────
app.use("/.well-known", wellKnownRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => res.json({ status: "ok", version: "CPP-1.0" }));

app.listen(PORT, () => {
  console.log(`CashPack Operator running on port ${PORT}`);
  console.log(`Policy : http://localhost:${PORT}/.well-known/cashpack-policy.json`);
  console.log(`Pub key: http://localhost:${PORT}/.well-known/cashpack-pubkey.json`);
});
