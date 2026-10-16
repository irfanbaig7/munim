import { api } from "./api";
import type { Entry, EntryItem, Payment } from "./types";

export async function addEntry(input: { customerId: string; items: EntryItem[]; dueDate: string | null }): Promise<Entry> {
    const { entry } = await api<{ entry: Entry }>("/entries", { method: "POST", body: input });
    return entry;
}

export async function addPayment(input: { customerId: string; amountPaise: number; note?: string }): Promise<Payment> {
    const { payment } = await api<{ payment: Payment }>("/payments", { method: "POST", body: input });
    return payment;
}