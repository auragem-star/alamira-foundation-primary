"use client";

import { useRouter } from "next/navigation";

export default function TopBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <header className="w-full bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
      <div>
        <h1 className="font-bold text-[var(--brand)]">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <button
        onClick={logout}
        className="text-sm text-slate-500 hover:text-red-600"
      >
        تسجيل خروج
      </button>
    </header>
  );
}
