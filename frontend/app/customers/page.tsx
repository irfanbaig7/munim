"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AddEntrySheet from "@/components/AddEntrySheet";
import AddPaymentSheet from "@/components/AddPaymentSheet";
import { ApiError } from "@/lib/api";
import { getLedger } from "@/lib/customers";
import { formatDay, formatDue } from "@/lib/dates";
import { formatQty, formatRupees } from "@/lib/money";
import type { Entry, Ledger, Payment } from "@/lib/types";

type Row = { kind: "entry"; at: string; entry: Entry } | { kind: "payment"; at: string; payment: Payment };

export default function CustomerPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const [ledger, setLedger] = useState<Ledger | null>(null);
    const [error, setError] = useState("");
    const [entryOpen, setEntryOpen] = useState(false);
    const [payOpen, setPayOpen] = useState(false);
    const [toast, setToast] = useState("");

    const showToast = (text: string) => {
        setToast(text);
        setTimeout(() => setToast(""), 2500);
    };

    const load = useCallback(async () => {
        try {
            setLedger(await getLedger(id));
            setError("");
        } catch (e) {
            if (e instanceof ApiError && e.status === 401) return router.replace("/signup");
            setError(e instanceof Error ? e.message : "Data load nahi ho paaya.");
        }
    }, [id, router]);

    useEffect(() => {
        load();
    }, [load]);

    const closeEntry = useCallback(() => setEntryOpen(false), []);
    const closePay = useCallback(() => setPayOpen(false), []);

    if (error)
        return (
            <main className="mx-auto max-w-md px-5 py-20 text-center">
                <p className="font-display text-2xl font-bold">{error}</p>
                <Link href="/dashboard" className="mt-5 inline-block rounded-xl bg-haldi px-5 py-3 font-display text-lg font-bold">
                    Dashboard par wapas
                </Link>
            </main>
        );

    if (!ledger) return null;

    const { customer, entries, payments } = ledger;
    const owed = entries.reduce((sum, e) => sum + e.totalPaise, 0);
    const paid = payments.reduce((sum, p) => sum + p.amountPaise, 0);
    const balance = customer.balancePaise;

    // Entries aur payments ek hi list mein, naye pehle
    const rows: Row[] = [
        ...entries.map((entry): Row => ({ kind: "entry", at: entry.createdAt, entry })),
        ...payments.map((payment): Row => ({ kind: "payment", at: payment.createdAt, payment })),
    ].sort((a, b) => b.at.localeCompare(a.at));

    return (
        <main className="mx-auto min-h-screen max-w-2xl px-4 pb-32 pt-5">
            <Link href="/dashboard" className="inline-block rounded-md py-2 pr-3 font-semibold text-mute hover:text-ink">
                ← Sab customers
            </Link>

            <div className="mt-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="truncate font-display text-3xl font-extrabold leading-tight">{customer.name}</h1>
                    <p className="truncate text-mute">{customer.location}</p>
                </div>
                <a href={`tel:+91${customer.phone}`} className="shrink-0 rounded-md border-2 border-rule px-3 py-1.5 text-sm font-semibold hover:bg-rule/40">
                    Call · {customer.phone}
                </a>
            </div>

            <div className="mt-5 rounded-xl border-2 border-ink bg-white p-4">
                {balance > 0 ? (
                    <>
                        <p className="text-mute">Baaki udhaar</p>
                        <p className="font-display text-4xl font-extrabold text-khata">{formatRupees(balance)}</p>
                    </>
                ) : balance < 0 ? (
                    <>
                        <p className="text-mute">Customer ka advance</p>
                        <p className="font-display text-4xl font-extrabold text-[#1B6E3C]">{formatRupees(-balance)}</p>
                    </>
                ) : (
                    <>
                        <p className="text-mute">Hisaab</p>
                        <p className="font-display text-4xl font-extrabold">Barabar</p>
                    </>
                )}
                <p className="mt-1 text-sm text-mute">
                    Kul udhaar {formatRupees(owed)} · Mile {formatRupees(paid)}
                </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                    onClick={() => setEntryOpen(true)}
                    className="rounded-xl bg-haldi px-4 py-3.5 font-display text-lg font-bold text-ink shadow-[0_4px_0_#D99F00] hover:bg-haldidark active:translate-y-[2px] active:shadow-[0_2px_0_#D99F00]"
                >
                    + Udhaar
                </button>
                <button onClick={() => setPayOpen(true)} className="rounded-xl border-2 border-ink bg-white px-4 py-3.5 font-display text-lg font-bold hover:bg-rule/30">
                    Paisa mila
                </button>
            </div>

            <h2 className="mt-8 mb-3 font-display text-xl font-bold">Hisaab ki bahi</h2>
            {rows.length === 0 ? (
                <p className="rounded-xl border-2 border-dashed border-rule bg-white/60 p-4 text-mute">Abhi koi entry nahi hai. &quot;+ Udhaar&quot; dabakar pehla udhaar likhein.</p>
            ) : (
                <ul className="space-y-3">
                    {rows.map((r) =>
                        r.kind === "entry" ? (
                            <li key={`e-${r.entry.id}`} className="rounded-xl border-2 border-rule bg-white p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-display text-lg font-bold text-khata">Udhaar diya</p>
                                        <p className="text-sm text-mute">{formatDay(r.entry.createdAt)}</p>
                                    </div>
                                    <p className="font-display text-xl font-extrabold text-khata">+{formatRupees(r.entry.totalPaise)}</p>
                                </div>
                                <ul className="mt-2 space-y-0.5 text-[15px]">
                                    {r.entry.items.map((i, k) => (
                                        <li key={k} className="flex justify-between gap-3">
                                            <span>
                                                {i.name} <span className="text-mute">{formatQty(i.quantity)} {i.unit}</span>
                                            </span>
                                            <span>{formatRupees(i.amountPaise)}</span>
                                        </li>
                                    ))}
                                </ul>
                                {r.entry.dueDate && <p className="mt-2 text-sm font-semibold">Dene ki tareekh: {formatDue(r.entry.dueDate)}</p>}
                            </li>
                        ) : (
                            <li key={`p-${r.payment.id}`} className="rounded-xl border-2 border-rule bg-white p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-display text-lg font-bold text-[#1B6E3C]">Paisa mila</p>
                                        <p className="text-sm text-mute">{formatDay(r.payment.createdAt)}</p>
                                        {r.payment.note && <p className="mt-1 text-[15px]">{r.payment.note}</p>}
                                    </div>
                                    <p className="font-display text-xl font-extrabold text-[#1B6E3C]">-{formatRupees(r.payment.amountPaise)}</p>
                                </div>
                            </li>
                        ),
                    )}
                </ul>
            )}

            {toast && (
                <div role="status" className="fixed bottom-6 left-1/2 z-40 max-w-[90vw] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-center font-semibold text-white shadow-lg">
                    {toast}
                </div>
            )}

            <AddEntrySheet
                open={entryOpen}
                customers={[customer]}
                initialCustomerId={customer.id}
                lockCustomer
                onClose={closeEntry}
                onSaved={(entry) => {
                    showToast(`${formatRupees(entry.totalPaise)} ka udhaar likh liya`);
                    load();
                }}
            />
            <AddPaymentSheet
                open={payOpen}
                customer={customer}
                onClose={closePay}
                onSaved={(p) => {
                    showToast(`${formatRupees(p.amountPaise)} mile, likh liya`);
                    load();
                }}
            />
        </main>
    );
}