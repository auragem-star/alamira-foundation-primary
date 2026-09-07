import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { LEVEL_ORDER } from "@/lib/levels";

const schema = z.object({
  code: z.string().trim().min(4).max(20),
  name: z.string().trim().min(2).max(60).optional(),
  level: z.enum(LEVEL_ORDER).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }
  const { code, name, level } = parsed.data;
  const normalizedCode = code.toUpperCase();

  const student = await prisma.studentCode.findUnique({
    where: { code: normalizedCode },
  });

  if (!student) {
    return NextResponse.json({ error: "الكود غير موجود" }, { status: 404 });
  }
  if (!student.active) {
    return NextResponse.json(
      { error: "الكود موقوف حاليًا. تواصل مع الإدارة." },
      { status: 403 }
    );
  }

  // أول مرة تسجيل: لازم اسم، ولو الكود مش مرتبط بمرحلة (تأسيس مثلا مرتبطة تلقائيًا) لازم صف
  if (!student.registeredAt) {
    if (!name) {
      return NextResponse.json(
        { error: "اكتب اسمك الأول مرة", needsName: true },
        { status: 400 }
      );
    }
    let finalLevel = student.level;
    if (!finalLevel) {
      if (!level) {
        return NextResponse.json(
          { error: "اختار الصف", needsLevel: true },
          { status: 400 }
        );
      }
      finalLevel = level;
    }
    const updated = await prisma.studentCode.update({
      where: { id: student.id },
      data: { studentName: name, level: finalLevel, registeredAt: new Date() },
    });
    await createSession({
      role: "STUDENT",
      id: updated.id,
      code: updated.code,
      name: updated.studentName ?? undefined,
    });
    return NextResponse.json({ ok: true });
  }

  await createSession({
    role: "STUDENT",
    id: student.id,
    code: student.code,
    name: student.studentName ?? undefined,
  });
  return NextResponse.json({ ok: true });
}
