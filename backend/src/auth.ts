import type { CookieOptions, NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env, isProd } from "./env.ts";
import { Owner, type OwnerDoc } from "./models/Owner.ts";

const COOKIE = "munim_token";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 din

const cookieOpts: CookieOptions = {
    httpOnly: true, // JavaScript se cookie padhi nahi ja sakti (XSS se bachav)
    sameSite: "lax",
    secure: isProd,
    path: "/",
};

export function setSession(res: Response, ownerId: string) {
    const token = jwt.sign({ sub: ownerId }, env.JWT_SECRET, { expiresIn: "30d" });
    res.cookie(COOKIE, token, { ...cookieOpts, maxAge: MAX_AGE_MS });
}

export function clearSession(res: Response) {
    res.clearCookie(COOKIE, cookieOpts);
}

declare module "express-serve-static-core" {
    interface Request {
        owner?: OwnerDoc;
    }
}

/** Login zaroori wale routes ke aage lagta hai */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.[COOKIE];
    if (!token) return res.status(401).json({ error: "Pehle login karein." });
    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
        const owner = await Owner.findById(payload.sub);
        if (!owner) {
            clearSession(res);
            return res.status(401).json({ error: "Session khatam ho gaya. Dobara login karein." });
        }
        req.owner = owner;
        next();
    } catch {
        clearSession(res);
        return res.status(401).json({ error: "Session khatam ho gaya. Dobara login karein." });
    }
} 