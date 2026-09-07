import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { LEVEL_ORDER } from "@/lib/levels";

// GET: قايمة الواجبات
// - طالب: واجبات صفه بس + هل هو حلها ولا لأ
// - معلم: كل الواجبات اللي رفعها هو
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId") ?? undefined;

  if (session.role === "STUDENT") {
    const student = await prisma.studentCode.findUnique({
      where: { id: session.id },
    });
    if (!student || !student.level) {
      return NextResponse.json({ error: "الحساب غير مكتمل" }, { status: 400 });
    }
    const homework = await prisma.homework.findMany({
      where: { level: student.level, ...(subjectId ? { subjectId } : {}) },
      include: {
        subject: true,
        submissions: {
          where: { studentCodeId: student.id },
          select: { id: true, score: true, gradeLabel: true, submittedAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ homework });
  }

  if (session.role === "TEACHER") {
    const homework = await prisma.homework.findMany({
      where: {
        teacherId: session.id,
        ...(subjectId ? { subjectId } : {}),
      },
      include: {
        subject: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ homework });
  }

  return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
}

const createSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),
  subjectId: z.string().min(1),
  level: z.enum(LEVEL_ORDER),
  maxScore: z.number().int().min(1).max(1000).default(20),
  fileUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const homework = await prisma.homework.create({
    data: {
      ...parsed.data,
      teacherId: session.id,
    },
  });

  return NextResponse.json({ homework });
}
