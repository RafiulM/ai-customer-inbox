"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { ensureProfile } from "@/lib/db";
import { insforge } from "@/lib/insforge";
import type { User } from "@/lib/types";
import { SparkIcon } from "./icons";

interface AuthState {
  profile: User;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
        <SparkIcon width={24} height={24} className="animate-pulse" />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "out">("loading");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await insforge.auth.getCurrentUser();
      if (cancelled) return;

      if (error || !data?.user) {
        setStatus("out");
        router.replace("/login");
        return;
      }

      try {
        const p = await ensureProfile(
          data.user.id,
          data.user.profile?.name ?? "",
          data.user.email,
        );
        if (cancelled) return;
        setProfile(p);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setStatus("out");
        router.replace("/login");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function signOut() {
    await insforge.auth.signOut();
    router.replace("/login");
  }

  if (status !== "ready" || !profile) {
    return <FullScreenLoader label="Memuat sesi…" />;
  }

  return (
    <AuthContext.Provider value={{ profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
