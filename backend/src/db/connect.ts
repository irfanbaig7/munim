import mongoose from "mongoose";
import { env } from "../env.ts";
import { Customer } from "../models/Customer.ts";
import { OtpCode } from "../models/OtpCode.ts";
import { Owner } from "../models/Owner.ts";

export async function connectDb() {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    // Indexes (unique wale) pehle bana lo, taaki duplicate rokne wala rule shuru se kaam kare
    await Promise.all([Owner.init(), OtpCode.init(), Customer.init()]);
} 