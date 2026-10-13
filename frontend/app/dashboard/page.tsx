"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddCustomerSheet from "@/components/AddCustomerSheet";
import { getOwner, logout } from "@/frontend/lib/auth";
import { listCustomers } from "@/frontend/lib/customers";
import type { Customer, Owner } from "@/frontend/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const o = getOwner();
    if (!o) return router.replace("/signup");
    setOwner(o);
    setCustomers(listCustomers());
  }, [router]);

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const onAdded = (c: Customer) => {
    setCustomers(listCustomers());
    setToast(`${c.name} add ho gaye`);
    setTimeout(() => setToast(""), 2500);
  };

  if (!owner) return null;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-32 pt-5">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-khata font-display text-lg font-extrabold text-white">म</span>
          <span className="font-display text-xl font-extrabold">Munim</span>
        </div>
        <button
          onClick={() => { logout(); router.replace("/signup"); }}
          className="rounded-md px-3 py-2 text-sm font-semibold text-mute hover:bg-rule/40"
        >
          Logout
        </button>
      </header>

      <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">Namaste, {owner.name}</h1>
      <p className="mt-1 text-mute">
        {customers.length === 0 ? "Aapka khata abhi khali hai." : `Aapke khate mein ${customers.length} customer hain.`}
      </p>

      <button
        onClick={() => setSheetOpen(true)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-haldi px-5 py-4 font-display text-xl font-bold text-ink shadow-[0_4px_0_#D99F00] hover:bg-haldidark active:translate-y-[2px] active:shadow-[0_2px_0_#D99F00]"
      >
        <span className="text-2xl leading-none">+</span> Udhaar add karein
      </button>

      {/* Bahi ka panna */}
      <section aria-label="Customers ki list" className="bahi mt-8 min-h-[216px]">
        {customers.length === 0 ? (
          <div className="flex h-[216px] flex-col justify-center pl-16 pr-6">
            <p className="font-display text-xl font-bold">Pehla customer add karein</p>
            <p className="text-mute">Jise udhaar diya hai, uska naam yahan likhte hain.</p>
          </div>
        ) : (
          <ul>
            {customers.map((c) => (
              <li key={c.id} className="flex h-[72px] items-center gap-3 pl-14 pr-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-xl font-bold leading-tight">{c.name}</p>
                  <p className="truncate text-sm text-mute">{c.location}</p>
                </div>
                <a href={`tel:+91${c.phone}`} className="shrink-0 rounded-md border-2 border-rule px-3 py-1.5 text-sm font-semibold hover:bg-rule/40" aria-label={`${c.name} ko call karein`}>
                  {c.phone}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-ink px-5 py-3 font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <AddCustomerSheet open={sheetOpen} onClose={closeSheet} onAdded={onAdded} />
    </main>
  );
}
