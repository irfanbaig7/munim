import cookieParser from "cookie-parser";
import express, { type NextFunction, type Request, type Response } from "express";
import { authRouter } from "./routes/auth.ts";
import { customersRouter } from "./routes/customers.ts";
import { entriesRouter } from "./routes/entries.ts";
import { paymentsRouter } from "./routes/payments.ts";

export const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/auth", authRouter);
app.use("/customers", customersRouter);
app.use("/entries", entriesRouter);
app.use("/payments", paymentsRouter);

app.use((_req, res) => res.status(404).json({ error: "Ye rasta nahi mila." }));

// Koi bhi anjaani galti: asli wajah log mein, user ko saaf message
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Kuch gadbad ho gayi. Thodi der baad dobara try karein." });
}); 