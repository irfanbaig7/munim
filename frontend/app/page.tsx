"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth";

/** Login hai to dashboard, nahi to signup */
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    getMe()
      .then((o) => router.replace(o ? "/dashboard" : "/signup"))
      .catch(() => router.replace("/signup"));
  }, [router]);
  return null;
}