import "dotenv/config";
import { z } from "zod";

const schema = z.object({
    MONGODB_URI: z.string().min(1),
    JWT_SECRET: z.string().min(32, "JWT_SECRET kam se kam 32 akshar ka hona chahiye"),
    PORT: z.coerce.number().default(4000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DEV_FIXED_OTP: z.string().regex(/^\d{6}$/).optional(),
});

export const env = schema.parse(process.env);
export const isProd = env.NODE_ENV === "production";