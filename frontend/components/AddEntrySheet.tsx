"use client";
import { useEffect, useRef, useState } from "react";
import { addDaysYMD, todayYMD } from "@/lib/dates";
import { addEntry } from "@/lib/ledger";
import { MAX_PAISE, formatRupees, parseQty, rupeesToPaise } from "@/lib/money";
import type { Customer, Entry, EntryItem } from "@/lib/types";

type Props = {
  open: boolean;
  customers: Customer[];
  /** Pehle se chuna hua customer (customer ke page se kholne par) */
  initialCustomerId?: string;
  /** true ho to customer badal nahi sakte */
  lockCustomer?: boolean;
  onClose: () => void;
  /** "+ Naya customer" dabane par (dashboard par hi dikhta hai) */
  onNewCustomer?: () => void;
  onSaved: (entry: Entry, customer: Customer) => void;
};

type Row = { key: number; name: string; qty: string; unit: string; amount: string };
const newRow = (key: number): Row => ({ key, name: "", qty: "", unit: "kg", amount: "" });

export default function AddEntrySheet({ open, customers, initialCustomerId, lockCustomer, onClose, onNewCustomer, onSaved }: Props) {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Row[]>([newRow(1)]);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const keyRef = useRef(1);

  // Khulne par customer set karo, band hone par sab reset
  useEffect(() => {
    if (open) {
      setCustomerId(initialCustomerId ?? null);
    } else {
      setCustomerId(null);
      setSearch("");
      keyRef.current = 1;
      setRows([newRow(1)]);
      setDueDate("");
      setError("");
      setSaving(false);
    }
  }, [open, initialCustomerId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const customer = customers.find((c) => c.id === customerId) ?? null;
  const q = search.trim().toLowerCase();
  const shown = q ? customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)) : customers;

  // Total hamesha code jodta hai, haath se nahi
  const totalPaise = rows.reduce((sum, r) => sum + (rupeesToPaise(r.amount) ?? 0), 0);

  const updateRow = (key: number, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    setError("");
  };
  const addRow = () => {
    keyRef.current += 1;
    setRows((prev) => [...prev, newRow(keyRef.current)]);
  };
  const removeRow = (key: number) => setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    const items: EntryItem[] = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const n = i + 1;
      const name = r.name.trim();
      const unit = r.unit.trim();
      const quantity = parseQty(r.qty);
      const amountPaise = rupeesToPaise(r.amount);
      if (!name) return setError(`Item ${n}: naam likhein.`);
      if (quantity === null) return setError(`Item ${n}: quantity sahi likhein (jaise 2 ya 0.5).`);
      if (!unit) return setError(`Item ${n}: unit likhein (kg, packet, ...).`);
      if (amountPaise === null) return setError(`Item ${n}: amount sahi likhein (jaise 50 ya 49.50).`);
      if (amountPaise > MAX_PAISE) return setError(`Item ${n}: amount bahut zyada hai.`);
      items.push({ name, quantity, unit, amountPaise });
    }

    setSaving(true);
    try {
      const entry = await addEntry({ customerId: customer.id, items, dueDate: dueDate || null });
      onSaved(entry, customer);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kuch gadbad ho gayi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="entry-title">
      <button aria-label="Band karein" className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="sheet-in relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-paper p-5 sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="entry-title" className="font-display text-2xl font-bold">
            {customer ? "Kya saamaan diya?" : "Udhaar kisko diya?"}
          </h2>
          <button onClick={onClose} aria-label="Band karein" className="-mr-2 -mt-1 grid h-10 w-10 place-items-center rounded-full text-2xl text-mute hover:bg-rule/50">
            ×
          </button>
        </div>

        {!customer ? (
          /* Kadam 1: customer chuno */
          <div className="space-y-3">
            {onNewCustomer && (
              <button onClick={onNewCustomer} className="w-full rounded-xl border-2 border-dashed border-ink bg-white p-3 text-left font-display text-lg font-bold hover:bg-rule/30">
                + Naya customer
              </button>
            )}
            {customers.length > 4 && (
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Naam ya number se dhoondhein"
                className="w-full rounded-md border-2 border-rule bg-white px-3 py-3 placeholder:text-mute/60"
              />
            )}
            {customers.length === 0 ? (
              <p className="text-mute">Abhi koi customer nahi hai. Pehle naya customer jodein.</p>
            ) : shown.length === 0 ? (
              <p className="text-mute">Koi customer nahi mila.</p>
            ) : (
              <ul className="space-y-2">
                {shown.map((c) => (
                  <li key={c.id}>
                    <button onClick={() => setCustomerId(c.id)} className="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-rule bg-white p-3 text-left hover:border-ink">
                      <span className="min-w-0">
                        <span className="block truncate font-display text-lg font-bold leading-tight">{c.name}</span>
                        <span className="block truncate text-sm text-mute">{c.location}</span>
                      </span>
                      {c.balancePaise > 0 && <span className="shrink-0 text-sm font-semibold text-khata">{formatRupees(c.balancePaise)} baaki</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          /* Kadam 2: items aur tareekh */
          <form onSubmit={submit} noValidate className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-bold leading-tight">{customer.name}</p>
                <p className="truncate text-sm text-mute">{customer.location}</p>
              </div>
              {!lockCustomer && (
                <button type="button" onClick={() => setCustomerId(null)} className="shrink-0 text-sm font-semibold underline underline-offset-4">
                  Badlein
                </button>
              )}
            </div>

            <datalist id="unit-options">
              {["kg", "gram", "litre", "ml", "packet", "piece", "dozen", "bottle"].map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>

            <div className="space-y-3">
              {rows.map((r, i) => (
                <div key={r.key} className="rounded-xl border-2 border-rule bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-mute">Item {i + 1}</span>
                    {rows.length > 1 && (
                      <button type="button" onClick={() => removeRow(r.key)} className="text-sm font-semibold text-khata">
                        Hataein
                      </button>
                    )}
                  </div>
                  <input
                    value={r.name}
                    onChange={(e) => updateRow(r.key, { name: e.target.value })}
                    placeholder="Item ka naam (jaise aata)"
                    aria-label={`Item ${i + 1} ka naam`}
                    autoComplete="off"
                    className="w-full rounded-md border-2 border-rule px-3 py-2.5 placeholder:text-mute/60"
                  />
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <input
                      value={r.qty}
                      onChange={(e) => updateRow(r.key, { qty: e.target.value })}
                      inputMode="decimal"
                      placeholder="Quantity"
                      aria-label={`Item ${i + 1} ki quantity`}
                      className="min-w-0 rounded-md border-2 border-rule px-3 py-2.5 placeholder:text-mute/60"
                    />
                    <input
                      value={r.unit}
                      onChange={(e) => updateRow(r.key, { unit: e.target.value })}
                      list="unit-options"
                      placeholder="Unit"
                      aria-label={`Item ${i + 1} ka unit`}
                      className="min-w-0 rounded-md border-2 border-rule px-3 py-2.5 placeholder:text-mute/60"
                    />
                    <input
                      value={r.amount}
                      onChange={(e) => updateRow(r.key, { amount: e.target.value })}
                      inputMode="decimal"
                      placeholder="₹ Amount"
                      aria-label={`Item ${i + 1} ka poora amount`}
                      className="min-w-0 rounded-md border-2 border-rule px-3 py-2.5 placeholder:text-mute/60"
                    />
                  </div>
                </div>
              ))}
              <p className="text-sm text-mute">Amount us item ka poora paisa hai. Jaise aadha kilo aata 50 rupaye ka hai to 50 likhein.</p>
              <button type="button" onClick={addRow} className="w-full rounded-xl border-2 border-dashed border-rule py-2.5 font-semibold text-ink hover:bg-rule/30">
                + Item jodein
              </button>
            </div>

            <div>
              <label htmlFor="due-date" className="mb-1 block font-semibold">
                Paise kab denge? <span className="font-normal text-mute">(zaroori nahi)</span>
              </label>
              <input
                id="due-date"
                type="date"
                value={dueDate}
                min={todayYMD()}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border-2 border-rule bg-white px-3 py-2.5"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {[7, 15, 30].map((d) => (
                  <button key={d} type="button" onClick={() => setDueDate(addDaysYMD(d))} className="rounded-full border-2 border-rule px-3 py-1 text-sm font-semibold hover:bg-rule/30">
                    {d} din baad
                  </button>
                ))}
                {dueDate && (
                  <button type="button" onClick={() => setDueDate("")} className="rounded-full px-3 py-1 text-sm font-semibold text-mute underline underline-offset-4">
                    Hataein
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-ink px-4 py-3 text-white">
              <span>Kul udhaar</span>
              <span className="font-display text-2xl font-extrabold">{formatRupees(totalPaise)}</span>
            </div>

            {error && (
              <p role="alert" className="font-medium text-khata">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={lockCustomer ? onClose : () => setCustomerId(null)} className="rounded-xl border-2 border-rule px-5 py-3 font-semibold text-mute hover:bg-rule/30">
                Peeche
              </button>
              <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-haldi px-5 py-3 font-display text-lg font-bold text-ink hover:bg-haldidark disabled:opacity-60">
                {saving ? "Likh rahe hain…" : "Udhaar likhein"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}