import { Router } from "express";
import { requireAuth } from "../auth.ts";
import { Customer } from "../models/Customer.ts";
import { Entry } from "../models/Entry.ts";
import { addEntryBody } from "../validation.ts";

export const entriesRouter = Router();
entriesRouter.use(requireAuth);

export const entryToJson = (e: InstanceType<typeof Entry>) => ({
    id: e.id as string,
    customerId: String(e.customerId),
    items: e.items.map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit, amountPaise: i.amountPaise })),
    totalPaise: e.totalPaise,
    dueDate: e.dueDate,
    createdAt: e.createdAt,
});

/** POST /entries  { customerId, items: [{name, quantity, unit, amountPaise}], dueDate? } */
entriesRouter.post("/", async (req, res) => {
    const parsed = addEntryBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
    const { customerId, items, dueDate } = parsed.data;

    // Customer isi dukandaar ka hona chahiye
    const customer = await Customer.findOne({ _id: customerId, ownerId: req.owner!._id });
    if (!customer) return res.status(404).json({ error: "Ye customer nahi mila." });

    // Total hamesha yahin code se judta hai, frontend ya AI ka total nahi maante
    const totalPaise = items.reduce((sum, i) => sum + i.amountPaise, 0);

    const entry = await Entry.create({
        ownerId: req.owner!._id,
        customerId: customer._id,
        items,
        totalPaise,
        dueDate: dueDate ? new Date(`${dueDate}T00:00:00.000Z`) : null,
    });

    res.status(201).json({ entry: entryToJson(entry) });
});