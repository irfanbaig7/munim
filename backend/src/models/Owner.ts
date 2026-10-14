import { type HydratedDocument, type InferSchemaType, Schema, model } from "mongoose";

/** Dukandaar jo app use karta hai */
const ownerSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, unique: true },
    },
    { timestamps: true },
);

export const Owner = model("Owner", ownerSchema);
export type OwnerDoc = HydratedDocument<InferSchemaType<typeof ownerSchema>>; 