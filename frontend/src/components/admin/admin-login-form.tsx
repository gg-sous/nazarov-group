"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      if (!response.ok) {
        setError(
          response.status === 429
            ? "Слишком много попыток. Попробуйте через 5 минут."
            : "Неверный логин или пароль.",
        );
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Сервер недоступен. Попробуйте ещё раз.");
    } finally {
      setPending(false);
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-4 py-12 text-[#f5f5f5]">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-[#d71920] text-sm font-black">
            NG
          </span>
          <span className="text-lg font-semibold tracking-wide">
            NazarovGroup
          </span>
        </Link>
        <section className="rounded-xl border border-white/10 bg-[#111] p-6 sm:p-8">
          <div className="mb-7 flex size-11 items-center justify-center rounded-lg border border-white/10 bg-[#0b0b0b]">
            <LockKeyhole className="size-5 text-[#d71920]" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Вход в управление
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#858585]">
            Доступ только для администратора NazarovGroup.
          </p>
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#9a9a9a]">
                Логин
              </span>
              <input
                name="username"
                autoComplete="username"
                required
                className="min-h-12 w-full rounded-lg border border-white/10 bg-[#090909] px-4 text-sm outline-none focus:border-[#d71920]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[#9a9a9a]">
                Пароль
              </span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="min-h-12 w-full rounded-lg border border-white/10 bg-[#090909] px-4 text-sm outline-none focus:border-[#d71920]"
              />
            </label>
            {error ? (
              <p
                role="alert"
                className="rounded-lg border border-[#d71920]/25 bg-[#d71920]/5 px-3 py-2.5 text-sm text-red-300"
              >
                {error}
              </p>
            ) : null}
            <button
              disabled={pending}
              className="min-h-12 w-full rounded-lg bg-[#d71920] px-5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
            >
              {pending ? "Проверяем…" : "Войти"}
            </button>
          </form>
        </section>
        <p className="mt-5 text-center text-xs text-[#606060]">
          Сессия защищена HttpOnly-cookie и автоматически завершится.
        </p>
      </div>
    </main>
  );
}
