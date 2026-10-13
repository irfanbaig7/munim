import type { Owner } from "./types";

const OWNER_KEY = "munim.owner";

/* ---------- OTP (abhi MOCK) ----------
 * Backend banne par dono functions ko API call se badal denge:
 *   POST /auth/send-otp   { phone }
 *   POST /auth/verify-otp { phone, code }
 * Tab tak demo OTP hamesha 123456 hai.
 */
export const DEMO_OTP = "123456";

export async function sendOtp(_phone: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 600));
}

export async function verifyOtp(_phone: string, code: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 500));
  return code === DEMO_OTP;
}

/* ---------- Session (abhi localStorage) ---------- */
export function getOwner(): Owner | null {
  try {
    const raw = localStorage.getItem(OWNER_KEY);
    return raw ? (JSON.parse(raw) as Owner) : null;
  } catch {
    return null;
  }
}

export function saveOwner(owner: Owner) {
  localStorage.setItem(OWNER_KEY, JSON.stringify(owner));
}

export function logout() {
  localStorage.removeItem(OWNER_KEY);
}
