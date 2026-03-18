import { Request, Response, NextFunction } from "express";
import client from "prom-client";

// Histogram for request latency (seconds)
export const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

// Counter for request bytes
export const requestBytes = new client.Counter({
    name: "http_request_bytes_total",
    help: "Total bytes received in HTTP requests",
    labelNames: ["method", "route", "status"]
});

// Counter for response bytes
export const responseBytes = new client.Counter({
    name: "http_response_bytes_total",
    help: "Total bytes sent in HTTP responses",
    labelNames: ["method", "route", "status"]
});

export function metricsMiddleware(req: Request & { rawBodyLength?: number }, res: Response, next: NextFunction) {
    const end = httpRequestDuration.startTimer();

    const origWrite = res.write;
    const origEnd = res.end;
    let bytesSent = 0;

    // Track bytes sent
    res.write = function (chunk: any, encoding?: any, callback?: any) {
        if (chunk) bytesSent += Buffer.byteLength(chunk);
        return origWrite.call(res, chunk, encoding, callback);
    };

    res.end = function (chunk?: any, encoding?: any, callback?: any) {
        if (chunk) bytesSent += Buffer.byteLength(chunk);
        const labels = {
            method: req.method,
            route: req.path,
            status: res.statusCode
        };

        end(labels);

        requestBytes.inc(labels, req.rawBodyLength ?? 0);
        responseBytes.inc(labels, bytesSent);

        return origEnd.call(res, chunk, encoding, callback);
    };

    next();
}