"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      router.push("/teacher/dashboard");
    } catch {
      setError("حصل خطأ، حاول تاني");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-sm p-7">
        <h1 className="text-xl font-bold text-center mb-1">دخول المعلم</h1>
        <p className="text-sm text-slate-500 text-center mb-6">
          اكتب الكود الخاص بك في منصة التأسيس والابتدائي
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">الكود</label>
            <input
              className="input-field text-center tracking-widest font-bold"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="AT7X9K2"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              اسمك (أول مرة بس)
            </label>
            <input
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم المعلم"
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
