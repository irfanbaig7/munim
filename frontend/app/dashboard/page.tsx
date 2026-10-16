"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AddCustomerSheet from "@/components/AddCustomerSheet";
import AddEntrySheet from "@/components/AddEntrySheet";
import { getMe, logout } from "@/lib/auth";
import { listCustomers } from "@/lib/customers";
import { formatRupees } from "@/lib/money";
import type { Customer, Entry, Owner } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState("");

  const [entryOpen, setEntryOpen] = useState(false);
  const [entryCustomerId, setEntryCustomerId] = useState<string | undefined>(undefined);
  const [customerSheetOpen, setCustomerSheetOpen] = useState(false);
  // "+ Naya customer" udhaar wale sheet se dabaya gaya ho, to customer judte hi wapas udhaar wala sheet kholna hai
  const returnToEntry = useRef(false);

  const showToast = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(""), 2500);
  };

  const refresh = useCallback(async () => {
    setCustomers(await listCustomers());
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const o = await getMe();
        if (!o) return router.replace("/signup");
        setOwner(o);
        await refresh();
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Data load nahi ho paaya.");
      }
    })();
  }, [router, refresh]);

  const closeEntry = useCallback(() => setEntryOpen(false), []);
  const closeCustomerSheet = useCallback(() => {
    setCustomerSheetOpen(false);
    returnToEntry.current = false;
  }, []);

  const openEntry = () => {
    setEntryCustomerId(undefined);
    setEntryOpen(true);
  };

  const newCustomerFromEntry = () => {
    returnToEntry.current = true;
    setEntryOpen(false);
    setCustomerSheetOpen(true);
  };

  const onCustomerAdded = (c: Customer) => {
    setCustomers((prev) => [c, ...prev]);
    showToast(`${c.name} add ho gaye`);
    if (returnToEntry.current) {
      returnToEntry.current = false;
      setEntryCustomerId(c.id);
      setEntryOpen(true);
    }
  };

  const onEntrySaved = async (entry: Entry, customer: Customer) => {
    showToast(`${customer.name} ke naam ${formatRupees(entry.totalPaise)} likh liya`);
    try {
      await refresh();
    } catch {
      /* list agli baar load par theek ho jayegi */
    }
  };

  if (loadError)
    return (
      <main className="mx-auto max-w-md px-5 py-20 text-center">
        <p className="font-display text-2xl font-bold">Data load nahi ho paaya</p>
        <p className="mt-2 text-mute">{loadError}</p>
        <button onClick={() => location.reload()} className="mt-5 rounded-xl bg-haldi px-5 py-3 font-display text-lg font-bold">
          Dobara try karein
        </button>
      </main>
    );

  if (!owner) return null;

  // Jisse sabse zyada paisa lena hai wo sabse upar. Advance (minus) wale ko "baaki" mein nahi ginte.
  const sorted = [...customers].sort((a, b) => b.balancePaise - a.balancePaise);
  const totalOwed = customers.reduce((sum, c) => sum + Math.max(0, c.balancePaise), 0);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-32 pt-5">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-khata font-display text-lg font-extrabold text-white">म</span>
          <span className="font-display text-xl font-extrabold">Munim</span>
        </div>
        <button
          onClick={async () => {
            await logout().catch(() => { });
            router.replace("/signup");
          }}
          className="rounded-md px-3 py-2 text-sm font-semibold text-mute hover:bg-rule/40"
        >
          Logout
        </button>
      </header>

      <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">Namaste, {owner.name}</h1>

      <div className="mt-4 rounded-xl border-2 border-ink bg-white p-4">
        <p className="text-mute">Kul baaki udhaar</p>
        <p className={`font-display text-4xl font-extrabold ${totalOwed > 0 ? "text-khata" : "text-ink"}`}>{formatRupees(totalOwed)}</p>
        <p className="text-sm text-mute">{customers.length === 0 ? "Aapka khata abhi khali hai." : `${customers.length} customer ke khate mein`}</p>
      </div>

      <button
        onClick={openEntry}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-haldi px-5 py-4 font-display text-xl font-bold text-ink shadow-[0_4px_0_#D99F00] hover:bg-haldidark active:translate-y-[2px] active:shadow-[0_2px_0_#D99F00]"
      >
        <span className="text-2xl leading-none">+</span> Udhaar add karein
      </button>

      <div className="mt-8 mb-2 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Aapke customers</h2>
        <button
          onClick={() => {
            returnToEntry.current = false;
            setCustomerSheetOpen(true);
          }}
          className="rounded-md px-2 py-1 text-sm font-semibold underline underline-offset-4"
        >
          + Naya customer
        </button>
      </div>

      {/* Bahi ka panna */}
      <section aria-label="Customers ki list" className="bahi min-h-[216px]">
        {sorted.length === 0 ? (
          <div className="flex h-[216px] flex-col justify-center pl-16 pr-6">
            <p className="font-display text-xl font-bold">Pehla udhaar likhein</p>
            <p className="text-mute">Upar &quot;Udhaar add karein&quot; dabayein, customer aur saamaan bharein.</p>
          </div>
        ) : (
          <ul>
            {sorted.map((c) => (
              <li key={c.id}>
                <Link href={`/customers/${c.id}`} className="flex h-[72px] items-center gap-3 pl-14 pr-4 hover:bg-rule/20">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-xl font-bold leading-tight">{c.name}</p>
                    <p className="truncate text-sm text-mute">{c.location}</p>
                  </div>
                  <Balance paise={c.balancePaise} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-40 max-w-[90vw] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-center font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <AddEntrySheet
        open={entryOpen}
        customers={customers}
        initialCustomerId={entryCustomerId}
        onClose={closeEntry}
        onNewCustomer={newCustomerFromEntry}
        onSaved={onEntrySaved}
      />
      <AddCustomerSheet open={customerSheetOpen} onClose={closeCustomerSheet} onAdded={onCustomerAdded} />
    </main>
  );
}

function Balance({ paise }: { paise: number }) {
  if (paise > 0)
    return (
      <div className="shrink-0 text-right">
        <p className="font-display text-xl font-extrabold leading-tight text-khata">{formatRupees(paise)}</p>
        <p className="text-xs text-mute">baaki</p>
      </div>
    );
  if (paise < 0)
    return (
      <div className="shrink-0 text-right">
        <p className="font-display text-lg font-bold leading-tight text-[#1B6E3C]">{formatRupees(-paise)}</p>
        <p className="text-xs text-mute">advance</p>
      </div>
    );
  return <p className="shrink-0 text-sm font-semibold text-mute">Barabar</p>;
}