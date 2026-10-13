import { z } from "zod";

export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, "10 ank ka sahi mobile number daalein.");
export const nameSchema = z.string().trim().min(2, "Naam kam se kam 2 akshar ka likhein.").max(80);

export const sendOtpBody = z.object({ phone: phoneSchema });
export const verifyOtpBody = z.object({
    phone: phoneSchema,
    name: nameSchema,
    code: z.string().regex(/^\d{6}$/, "OTP 6 ank ka hona chahiye."),
});
export const addCustomerBody = z.object({
    name: nameSchema,
    phone: phoneSchema,
    location: z.string().trim().min(2, "Mohalla ya area ka naam likhein.").max(120),
});