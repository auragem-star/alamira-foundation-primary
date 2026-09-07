import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  score: z.number().int().min(0).max(1000),
  gradeLabel: z.string().trim().max(60).optional(),
});

// الصور بتتحذف بعد يوم من التصحيح، الحلول النصية بعد يومين
const IMAGE_RETENTION_MS = 24 * 60 * 60 * 1000;
const TEXT_RETENTION_MS = 2 * 24 * 60 * 60 * 1000;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { homework: true },
  });
  if (!submission) {
    return NextResponse.json({ error: "الحل غير موجود" }, { status: 404 });
  }
  if (submission.homework.teacherId !== session.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }
  if (parsed.data.score > submission.homework.maxScore) {
    return NextResponse.json(
      { error: `الدرجة لازم تكون ${submission.homework.maxScore} أو أقل` },
      { status: 400 }
    );
  }

  const gradedAt = new Date();
  const retention =
    submission.type === "IMAGE" ? IMAGE_RETENTION_MS : TEXT_RETENTION_MS;

  const updated = await prisma.submission.update({
    where: { id },
    data: {
      score: parsed.data.score,
      gradeLabel: parsed.data.gradeLabel,
      gradedAt,
      fileDeleteAt: new Date(gradedAt.getTime() + retention),
    },
  });

  return NextResponse.json({ submission: updated });
}
