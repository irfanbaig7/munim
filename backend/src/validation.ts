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

// ---- Stage 2: udhaar entry aur payment ----

/** Ek paisa-rakam ki upar seema: 10 lakh rupaye (paise mein) */
const MAX_PAISE = 100_000_000;

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Customer sahi nahi hai.");

const paise = z
    .number("Amount sahi nahi hai.")
    .int("Amount paise mein poora ank hona chahiye.")
    .positive("Amount 0 se zyada hona chahiye.")
    .max(MAX_PAISE, "Amount bahut zyada hai.");

export const entryItemSchema = z.object({
    name: z.string().trim().min(1, "Item ka naam likhein.").max(80),
    quantity: z.number("Quantity sahi nahi hai.").positive("Quantity 0 se zyada honi chahiye.").max(100_000),
    unit: z.string().trim().min(1, "Unit likhein (kg, packet, ...).").max(20),
    amountPaise: paise,
});

export const addEntryBody = z.object({
    customerId: objectId,
    items: z.array(entryItemSchema).min(1, "Kam se kam 1 item likhein.").max(50, "Ek entry mein 50 se zyada item nahi."),
    // "YYYY-MM-DD", optional
    dueDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Tareekh sahi nahi hai.")
        .refine((d) => !Number.isNaN(Date.parse(d)), "Tareekh sahi nahi hai.")
        .nullish(),
});

export const addPaymentBody = z.object({
    customerId: objectId,
    amountPaise: paise,
    note: z.string().trim().max(120).optional(),
});

export const customerIdParam = z.object({ id: objectId });