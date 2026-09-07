"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LEVEL_LABELS, LEVEL_ORDER } from "@/lib/levels";

export default function StudentLoginPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [needsName, setNeedsName] = useState(false);
  const [needsLevel, setNeedsLevel] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name: needsName ? name : undefined,
          level: needsLevel ? level : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsName || data.needsLevel) {
          if (data.needsName) setNeedsName(true);
          if (data.needsLevel) setNeedsLevel(true);
          setError("");
        } else {
          setError(data.error);
        }
        return;
      }
      router.push("/student/dashboard");
    } catch {
      setError("حصل خطأ، حاول تاني");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-sm p-7">
        <h1 className="text-xl font-bold text-center mb-1">دخول الطالب</h1>
        <p className="text-sm text-slate-500 text-center mb-6">
          اكتب الكود بتاعك
        </p>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">الكود</label>
            <input
              className="input-field text-center tracking-widest font-bold"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="AM7X9K2"
              required
            />
          </div>

          {needsName && (
            <div>
              <label className="text-sm font-medium mb-1 block">
                اسمك (أول مرة بس)
              </label>
              <input
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الثلاثي"
                required
              />
            </div>
          )}

          {needsLevel && (
            <div>
              <label className="text-sm font-medium mb-1 block">صفك</label>
              <select
                className="input-field"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                required
              >
                <option value="">اختار الصف</option>
                {LEVEL_ORDER.filter((l) => l !== "FOUNDATION").map((l) => (
                  <option key={l} value={l}>
                    {LEVEL_LABELS[l]}
                  </option>
                ))}
              </select>
            </div>
          )}

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
