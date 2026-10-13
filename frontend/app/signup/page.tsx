"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OtpInput from "@/components/OtpInput";
import { DEMO_OTP, getOwner, saveOwner, sendOtp, verifyOtp } from "@/frontend/lib/auth";
import { cleanPhone, isValidName, isValidPhone } from "@/frontend/lib/validation";

type Step = "details" | "otp";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (getOwner()) router.replace("/dashboard");
  }, [router]);

  // Resend timer
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const requestOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isValidName(name)) return setError("Apna naam likhein (kam se kam 2 akshar).");
    if (!isValidPhone(phone)) return setError("10 ank ka sahi mobile number daalein.");
    setError("");
    setLoading(true);
    await sendOtp(phone);
    setLoading(false);
    setOtp("");
    setWait(30);
    setStep("otp");
  };

  const confirm = async (code: string) => {
    if (code.length !== 6 || loading) return;
    setLoading(true);
    const ok = await verifyOtp(phone, code);
    if (!ok) {
      setLoading(false);
      setError("OTP galat hai. Dobara dekhkar daalein.");
      return;
    }
    saveOwner({ name: name.trim(), phone });
    router.replace("/dashboard");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-khata font-display text-xl font-extrabold text-white">म</span>
          <span className="font-display text-2xl font-extrabold">Munim</span>
        </div>
        <h1 className="font-display text-4xl font-extrabold leading-tight">
          {step === "details" ? "Udhaar ka hisaab, ab ek jagah." : "OTP daalein"}
        </h1>
        <p className="mt-2 text-mute">
          {step === "details"
            ? "Apna naam aur mobile number daalkar shuru karein."
            : `+91 ${phone} par 6 ank ka OTP bheja gaya hai. Paste karna ho to seedha paste kar dein.`}
        </p>
      </div>

      {step === "details" ? (
        <form onSubmit={requestOtp} noValidate className="space-y-4">
          <label className="block">
            <span className="mb-1 block font-semibold">Aapka naam</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="jaise Ramesh Gupta"
              autoComplete="name"
              className="w-full rounded-md border-2 border-rule bg-white px-3 py-3 placeholder:text-mute/60"
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-semibold">Mobile number</span>
            <div className="flex">
              <span className="grid place-items-center rounded-l-md border-2 border-r-0 border-rule bg-rule/30 px-3 text-mute">+91</span>
              <input
                value={phone}
                onChange={(e) => setPhone(cleanPhone(e.target.value))}
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="98XXXXXXXX"
                className="w-full rounded-r-md border-2 border-rule bg-white px-3 py-3 placeholder:text-mute/60"
              />
            </div>
          </label>

          {error && <p role="alert" className="font-medium text-khata">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-haldi px-5 py-3.5 font-display text-xl font-bold text-ink hover:bg-haldidark disabled:opacity-60"
          >
            {loading ? "OTP bhej rahe hain…" : "OTP bhejein"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} onComplete={confirm} hasError={!!error} disabled={loading} />

          {error && <p role="alert" className="font-medium text-khata">{error}</p>}

          <button
            onClick={() => confirm(otp)}
            disabled={loading || otp.length !== 6}
            className="w-full rounded-xl bg-haldi px-5 py-3.5 font-display text-xl font-bold text-ink hover:bg-haldidark disabled:opacity-50"
          >
            {loading ? "Jaanch rahe hain…" : "Signup poora karein"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button onClick={() => { setStep("details"); setError(""); }} className="font-semibold text-ink underline underline-offset-4">
              Number badlein
            </button>
            {wait > 0 ? (
              <span className="text-mute">Dobara bhejein ({wait}s)</span>
            ) : (
              <button onClick={() => requestOtp()} className="font-semibold text-ink underline underline-offset-4">
                OTP dobara bhejein
              </button>
            )}
          </div>

          {/* DEMO ONLY: backend judne par ye box hata dena */}
          <p className="rounded-md bg-haldi/25 px-3 py-2 text-sm">
            Demo mode: OTP <strong>{DEMO_OTP}</strong> hai. Asli SMS backend judne par aayega.
          </p>
        </div>
      )}
    </main>
  );
}
