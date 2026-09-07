import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateStudentCode, generateTeacherCode } from "@/lib/codes";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

// GET ?q=اسم الطالب -> بحث لتفعيل/إلغاء التفعيل
export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ students: [] });

  const students = await prisma.studentCode.findMany({
    where: { studentName: { contains: q } },
    orderBy: { studentName: "asc" },
    take: 50,
  });
  return NextResponse.json({ students });
}

const generateSchema = z.object({
  kind: z.enum(["STUDENT", "TEACHER"]),
  level: z.enum(["FOUNDATION", "PRIMARY"]).optional(), // للطالب بس
  count: z.number().int().min(1).max(700),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }
  const { kind, level, count } = parsed.data;

  if (kind === "TEACHER") {
    const codes = Array.from({ length: count }).map(() => generateTeacherCode());
    await prisma.teacherCode.createMany({
      data: codes.map((code) => ({ code })),
      skipDuplicates: true,
    });
    return NextResponse.json({ codes });
  }

  // STUDENT
  const batch = await prisma.codeBatch.create({
    data: {
      kind: "STUDENT",
      level: level === "FOUNDATION" ? "FOUNDATION" : null,
      count,
    },
  });
  const codes = Array.from({ length: count }).map(() => generateStudentCode());
  await prisma.studentCode.createMany({
    data: codes.map((code) => ({
      code,
      level: level === "FOUNDATION" ? "FOUNDATION" : null,
      batchId: batch.id,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ batchId: batch.id, codes });
}
