import Link from "next/link";

const roles = [
  {
    href: "/student/login",
    title: "طالب",
    desc: "الدخول بالكود لحل الواجبات والامتحانات",
    icon: "🎒",
  },
  {
    href: "/parent/login",
    title: "ولي أمر",
    desc: "الدخول بكود ابنك لمتابعة الدرجات",
    icon: "👨‍👩‍👧",
  },
  {
    href: "/teacher/login",
    title: "معلم",
    desc: "الدخول لرفع الواجبات وتصحيحها",
    icon: "🧑‍🏫",
  },
];

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--brand)]">
          منصة الأميرة التعليمية
        </h1>
        <p className="text-slate-500 mt-2">مرحلتا التأسيس والابتدائي</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
        {roles.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="card p-6 flex flex-col items-center text-center gap-3 hover:-translate-y-0.5 hover:shadow-md transition"
          >
            <span className="text-4xl">{r.icon}</span>
            <span className="font-bold text-lg">{r.title}</span>
            <span className="text-sm text-slate-500">{r.desc}</span>
          </Link>
        ))}
      </div>

      <Link
        href="/admin/login"
        className="mt-14 text-xs text-slate-400 hover:text-slate-600 underline underline-offset-4"
      >
        دخول الإدارة
      </Link>
    </main>
  );
}
