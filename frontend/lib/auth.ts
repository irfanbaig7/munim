import { api, ApiError } from "./api";
import type { Owner } from "./types";

/** Sirf demo hint ke liye (.env.local mein set hota hai) */
export const DEMO_OTP = process.env.NEXT_PUBLIC_DEMO_OTP;

export const sendOtp = (phone: string) => api<{ ok: true }>("/auth/send-otp", { method: "POST", body: { phone } });

export async function verifyOtp(phone: string, name: string, code: string): Promise<Owner> {
  const { owner } = await api<{ owner: Owner }>("/auth/verify-otp", { method: "POST", body: { phone, name, code } });
  return owner;
}

/** Login hai to dukandaar, nahi to null */
export async function getMe(): Promise<Owner | null> {
  try {
    const { owner } = await api<{ owner: Owner }>("/auth/me");
    return owner;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
}

export const logout = () => api<{ ok: true }>("/auth/logout", { method: "POST" });