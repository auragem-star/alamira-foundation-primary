"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";

interface Subject {
  id: string;
  name: string;
}

interface HomeworkItem {
  id: string;
  title: string;
  maxScore: number;
  subject: { name: string };
  submissions: { score: number | null; gradeLabel: string | null }[];
}

export default function StudentDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((d) => setSubjects(d.subjects ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function openSubject(subject: Subject) {
    setActiveSubject(subject);
    const res = await fetch(`/api/homework?subjectId=${subject.id}`);
    const data = await res.json();
    setHomework(data.homework ?? []);
  }

  return (
    <>
      <TopBar title="منصة الأميرة التعليمية" subtitle="لوحة الطالب" />
      <main className="flex-1 px-5 py-6 max-w-3xl mx-auto w-full">
        {!activeSubject ? (
          <>
            <h2 className="font-bold mb-4">اختار المادة</h2>
            {loading && <p className="text-slate-400 text-sm">جاري التحميل...</p>}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => openSubject(s)}
                  className="card p-4 text-center font-medium hover:-translate-y-0.5 transition"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveSubject(null)}
              className="text-sm text-slate-500 mb-4 hover:text-slate-700"
            >
              ← رجوع للمواد
            </button>
            <h2 className="font-bold mb-4">واجبات {activeSubject.name}</h2>
            {homework.length === 0 && (
              <p className="text-sm text-slate-400">مفيش واجبات لسه.</p>
            )}
            <div className="flex flex-col gap-3">
              {homework.map((h) => {
                const sub = h.submissions[0];
                return (
                  <Link
                    key={h.id}
                    href={`/student/homework/${h.id}`}
                    className="card p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{h.title}</p>
                      <p className="text-xs text-slate-500">
                        الدرجة النهائية: {h.maxScore}
                      </p>
                    </div>
                    {sub?.score != null ? (
                      <span className="text-sm font-bold text-green-700">
                        {sub.score} / {h.maxScore}
                      </span>
                    ) : sub ? (
                      <span className="text-xs text-amber-600">
                        بانتظار التصحيح
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">لسه ما اتحلش</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>
    </>
  );
}
