"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import { LEVEL_LABELS, LEVEL_ORDER } from "@/lib/levels";

interface Subject {
  id: string;
  name: string;
}
interface HomeworkItem {
  id: string;
  title: string;
  maxScore: number;
  level: string;
  subject: { name: string };
  _count: { submissions: number };
}

export default function TeacherDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  // نموذج إنشاء واجب
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("");
  const [maxScore, setMaxScore] = useState(20);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => setSubjects(d.subjects ?? []));
  }, []);

  async function loadHomework(sId: string) {
    setSubjectId(sId);
    setShowForm(false);
    const res = await fetch(`/api/homework?subjectId=${sId}`);
    const data = await res.json();
    setHomework(data.homework ?? []);
  }

  async function createHomework() {
    setError("");
    if (!title || !level || !subjectId) {
      setError("لازم تملأ العنوان والصف على الأقل");
      return;
    }
    setBusy(true);
    try {
      let fileUrl: string | undefined;
      if (file) {
        const form = new FormData();
        form.append("file", file);
        const upRes = await fetch("/api/upload", { method: "POST", body: form });
        const upData = await upRes.json();
        if (!upRes.ok) {
          setError(upData.error);
          setBusy(false);
          return;
        }
        fileUrl = upData.url;
      }

      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          subjectId,
          level,
          maxScore,
          fileUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setTitle("");
      setDescription("");
      setFile(null);
      setShowForm(false);
      loadHomework(subjectId);
    } catch {
      setError("حصل خطأ، حاول تاني");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <TopBar title="منصة الأميرة التعليمية" subtitle="لوحة المعلم" />
      <main className="flex-1 px-5 py-6 max-w-3xl mx-auto w-full">
        <h2 className="font-bold mb-3">اختار المادة</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => loadHomework(s.id)}
              className={
                subjectId === s.id ? "btn-primary text-sm" : "btn-secondary text-sm"
              }
            >
              {s.name}
            </button>
          ))}
        </div>

        {subjectId && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">الواجبات</h3>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="btn-primary text-sm"
              >
                {showForm ? "إلغاء" : "+ واجب جديد"}
              </button>
            </div>

            {showForm && (
              <div className="card p-5 mb-5 flex flex-col gap-3">
                <input
                  className="input-field"
                  placeholder="عنوان الواجب"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  className="input-field"
                  placeholder="وصف مختصر (اختياري)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <select
                  className="input-field"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="">اختار الصف</option>
                  {LEVEL_ORDER.map((l) => (
                    <option key={l} value={l}>
                      {LEVEL_LABELS[l]}
                    </option>
                  ))}
                </select>
                <div>
                  <label className="text-sm text-slate-500 block mb-1">
                    الدرجة النهائية
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-500 block mb-1">
                    ملف الواجب (صورة أو PDF)
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  onClick={createHomework}
                  disabled={busy}
                  className="btn-primary"
                >
                  {busy ? "جاري الحفظ..." : "نشر الواجب"}
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {homework.map((h) => (
                <Link
                  key={h.id}
                  href={`/teacher/homework/${h.id}`}
                  className="card p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{h.title}</p>
                    <p className="text-xs text-slate-500">
                      {LEVEL_LABELS[h.level]} · الدرجة النهائية {h.maxScore}
                    </p>
                  </div>
                  <span className="text-sm text-slate-500">
                    {h._count.submissions} حل
                  </span>
                </Link>
              ))}
              {homework.length === 0 && (
                <p className="text-sm text-slate-400">مفيش واجبات لسه.</p>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
