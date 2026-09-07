"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ParentLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      router.push("/parent/dashboard");
    } catch {
      setError("حصل خطأ، حاول تاني");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-sm p-7">
        <h1 className="text-xl font-bold text-center mb-1">دخول ولي الأمر</h1>
        <p className="text-sm text-slate-500 text-center mb-6">
          ادخل بكود ابنك لمتابعة درجاته
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">كود الطالب</label>
            <input
              className="input-field text-center tracking-widest font-bold"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="AM7X9K2"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "جاري الدخول..." : "دخول"}
          </button>
        </form>

        <Link
          href="/"
          className="block text-center text-xs text-slate-400 mt-5 hover:text-slate-600"
        >
          رجوع للصفحة الرئيسية
        </Link>
      </div>
    </main>
  );
}
