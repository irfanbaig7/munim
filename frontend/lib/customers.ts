import type { Customer } from "./types";

const KEY = "munim.customers";

/* Abhi localStorage. Backend aane par yehi functions API call banenge:
 *   GET  /customers      -> listCustomers()
 *   POST /customers      -> addCustomer()
 */
export function listCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Customer[]) : [];
  } catch {
    return [];
  }
}

type Input = { name: string; phone: string; location: string };
type Result = { ok: true; customer: Customer } | { ok: false; error: string };

export function addCustomer(input: Input): Result {
  const all = listCustomers();
  const dup = all.find((c) => c.phone === input.phone);
  if (dup) return { ok: false, error: `Ye number pehle se ${dup.name} ke naam se juda hai.` };

  const customer: Customer = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    phone: input.phone,
    location: input.location.trim(),
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify([customer, ...all]));
  return { ok: true, customer };
}
