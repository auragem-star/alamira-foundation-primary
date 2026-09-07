"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";

interface Submission {
  id: string;
  type: "TEXT" | "IMAGE";
  textContent: string | null;
  fileUrl: string | null;
  score: number | null;
  gradeLabel: string | null;
  gradedAt: string | null;
  deleted: boolean;
  student: { studentName: string | null; code: string };
}
interface HomeworkDetail {
  id: string;
  title: string;
  maxScore: number;
  subject: { name: string };
}

export default function TeacherHomeworkPage({
  params,
}: {
  params: Promise<{ homeworkId: string }>;
}) {
  const { homeworkId } = use(params);
  const [homework, setHomework] = useState<HomeworkDetail | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [score, setScore] = useState<number | "">("");
  const [gradeLabel, setGradeLabel] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    fetch(`/api/homework/${homeworkId}`)
      .then((r) => r.json())
      .then((d) => {
        setHomework(d.homework);
        setSubmissions(d.submissions ?? []);
      });
  }

  useEffect(load, [homeworkId]);

  function openGrading(s: Submission) {
    setOpenId(s.id);
    setScore(s.score ?? "");
    setGradeLabel(s.gradeLabel ?? "");
  }

  async function saveGrade(submissionId: string) {
    if (score === "") return;
    setBusy(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: Number(score), gradeLabel: gradeLabel || undefined }),
      });
      if (res.ok) {
        setOpenId(null);
        load();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <TopBar title="منصة الأميرة التعليمية" subtitle="لوحة المعلم" />
      <main className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full">
        <Link
          href="/teacher/dashboard"
          className="text-sm text-slate-500 mb-4 inline-block hover:text-slate-700"
        >
          ← رجوع
        </Link>

        {homework && (
          <div className="card p-5 mb-5">
            <p className="text-xs text-slate-400 mb-1">{homework.subject.name}</p>
            <h2 className="font-bold text-lg">{homework.title}</h2>
            <p className="text-sm text-slate-500">
              الدرجة النهائية: {homework.maxScore}
            </p>
          </div>
        )}

        <h3 className="font-bold mb-3">الطلبة اللي حلوا</h3>
        <div className="flex flex-col gap-3">
          {submissions.map((s) => (
            <div key={s.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.student.studentName}</p>
                  <p className="text-xs text-slate-400">{s.student.code}</p>
                </div>
                {s.score != null ? (
                  <span className="text-sm font-bold text-green-700">
                    {s.score} / {homework?.maxScore}
                  </span>
                ) : (
                  <button
                    onClick={() => openGrading(s)}
                    className="btn-secondary text-sm"
                  >
                    تصحيح
                  </button>
                )}
              </div>

              {openId === s.id && (
                <div className="mt-3 border-t pt-3 flex flex-col gap-3">
                  {s.deleted ? (
                    <p className="text-xs text-slate-400">
                      الحل اتحذف تلقائيًا (اتصحح قبل كده)
                    </p>
                  ) : s.type === "TEXT" ? (
                    <p className="text-sm bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">
                      {s.textContent}
                    </p>
                  ) : (
                    s.fileUrl && (
                      <a
                        href={s.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm inline-block w-fit"
                      >
                        فتح صورة الحل
                      </a>
                    )
                  )}

                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="input-field"
                      placeholder="الدرجة"
                      value={score}
                      onChange={(e) =>
                        setScore(e.target.value === "" ? "" : Number(e.target.value))
                      }
                    />
                    <input
                      className="input-field"
                      placeholder="التقدير (اختياري)"
                      value={gradeLabel}
                      onChange={(e) => setGradeLabel(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => saveGrade(s.id)}
                    disabled={busy}
                    className="btn-primary"
                  >
                    {busy ? "جاري الحفظ..." : "حفظ الدرجة"}
                  </button>
                </div>
              )}
            </div>
          ))}
          {submissions.length === 0 && (
            <p className="text-sm text-slate-400">محدش حل الواجب ده لسه.</p>
          )}
        </div>
      </main>
    </>
  );
}
