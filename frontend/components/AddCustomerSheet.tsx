"use client";
import { useEffect, useRef, useState } from "react";
import { addCustomer } from "@/frontend/lib/customers";
import { cleanPhone, isValidName, isValidPhone } from "@/frontend/lib/validation";
import type { Customer } from "@/frontend/lib/types";

type Props = { open: boolean; onClose: () => void; onAdded: (c: Customer) => void };
type Mode = "choose" | "manual";

export default function AddCustomerSheet({ open, onClose, onAdded }: Props) {
  const [mode, setMode] = useState<Mode>("choose");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const nameRef = useRef<HTMLInputElement>(null);

  // Band hone par sab reset
  useEffect(() => {
    if (!open) {
      setMode("choose");
      setName("");
      setPhone("");
      setLocation("");
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (open && mode === "manual") nameRef.current?.focus();
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!isValidName(name)) errs.name = "Naam kam se kam 2 akshar ka likhein.";
    if (!isValidPhone(phone)) errs.phone = "10 ank ka sahi mobile number daalein.";
    if (location.trim().length < 2) errs.location = "Mohalla ya area ka naam likhein.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const res = addCustomer({ name, phone, location });
    if (!res.ok) {
      setErrors({ phone: res.error });
      return;
    }
    onAdded(res.customer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <button aria-label="Band karein" className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="sheet-in relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-paper p-5 sm:max-w-md sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="sheet-title" className="font-display text-2xl font-bold">
            {mode === "choose" ? "Udhaar kisko diya?" : "Customer ki jaankari"}
          </h2>
          <button onClick={onClose} aria-label="Band karein" className="-mr-2 -mt-1 grid h-10 w-10 place-items-center rounded-full text-2xl text-mute hover:bg-rule/50">
            ×
          </button>
        </div>

        {mode === "choose" ? (
          <div className="space-y-3">
            <button
              onClick={() => setMode("manual")}
              className="w-full rounded-xl border-2 border-ink bg-white p-4 text-left hover:bg-rule/30"
            >
              <span className="block font-display text-xl font-bold">Khud likhein</span>
              <span className="text-mute">Naam, number aur jagah apne haath se bharein.</span>
            </button>

            <button
              disabled
              className="w-full cursor-not-allowed rounded-xl border-2 border-dashed border-rule bg-white/60 p-4 text-left"
            >
              <span className="flex items-center gap-2 font-display text-xl font-bold text-mute">
                AI se add karein
                <span className="rounded-full bg-haldi/30 px-2 py-0.5 font-body text-sm font-semibold text-ink">Jald aa raha hai</span>
              </span>
              <span className="text-mute">Bolkar ya likhkar bata dein, AI khud bhar dega.</span>
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            <Field label="Naam" error={errors.name}>
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="jaise Sharma ji"
                autoComplete="off"
                className={inputCls(!!errors.name)}
              />
            </Field>

            <Field label="Mobile number" error={errors.phone}>
              <div className="flex">
                <span className="grid place-items-center rounded-l-md border-2 border-r-0 border-rule bg-rule/30 px-3 text-mute">+91</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(cleanPhone(e.target.value))}
                  inputMode="numeric"
                  placeholder="98XXXXXXXX"
                  autoComplete="off"
                  className={inputCls(!!errors.phone) + " rounded-l-none"}
                />
              </div>
            </Field>

            <Field label="Jagah (mohalla / area)" error={errors.location}>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="jaise Gandhi Nagar, gali no. 3"
                autoComplete="off"
                className={inputCls(!!errors.location)}
              />
            </Field>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setMode("choose")} className="rounded-xl border-2 border-rule px-5 py-3 font-semibold text-mute hover:bg-rule/30">
                Peeche
              </button>
              <button type="submit" className="flex-1 rounded-xl bg-haldi px-5 py-3 font-display text-lg font-bold text-ink hover:bg-haldidark">
                Customer add karein
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inputCls = (err: boolean) =>
  `w-full rounded-md border-2 bg-white px-3 py-3 text-ink placeholder:text-mute/60 ${err ? "border-khata" : "border-rule"}`;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-semibold">{label}</span>
      {children}
      {error && <span role="alert" className="mt-1 block text-sm font-medium text-khata">{error}</span>}
    </label>
  );
}
