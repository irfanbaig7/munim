import { Schema, model } from "mongoose";

/**
 * Bheje gaye OTP (sirf hash save hota hai, asli OTP nahi).
 * createdAt par TTL index: 1 ghante baad Mongo khud purane OTP hata deta hai.
 */
const otpSchema = new Schema({
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now, expires: 3600 },
});

export const OtpCode = model("OtpCode", otpSchema);