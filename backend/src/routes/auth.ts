import crypto from "node:crypto";
import { Router } from "express";
import { clearSession, requireAuth, setSession } from "../auth.ts";
import { env, isProd } from "../env.ts";
import { OtpCode } from "../models/OtpCode.ts";
import { Owner } from "../models/Owner.ts";
import { sendSms } from "../services/sms.ts";
import { sendOtpBody, verifyOtpBody } from "../validation.ts";

export const authRouter = Router();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minute
const RESEND_GAP_MS = 30 * 1000; // 30 second
const MAX_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

const hash = (phone: string, code: string) =>
    crypto.createHmac("sha256", env.JWT_SECRET).update(`${phone}:${code}`).digest("hex");

const same = (a: string, b: string) => {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && crypto.timingSafeEqual(x, y);
};

/** POST /auth/send-otp  { phone } */
authRouter.post("/send-otp", async (req, res) => {
    const parsed = sendOtpBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { phone } = parsed.data;

    // Spam rokne ke liye: 30 sec ka gap aur ghante mein max 5 OTP
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await OtpCode.find({ phone, createdAt: { $gt: hourAgo } })
        .sort({ createdAt: -1 })
        .select("createdAt")
        .lean();

    if (recent.length >= MAX_PER_HOUR) {
        return res.status(429).json({ error: "Bahut zyada OTP maange gaye. Thodi der baad try karein." });
    }
    if (recent[0] && Date.now() - recent[0].createdAt.getTime() < RESEND_GAP_MS) {
        return res.status(429).json({ error: "Thoda ruk kar dobara OTP maangein (30 second)." });
    }

    const code = !isProd && env.DEV_FIXED_OTP ? env.DEV_FIXED_OTP : String(crypto.randomInt(100000, 1000000));

    await OtpCode.create({
        phone,
        codeHash: hash(phone, code),
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });
    await sendSms(phone, `Munim: aapka OTP ${code} hai. 5 minute mein expire hoga.`);

    res.json({ ok: true });
});

/** POST /auth/verify-otp  { phone, name, code }  -> signup ya login, cookie set */
authRouter.post("/verify-otp", async (req, res) => {
    const parsed = verifyOtpBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { phone, name, code } = parsed.data;

    const otp = await OtpCode.findOne({ phone, consumedAt: null, expiresAt: { $gt: new Date() } }).sort({
        createdAt: -1,
    });

    if (!otp) return res.status(400).json({ error: "OTP expire ho gaya. Naya OTP maangein." });
    if (otp.attempts >= MAX_ATTEMPTS) {
        return res.status(429).json({ error: "Bahut galat koshish. Naya OTP maangein." });
    }

    if (!same(otp.codeHash, hash(phone, code))) {
        await OtpCode.updateOne({ _id: otp._id }, { $inc: { attempts: 1 } });
        return res.status(400).json({ error: "OTP galat hai. Dobara dekhkar daalein." });
    }

    // Ek OTP sirf ek baar chalta hai. Race se bachne ke liye "consumed" ek hi query mein.
    const used = await OtpCode.findOneAndUpdate({ _id: otp._id, consumedAt: null }, { consumedAt: new Date() });
    if (!used) return res.status(400).json({ error: "OTP pehle hi use ho chuka hai. Naya OTP maangein." });

    // Naya number = signup. Purana number = login (naam wahi rehta hai).
    let owner = await Owner.findOne({ phone });
    if (!owner) {
        try {
            owner = await Owner.create({ name, phone });
        } catch (e) {
            // Do request ek saath aayi to unique index ek ko rokta hai; doosri wala dukandaar le lo
            if ((e as { code?: number }).code !== 11000) throw e;
            owner = await Owner.findOne({ phone });
        }
    }
    if (!owner) throw new Error("Owner nahi ban paaya");

    setSession(res, owner.id);
    res.json({ owner: { name: owner.name, phone: owner.phone } });
});

/** GET /auth/me  -> logged in dukandaar ki jaankari */
authRouter.get("/me", requireAuth, (req, res) => {
    const { name, phone } = req.owner!;
    res.json({ owner: { name, phone } });
});

/** POST /auth/logout */
authRouter.post("/logout", (_req, res) => {
    clearSession(res);
    res.json({ ok: true });
}); 