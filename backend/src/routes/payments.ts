import { Router } from "express";
import { requireAuth } from "../auth.ts";
import { Customer } from "../models/Customer.ts";
import { Payment } from "../models/Payment.ts";
import { addPaymentBody } from "../validation.ts";

export const paymentsRouter = Router();
paymentsRouter.use(requireAuth);

export const paymentToJson = (p: InstanceType<typeof Payment>) => ({
    id: p.id as string,
    customerId: String(p.customerId),
    amountPaise: p.amountPaise,
    note: p.note,
    createdAt: p.createdAt,
});

/** POST /payments  { customerId, amountPaise, note? } */
paymentsRouter.post("/", async (req, res) => {
    const parsed = addPaymentBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { customerId, amountPaise, note } = parsed.data;

    const customer = await Customer.findOne({ _id: customerId, ownerId: req.owner!._id });
    if (!customer) return res.status(404).json({ error: "Ye customer nahi mila." });

    const payment = await Payment.create({
        ownerId: req.owner!._id,
        customerId: customer._id,
        amountPaise,
        note: note ?? "",
    });

    res.status(201).json({ payment: paymentToJson(payment) });
}); 