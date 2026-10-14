import { Schema, model } from "mongoose";

/** Customer ne jo paise wapas diye ("Sharma ji ne 100 diye") */
const paymentSchema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
        customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
        amountPaise: { type: Number, required: true },
        note: { type: String, trim: true, default: "" },
    },
    { timestamps: true },
);

paymentSchema.index({ ownerId: 1, customerId: 1, createdAt: -1 });

export const Payment = model("Payment", paymentSchema); 