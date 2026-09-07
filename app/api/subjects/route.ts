import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  if (session.role === "STUDENT") {
    const student = await prisma.studentCode.findUnique({
      where: { id: session.id },
    });
    if (!student || !student.level) return NextResponse.json({ subjects: [] });
    const subjects = await prisma.subject.findMany({
      where: { OR: [{ level: student.level }, { level: null }] },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ subjects });
  }

  // المعلم بيشوف كل المواد ويختار
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ subjects });
}
