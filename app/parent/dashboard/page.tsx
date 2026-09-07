"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import { LEVEL_LABELS } from "@/lib/levels";

interface GradedSubmission {
  id: string;
  score: number | null;
  gradeLabel: string | null;
  gradedAt: string | null;
  homework: {
    title: string;
    maxScore: number;
    subject: { name: string };
  };
}
interface StudentInfo {
  studentName: string | null;
  level: string | null;
  submissions: GradedSubmission[];
}

export default function ParentDashboard() {
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/parent/grades")
      .then((r) => r.json())
      .then((d) => setStudent(d.student ?? null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <TopBar title="منصة الأميرة التعليمية" subtitle="متابعة ولي الأمر" />
      <main className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full">
        {loading && <p className="text-slate-400 text-sm">جاري التحميل...</p>}
        {student && (
          <>
            <div className="card p-5 mb-5">
              <p className="font-bold text-lg">{student.studentName}</p>
              <p className="text-sm text-slate-500">
                {student.level ? LEVEL_LABELS[student.level] : ""}
              </p>
            </div>

            <h2 className="font-bold mb-3">الدرجات</h2>
            {student.submissions.length === 0 && (
              <p className="text-sm text-slate-400">مفيش درجات مسجلة لسه.</p>
            )}
            <div className="flex flex-col gap-3">
              {student.submissions.map((s) => (
                <div
                  key={s.id}
                  className="card p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{s.homework.title}</p>
                    <p className="text-xs text-slate-500">
                      {s.homework.subject.name}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-green-700">
                      {s.score} / {s.homework.maxScore}
                    </p>
                    {s.gradeLabel && (
                      <p className="text-xs text-slate-500">{s.gradeLabel}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
