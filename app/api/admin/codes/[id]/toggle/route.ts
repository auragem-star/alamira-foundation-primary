import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  kind: z.enum(["STUDENT", "TEACHER"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  if (parsed.data.kind === "STUDENT") {
    const student = await prisma.studentCode.findUnique({ where: { id } });
    if (!student) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    const updated = await prisma.studentCode.update({
      where: { id },
      data: { active: !student.active },
    });
    return NextResponse.json({ active: updated.active });
  }

  const teacher = await prisma.teacherCode.findUnique({ where: { id } });
  if (!teacher) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  const updated = await prisma.teacherCode.update({
    where: { id },
    data: { active: !teacher.active },
  });
  return NextResponse.json({ active: updated.active });
}
