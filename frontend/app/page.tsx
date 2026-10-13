"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOwner } from "@/lib/auth";

/** Login hai to dashboard, nahi to signup */
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getOwner() ? "/dashboard" : "/signup");
  }, [router]);
  return null;
}
