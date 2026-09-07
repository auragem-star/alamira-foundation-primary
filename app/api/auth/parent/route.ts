import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const schema = z.object({
  code: z.string().trim().min(4).max(20),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }
  const normalizedCode = parsed.data.code.toUpperCase();

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
  if (!student.registeredAt) {
    return NextResponse.json(
      { error: "الطالب لسه ما سجلش دخول أول مرة من خانة الطالب" },
      { status: 400 }
    );
  }

  await createSession({
    role: "PARENT",
    id: student.id,
    code: student.code,
    name: student.studentName ?? undefined,
  });
  return NextResponse.json({ ok: true });
}
