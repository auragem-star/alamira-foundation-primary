import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const schema = z.object({
  code: z.string().trim().min(4).max(20),
  name: z.string().trim().min(2).max(60).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }
  const { code, name } = parsed.data;
  const normalizedCode = code.toUpperCase();

  const teacher = await prisma.teacherCode.findUnique({
    where: { code: normalizedCode },
  });

  if (!teacher) {
    return NextResponse.json({ error: "الكود غير موجود" }, { status: 404 });
  }
  if (!teacher.active) {
    return NextResponse.json(
      { error: "الكود موقوف حاليًا. تواصل مع الإدارة." },
      { status: 403 }
    );
  }

  if (!teacher.teacherName && name) {
    await prisma.teacherCode.update({
      where: { id: teacher.id },
      data: { teacherName: name },
    });
  }

  await createSession({
    role: "TEACHER",
    id: teacher.id,
    code: teacher.code,
    name: teacher.teacherName ?? name,
  });
  return NextResponse.json({ ok: true });
}
