import { Router, Request, Response } from "express";
import client from "prom-client";
export const metricsRouter = Router();

metricsRouter.get("/", async (req: Request, res: Response) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});