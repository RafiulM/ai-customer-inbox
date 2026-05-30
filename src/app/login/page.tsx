"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SparkIcon } from "@/components/icons";
import { insforge } from "@/lib/insforge";

type Mode = "signin" | "signup" | "verify";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Already signed in? Skip the form.
  useEffect(() => {
    let cancelled = false;
    insforge.auth.getCurrentUser().then(({ data }) => {
      if (cancelled) return;
      if (data?.user) router.replace("/dashboard");
      else setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  function resetMessages() {
    setError(null);
    setInfo(null);
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    const { data, error } = await insforge.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.statusCode === 403) {
        setMode("verify");
        setInfo("Email belum diverifikasi. Masukkan kode 6 digit dari email Anda.");
      } else {
        setError(error.message || "Email atau kata sandi salah.");
      }
      return;
    }
    if (data?.accessToken) router.replace("/dashboard");
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    setLoading(true);
    const { data, error } = await insforge.auth.signUp({ email, password, name });
    setLoading(false);
    if (error) {
      setError(error.message || "Pendaftaran gagal.");
      return;
    }
    if (data?.requireEmailVerification) {
      setMode("verify");
      setInfo("Kami mengirim kode verifikasi 6 digit ke email Anda.");
    } else if (data?.accessToken) {
      router.replace("/dashboard");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    const { data, error } = await insforge.auth.verifyEmail({ email, otp: code });
    setLoading(false);
    if (error) {
      setError(error.message || "Kode tidak valid atau kedaluwarsa.");
      return;
    }
    if (data?.user) router.replace("/dashboard");
  }

  async function resendCode() {
    resetMessages();
    const { error } = await insforge.auth.resendVerificationEmail({ email });
    if (error) setError(error.message || "Gagal mengirim ulang kode.");
    else setInfo("Kode verifikasi baru telah dikirim.");
  }

  if (checking) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-50">
        <SparkIcon width={28} height={28} className="animate-pulse text-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-full">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand-600 p-12 text-white lg:flex">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 0, transparent 35%), radial-gradient(circle at 80% 70%, white 0, transparent 30%)",
          }}
        />
        <div className="relative flex items-center gap-2 text-lg font-semibold">
          <SparkIcon width={24} height={24} />
          AI Customer Support Inbox
        </div>
        <div className="relative">
          <h1 className="text-3xl font-semibold leading-tight">
            Balas pelanggan lebih cepat,
            <br />
            dengan AI di sisi Anda.
          </h1>
          <p className="mt-4 max-w-md text-brand-100">
            Ringkasan obrolan, draf balasan ber-SOP, dan analisis sentimen otomatis —
            agar agen CS fokus pada yang penting.
          </p>
          <div className="mt-8 flex gap-6 text-sm">
            <div>
              <div className="text-2xl font-semibold">68%</div>
              <div className="text-brand-100">waktu agen hemat</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">3 detik</div>
              <div className="text-brand-100">rata-rata draf AI</div>
            </div>
          </div>
        </div>
        <div className="relative text-sm text-brand-100">
          © 2026 IUL Tech — Human-in-the-loop AI.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 text-lg font-semibold text-brand-600">
              <SparkIcon width={22} height={22} />
              AI Customer Support Inbox
            </div>
          </div>

          {mode === "verify" ? (
            <>
              <h2 className="text-2xl font-semibold text-slate-900">Verifikasi email</h2>
              <p className="mt-1 text-sm text-slate-500">
                Masukkan kode 6 digit yang dikirim ke <b>{email}</b>.
              </p>
              <form onSubmit={handleVerify} className="mt-6 space-y-4">
                <input
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-center text-lg tracking-[0.4em] text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <Banner error={error} info={info} />
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {loading ? "Memverifikasi…" : "Verifikasi & Masuk"}
                </button>
              </form>
              <div className="mt-4 flex justify-between text-sm">
                <button onClick={resendCode} className="font-medium text-brand-600 hover:underline">
                  Kirim ulang kode
                </button>
                <button
                  onClick={() => {
                    setMode("signin");
                    resetMessages();
                  }}
                  className="text-slate-500 hover:underline"
                >
                  Kembali
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-slate-900">
                {mode === "signin" ? "Masuk ke dasbor" : "Buat akun agen"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {mode === "signin"
                  ? "Masuk untuk mengelola pesan pelanggan."
                  : "Daftar sebagai agen Customer Service."}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      resetMessages();
                    }}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      mode === m
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {m === "signin" ? "Masuk" : "Daftar"}
                  </button>
                ))}
              </div>

              <form
                onSubmit={mode === "signin" ? handleSignIn : handleSignUp}
                className="mt-6 space-y-4"
              >
                {mode === "signup" && (
                  <Field label="Nama lengkap">
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Anda"
                      className={inputCls}
                    />
                  </Field>
                )}
                <Field label="Email">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agen@perusahaan.com"
                    className={inputCls}
                  />
                </Field>
                <Field label="Kata sandi">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "Minimal 6 karakter" : "••••••••"}
                    className={inputCls}
                  />
                </Field>

                <Banner error={error} info={info} />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                >
                  {loading
                    ? "Memproses…"
                    : mode === "signin"
                      ? "Masuk"
                      : "Daftar"}
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-xs text-slate-400">
            Didukung InsForge — Auth, Database & Email.
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function Banner({ error, info }: { error: string | null; info: string | null }) {
  if (!error && !info) return null;
  return (
    <div
      className={`rounded-lg px-3 py-2 text-xs ${
        error ? "bg-red-50 text-red-700" : "bg-brand-50 text-brand-700"
      }`}
    >
      {error ?? info}
    </div>
  );
}
