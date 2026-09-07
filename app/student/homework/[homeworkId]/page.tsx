"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";

interface HomeworkDetail {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  maxScore: number;
  subject: { name: string };
}
interface MySubmission {
  id: string;
  type: "TEXT" | "IMAGE";
  textContent: string | null;
  fileUrl: string | null;
  score: number | null;
  gradeLabel: string | null;
  gradedAt: string | null;
}

export default function StudentHomeworkPage({
  params,
}: {
  params: Promise<{ homeworkId: string }>;
}) {
  const { homeworkId } = use(params);
  const [homework, setHomework] = useState<HomeworkDetail | null>(null);
  const [mySubmission, setMySubmission] = useState<MySubmission | null>(null);
  const [mode, setMode] = useState<"TEXT" | "IMAGE">("TEXT");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/homework/${homeworkId}`)
      .then((r) => r.json())
      .then((d) => {
        setHomework(d.homework);
        setMySubmission(d.mySubmission);
      });
  }, [homeworkId]);

  async function submit() {
    setError("");
    setBusy(true);
    try {
      let fileUrl: string | undefined;
      if (mode === "IMAGE") {
        if (!file) {
          setError("اختار صورة أو ملف PDF الأول");
          setBusy(false);
          return;
        }
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

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeworkId,
          type: mode,
          textContent: mode === "TEXT" ? text : undefined,
          fileUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setDone(true);
    } catch {
      setError("حصل خطأ، حاول تاني");
    } finally {
      setBusy(false);
    }
  }

  if (!homework) {
    return (
      <>
        <TopBar title="منصة الأميرة التعليمية" subtitle="لوحة الطالب" />
        <main className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full">
          <p className="text-slate-400 text-sm">جاري التحميل...</p>
        </main>
      </>
    );
  }

  const alreadyGraded = mySubmission?.gradedAt;
  const alreadySubmitted = !!mySubmission && !done;

  return (
    <>
      <TopBar title="منصة الأميرة التعليمية" subtitle="لوحة الطالب" />
      <main className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full">
        <Link
          href="/student/dashboard"
          className="text-sm text-slate-500 mb-4 inline-block hover:text-slate-700"
        >
          ← رجوع
        </Link>

        <div className="card p-5 mb-5">
          <p className="text-xs text-slate-400 mb-1">{homework.subject.name}</p>
          <h2 className="font-bold text-lg mb-2">{homework.title}</h2>
          {homework.description && (
            <p className="text-sm text-slate-600 mb-3">{homework.description}</p>
          )}
          <p className="text-sm text-slate-500 mb-3">
            الدرجة النهائية: {homework.maxScore}
          </p>
          {homework.fileUrl && (
            <a
              href={homework.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-block text-sm"
            >
              فتح ملف الواجب
            </a>
          )}
        </div>

        {done || (mySubmission && mySubmission.gradedAt) ? (
          <div className="card p-5 text-center">
            {mySubmission?.score != null ? (
              <>
                <p className="text-sm text-slate-500 mb-1">درجتك</p>
                <p className="text-3xl font-extrabold text-green-700">
                  {mySubmission.score} / {homework.maxScore}
                </p>
                {mySubmission.gradeLabel && (
                  <p className="text-sm text-slate-500 mt-1">
                    التقدير: {mySubmission.gradeLabel}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-amber-600">
                تم تسليم الحل، بانتظار تصحيح المدرس
              </p>
            )}
          </div>
        ) : alreadySubmitted ? (
          <div className="card p-5 text-center">
            <p className="text-sm text-amber-600">
              تم تسليم الحل، بانتظار تصحيح المدرس
            </p>
          </div>
        ) : (
          <div className="card p-5">
            <h3 className="font-bold mb-3">حل الواجب</h3>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode("TEXT")}
                className={mode === "TEXT" ? "btn-primary" : "btn-secondary"}
              >
                كتابة الحل
              </button>
              <button
                onClick={() => setMode("IMAGE")}
                className={mode === "IMAGE" ? "btn-primary" : "btn-secondary"}
              >
                رفع صورة الحل
              </button>
            </div>

            {mode === "TEXT" ? (
              <textarea
                className="input-field min-h-[160px]"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="اكتب حل الواجب هنا..."
              />
            ) : (
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
            )}

            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

            <button
              onClick={submit}
              disabled={busy}
              className="btn-primary mt-4 w-full"
            >
              {busy ? "جاري الإرسال..." : "تسليم الحل"}
            </button>
          </div>
        )}
      </main>
    </>
  );
}
