import { Schema, model } from "mongoose";

/** Udhaar ka ek item. amountPaise = us poori line ka total (quantity ka nahi, poore item ka) */
const itemSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true, trim: true },
        amountPaise: { type: Number, required: true },
    },
    { _id: false },
);

/** Ek udhaar entry: ek customer ko kuch items udhaar diye */
const entrySchema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
        customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
        items: { type: [itemSchema], required: true },
        totalPaise: { type: Number, required: true },
        dueDate: { type: Date, default: null },
    },
    { timestamps: true },
);

entrySchema.index({ ownerId: 1, customerId: 1, createdAt: -1 });

export const Entry = model("Entry", entrySchema); 