import { Schema, model } from "mongoose";

/** Dukandaar ke customers (jinhe udhaar dena hai) */
const customerSchema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true },
        location: { type: String, required: true, trim: true },
    },
    { timestamps: true },
);

// Ek dukandaar ke paas ek number do baar nahi
customerSchema.index({ ownerId: 1, phone: 1 }, { unique: true });

export const Customer = model("Customer", customerSchema);