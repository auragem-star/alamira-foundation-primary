"use client";

import { useState } from "react";
import TopBar from "@/components/TopBar";
import { LEVEL_LABELS } from "@/lib/levels";

type Tab = "generate" | "manage" | "grades";

interface StudentRow {
  id: string;
  studentName: string | null;
  code: string;
  level: string | null;
  active: boolean;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("generate");

  // توليد الأكواد
  const [genKind, setGenKind] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [genLevel, setGenLevel] = useState<"FOUNDATION" | "PRIMARY">("PRIMARY");
  const [genCount, setGenCount] = useState(700);
  const [genBusy, setGenBusy] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [genMsg, setGenMsg] = useState("");

  // البحث بالاسم
  const [q, setQ] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [searchBusy, setSearchBusy] = useState(false);

  // البحث بالكود للدرجات
  const [gradeCode, setGradeCode] = useState("");
  interface GradeInfo {
    studentName: string | null;
    level: string | null;
    submissions: {
      id: string;
      score: number | null;
      gradeLabel: string | null;
      homework: { title: string; maxScore: number; subject: { name: string } };
    }[];
  }
  const [gradeResult, setGradeResult] = useState<GradeInfo | null>(null);
  const [gradeError, setGradeError] = useState("");

  async function generate() {
    setGenBusy(true);
    setGenMsg("");
    setBatchId(null);
    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: genKind,
          level: genKind === "STUDENT" ? genLevel : undefined,
          count: genCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenMsg(data.error);
        return;
      }
      if (genKind === "STUDENT") {
        setBatchId(data.batchId);
        setGenMsg(`تم توليد ${genCount} كود بنجاح`);
      } else {
        setGenMsg(`تم توليد ${data.codes.length} كود معلم: ${data.codes.join("، ")}`);
      }
    } finally {
      setGenBusy(false);
    }
  }

  async function search() {
    setSearchBusy(true);
    try {
      const res = await fetch(`/api/admin/codes?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setStudents(data.students ?? []);
    } finally {
      setSearchBusy(false);
    }
  }

  async function toggle(id: string) {
    await fetch(`/api/admin/codes/${id}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "STUDENT" }),
    });
    search();
  }

  async function searchGrades() {
    setGradeError("");
    setGradeResult(null);
    const res = await fetch(`/api/admin/grades?code=${encodeURIComponent(gradeCode.toUpperCase())}`);
    const data = await res.json();
    if (!res.ok) {
      setGradeError(data.error);
      return;
    }
    setGradeResult(data.student);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "generate", label: "توليد أكواد" },
    { id: "manage", label: "تفعيل / إلغاء" },
    { id: "grades", label: "متابعة الدرجات" },
  ];

  return (
    <>
      <TopBar title="منصة الأميرة التعليمية" subtitle="لوحة الإدارة" />
      <main className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full">
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={tab === t.id ? "btn-primary text-sm" : "btn-secondary text-sm"}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "generate" && (
          <div className="card p-5 flex flex-col gap-3">
            <div>
              <label className="text-sm text-slate-500 block mb-1">النوع</label>
              <select
                className="input-field"
                value={genKind}
                onChange={(e) => setGenKind(e.target.value as "STUDENT" | "TEACHER")}
              >
                <option value="STUDENT">أكواد طلاب</option>
                <option value="TEACHER">أكواد معلمين</option>
              </select>
            </div>
            {genKind === "STUDENT" && (
              <div>
                <label className="text-sm text-slate-500 block mb-1">المرحلة</label>
                <select
                  className="input-field"
                  value={genLevel}
                  onChange={(e) => setGenLevel(e.target.value as "FOUNDATION" | "PRIMARY")}
                >
                  <option value="FOUNDATION">تأسيس</option>
                  <option value="PRIMARY">ابتدائي (الطالب يحدد صفه بنفسه)</option>
                </select>
              </div>
            )}
            <div>
              <label className="text-sm text-slate-500 block mb-1">العدد</label>
              <input
                type="number"
                className="input-field"
                value={genCount}
                onChange={(e) => setGenCount(Number(e.target.value))}
              />
            </div>
            <button onClick={generate} disabled={genBusy} className="btn-primary">
              {genBusy ? "جاري التوليد..." : "توليد"}
            </button>
            {genMsg && <p className="text-sm text-green-700">{genMsg}</p>}
            {batchId && (
              <a
                href={`/api/admin/codes/download?batchId=${batchId}`}
                className="btn-secondary text-center"
              >
                تحميل الأكواد (CSV)
              </a>
            )}
          </div>
        )}

        {tab === "manage" && (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                className="input-field"
                placeholder="ابحث باسم الطالب"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button onClick={search} disabled={searchBusy} className="btn-primary">
                بحث
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {students.map((s) => (
                <div key={s.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.studentName}</p>
                    <p className="text-xs text-slate-400">
                      {s.code} · {s.level ? LEVEL_LABELS[s.level] : "لسه ما سجلش"}
                    </p>
                  </div>
                  <button
                    onClick={() => toggle(s.id)}
                    className={
                      s.active
                        ? "text-sm text-red-600 border border-red-200 rounded-lg px-3 py-1.5"
                        : "text-sm text-green-700 border border-green-200 rounded-lg px-3 py-1.5"
                    }
                  >
                    {s.active ? "إلغاء التفعيل" : "تفعيل"}
                  </button>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-sm text-slate-400">دوّر باسم طالب فوق.</p>
              )}
            </div>
          </div>
        )}

        {tab === "grades" && (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                className="input-field"
                placeholder="كود الطالب"
                value={gradeCode}
                onChange={(e) => setGradeCode(e.target.value.toUpperCase())}
              />
              <button onClick={searchGrades} className="btn-primary">
                بحث
              </button>
            </div>
            {gradeError && <p className="text-sm text-red-600">{gradeError}</p>}
            {gradeResult && (
              <div>
                <div className="card p-4 mb-3">
                  <p className="font-bold">{gradeResult.studentName}</p>
                  <p className="text-xs text-slate-500">
                    {gradeResult.level ? LEVEL_LABELS[gradeResult.level] : ""}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {gradeResult.submissions.map((s) => (
                    <div
                      key={s.id}
                      className="card p-3 flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-medium">{s.homework.title}</p>
                        <p className="text-xs text-slate-400">
                          {s.homework.subject.name}
                        </p>
                      </div>
                      <span>
                        {s.score != null
                          ? `${s.score} / ${s.homework.maxScore}`
                          : "بانتظار التصحيح"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
