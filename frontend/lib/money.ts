/** Backend ki seema: 10 lakh rupaye (paise mein) */
export const MAX_PAISE = 100_000_000;

/**
 * "50", "49.5", "1,250.75" -> paise (poora ank). Galat ya 0 ho to null.
 * Float ka istemal nahi karte, taaki 0.1 + 0.2 jaisi galti paise mein na aaye.
 */
export function rupeesToPaise(input: string): number | null {
    const s = input.replace(/[,\s₹]/g, "");
    const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(s);
    if (!m) return null;
    const paise = Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0"));
    return paise > 0 ? paise : null;
}

/** paise -> "₹1,250" ya "₹49.50" (minus ho to "-₹100") */
export function formatRupees(paise: number): string {
    const abs = Math.abs(paise);
    const whole = abs % 100 === 0;
    const text = (abs / 100).toLocaleString("en-IN", {
        minimumFractionDigits: whole ? 0 : 2,
        maximumFractionDigits: 2,
    });
    return `${paise < 0 ? "-" : ""}₹${text}`;
}

/** paise -> input box ke liye text ("110" ya "49.50"), ₹ ke bina */
export function paiseToInput(paise: number): string {
    return paise % 100 === 0 ? String(paise / 100) : (paise / 100).toFixed(2);
}

/** Quantity: "2", "0.5". Galat ya 0 ho to null */
export function parseQty(input: string): number | null {
    const s = input.trim();
    if (!/^\d+(\.\d+)?$/.test(s)) return null;
    const n = Number(s);
    return n > 0 && n <= 100_000 ? n : null;
}

/** 0.5 -> "0.5", 2 -> "2" */
export function formatQty(n: number): string {
    return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(3)));
}