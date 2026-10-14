import { Router } from "express";
import { requireAuth } from "../auth.ts";
import { Customer } from "../models/Customer.ts";
import { Entry } from "../models/Entry.ts";
import { Payment } from "../models/Payment.ts";
import { addCustomerBody, customerIdParam } from "../validation.ts";
import { entryToJson } from "./entries.ts";
import { paymentToJson } from "./payments.ts";

export const customersRouter = Router();
customersRouter.use(requireAuth);

/** Frontend ko jo shape chahiye (id string, __v nahi). balancePaise = baaki udhaar */
const toJson = (c: InstanceType<typeof Customer>, balancePaise = 0) => ({
    id: c.id as string,
    name: c.name,
    phone: c.phone,
    location: c.location,
    createdAt: c.createdAt,
    balancePaise,
});

type Sum = { _id: unknown; total: number };

/** GET /customers  -> sirf isi dukandaar ke customers, naye pehle, har ek ka baaki paisa aur upar ka total */
customersRouter.get("/", async (req, res) => {
    const ownerId = req.owner!._id;

    const [rows, owed, paid] = await Promise.all([
        Customer.find({ ownerId }).sort({ createdAt: -1 }),
        Entry.aggregate<Sum>([{ $match: { ownerId } }, { $group: { _id: "$customerId", total: { $sum: "$totalPaise" } } }]),
        Payment.aggregate<Sum>([{ $match: { ownerId } }, { $group: { _id: "$customerId", total: { $sum: "$amountPaise" } } }]),
    ]);

    const balance = new Map<string, number>();
    for (const r of owed) balance.set(String(r._id), (balance.get(String(r._id)) ?? 0) + r.total);
    for (const r of paid) balance.set(String(r._id), (balance.get(String(r._id)) ?? 0) - r.total);

    const customers = rows.map((c) => toJson(c, balance.get(c.id) ?? 0));
    const totalPaise = customers.reduce((sum, c) => sum + c.balancePaise, 0);

    res.json({ customers, totalPaise });
});

/** POST /customers  { name, phone, location } */
customersRouter.post("/", async (req, res) => {
    const parsed = addCustomerBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { name, phone, location } = parsed.data;

    try {
        const customer = await Customer.create({ ownerId: req.owner!._id, name, phone, location });
        return res.status(201).json({ customer: toJson(customer) });
    } catch (e) {
        if ((e as { code?: number }).code !== 11000) throw e;
        // Unique index ne roka: ye number is dukandaar ke paas pehle se hai
        const existing = await Customer.findOne({ ownerId: req.owner!._id, phone });
        return res.status(409).json({ error: `Ye number pehle se ${existing?.name ?? "kisi"} ke naam se juda hai.` });
    }
});

/** GET /customers/:id/ledger  -> customer, uski saari entries, payments aur baaki paisa */
customersRouter.get("/:id/ledger", async (req, res) => {
    const parsed = customerIdParam.safeParse(req.params);
    if (!parsed.success) return res.status(404).json({ error: "Ye customer nahi mila." });

    const ownerId = req.owner!._id;
    const customer = await Customer.findOne({ _id: parsed.data.id, ownerId });
    if (!customer) return res.status(404).json({ error: "Ye customer nahi mila." });

    const [entries, payments] = await Promise.all([
        Entry.find({ ownerId, customerId: customer._id }).sort({ createdAt: -1 }),
        Payment.find({ ownerId, customerId: customer._id }).sort({ createdAt: -1 }),
    ]);

    const owed = entries.reduce((sum, e) => sum + e.totalPaise, 0);
    const paid = payments.reduce((sum, p) => sum + p.amountPaise, 0);
    const balancePaise = owed - paid;

    res.json({
        customer: toJson(customer, balancePaise),
        entries: entries.map(entryToJson),
        payments: payments.map(paymentToJson),
    });
});