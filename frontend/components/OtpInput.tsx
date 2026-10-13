"use client";
import { useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  hasError?: boolean;
  disabled?: boolean;
  length?: number;
};

/** 6 dibbe wala OTP box. Paste, backspace aur arrow keys sab chalte hain. */
export default function OtpInput({ value, onChange, onComplete, hasError, disabled, length = 6 }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const update = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  const handleChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, "");
    if (!d) return;
    const next = (value.slice(0, i) + d + value.slice(i + d.length)).slice(0, length);
    update(next);
    refs.current[Math.min(i + d.length, length - 1)]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) update(value.slice(0, i) + value.slice(i + 1));
      else if (i > 0) {
        update(value.slice(0, i - 1) + value.slice(i));
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    update(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="OTP daalein">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={length}
          disabled={disabled}
          aria-label={`OTP ka ank ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`h-14 w-full min-w-0 rounded-md border-2 bg-white text-center font-display text-2xl font-bold text-ink
            ${hasError ? "border-khata" : d ? "border-ink" : "border-rule"} disabled:opacity-60`}
        />
      ))}
    </div>
  );
}
