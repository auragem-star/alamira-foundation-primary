import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z
  .object({
    homeworkId: z.string().min(1),
    type: z.enum(["TEXT", "IMAGE"]),
    textContent: z.string().trim().min(1).max(20000).optional(),
    fileUrl: z.string().url().optional(),
  })
  .refine(
    (d) =>
      (d.type === "TEXT" && !!d.textContent) ||
      (d.type === "IMAGE" && !!d.fileUrl),
    { message: "لازم تكتب الحل أو ترفع صورة" }
  );

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }
  const { homeworkId, type, textContent, fileUrl } = parsed.data;

  const homework = await prisma.homework.findUnique({ where: { id: homeworkId } });
  if (!homework) {
    return NextResponse.json({ error: "الواجب غير موجود" }, { status: 404 });
  }

  const existing = await prisma.submission.findUnique({
    where: {
      homeworkId_studentCodeId: { homeworkId, studentCodeId: session.id },
    },
  });
  if (existing?.gradedAt) {
    return NextResponse.json(
      { error: "المدرس صحح الواجب بالفعل، مينفعش تعدل الحل" },
      { status: 400 }
    );
  }

  const submission = await prisma.submission.upsert({
    where: {
      homeworkId_studentCodeId: { homeworkId, studentCodeId: session.id },
    },
    create: {
      homeworkId,
      studentCodeId: session.id,
      type,
      textContent: type === "TEXT" ? textContent : null,
      fileUrl: type === "IMAGE" ? fileUrl : null,
    },
    update: {
      type,
      textContent: type === "TEXT" ? textContent : null,
      fileUrl: type === "IMAGE" ? fileUrl : null,
      submittedAt: new Date(),
    },
  });

  return NextResponse.json({ submission });
}
