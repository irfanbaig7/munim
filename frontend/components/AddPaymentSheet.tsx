"use client";
import { useEffect, useRef, useState } from "react";
import { addPayment } from "@/lib/ledger";
import { MAX_PAISE, formatRupees, paiseToInput, rupeesToPaise } from "@/lib/money";
import type { Customer, Payment } from "@/lib/types";

type Props = {
    open: boolean;
    customer: Customer | null;
    onClose: () => void;
    onSaved: (payment: Payment) => void;
};

export default function AddPaymentSheet({ open, customer, onClose, onSaved }: Props) {
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const amountRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) {
            setAmount("");
            setNote("");
            setError("");
            setSaving(false);
        } else {
            amountRef.current?.focus();
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open || !customer) return null;

    const paise = rupeesToPaise(amount);
    const balance = customer.balancePaise;
    const exceeds = paise !== null && paise > Math.max(balance, 0);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (paise === null) return setError("Amount sahi likhein (jaise 100 ya 49.50).");
        if (paise > MAX_PAISE) return setError("Amount bahut zyada hai.");
        setSaving(true);
        try {
            const payment = await addPayment({ customerId: customer.id, amountPaise: paise, note: note.trim() || undefined });
            onSaved(payment);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Kuch gadbad ho gayi.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="pay-title">
            <button aria-label="Band karein" className="absolute inset-0 bg-ink/50" onClick={onClose} />
            <div className="sheet-in relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-paper p-5 sm:max-w-md sm:rounded-2xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 id="pay-title" className="font-display text-2xl font-bold">
                            {customer.name} ne diye
                        </h2>
                        <p className="text-mute">{balance > 0 ? `Abhi ${formatRupees(balance)} baaki hain.` : "Abhi koi udhaar baaki nahi hai."}</p>
                    </div>
                    <button onClick={onClose} aria-label="Band karein" className="-mr-2 -mt-1 grid h-10 w-10 place-items-center rounded-full text-2xl text-mute hover:bg-rule/50">
                        ×
                    </button>
                </div>

                <form onSubmit={submit} noValidate className="space-y-4">
                    <div>
                        <label htmlFor="pay-amount" className="mb-1 block font-semibold">
                            Kitne rupaye mile?
                        </label>
                        <div className="flex">
                            <span className="grid place-items-center rounded-l-md border-2 border-r-0 border-rule bg-rule/30 px-3 text-mute">₹</span>
                            <input
                                id="pay-amount"
                                ref={amountRef}
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    setError("");
                                }}
                                inputMode="decimal"
                                placeholder="jaise 100"
                                autoComplete="off"
                                className="w-full rounded-r-md border-2 border-rule bg-white px-3 py-3 placeholder:text-mute/60"
                            />
                        </div>
                        {balance > 0 && (
                            <button type="button" onClick={() => setAmount(paiseToInput(balance))} className="mt-2 rounded-full border-2 border-rule px-3 py-1 text-sm font-semibold hover:bg-rule/30">
                                Poora {formatRupees(balance)}
                            </button>
                        )}
                        {exceeds && <p className="mt-2 text-sm text-mute">Ye baaki se zyada hai, to bacha hua paisa customer ka advance ban jayega.</p>}
                    </div>

                    <div>
                        <label htmlFor="pay-note" className="mb-1 block font-semibold">
                            Note <span className="font-normal text-mute">(zaroori nahi)</span>
                        </label>
                        <input
                            id="pay-note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="jaise UPI se mile"
                            maxLength={120}
                            autoComplete="off"
                            className="w-full rounded-md border-2 border-rule bg-white px-3 py-3 placeholder:text-mute/60"
                        />
                    </div>

                    {error && (
                        <p role="alert" className="font-medium text-khata">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={saving} className="w-full rounded-xl bg-haldi px-5 py-3 font-display text-lg font-bold text-ink hover:bg-haldidark disabled:opacity-60">
                        {saving ? "Likh rahe hain…" : "Paisa mila, likh do"}
                    </button>
                </form>
            </div>
        </div>
    );
}