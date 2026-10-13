import { Router } from "express";
import { requireAuth } from "../auth.js";
import { Customer } from "../models/Customer.js";
import { addCustomerBody } from "../validation.js";

export const customersRouter = Router();
customersRouter.use(requireAuth);

/** Frontend ko jo shape chahiye (id string, __v nahi) */
const toJson = (c: InstanceType<typeof Customer>) => ({
    id: c.id as string,
    name: c.name,
    phone: c.phone,
    location: c.location,
    createdAt: c.createdAt,
});

/** GET /customers  -> sirf isi dukandaar ke customers, naye pehle */
customersRouter.get("/", async (req, res) => {
    const rows = await Customer.find({ ownerId: req.owner!._id }).sort({ createdAt: -1 });
    res.json({ customers: rows.map(toJson) });
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