import { isProd } from "../env.js";

/**
 * OTP SMS bhejne ki jagah. Abhi sirf console mein print karta hai.
 * Production mein yahan MSG91 / Twilio / Fast2SMS ka call lagega.
 */
export async function sendSms(phone: string, text: string): Promise<void> {
    if (isProd) {
        throw new Error("SMS provider abhi set nahi hai (src/services/sms.ts)");
    }
    console.log(`[SMS -> +91${phone}] ${text}`);
}