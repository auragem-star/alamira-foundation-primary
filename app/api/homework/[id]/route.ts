import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await params;

  const homework = await prisma.homework.findUnique({
    where: { id },
    include: { subject: true },
  });
  if (!homework) {
    return NextResponse.json({ error: "الواجب غير موجود" }, { status: 404 });
  }

  if (session.role === "STUDENT") {
    const mySubmission = await prisma.submission.findUnique({
      where: {
        homeworkId_studentCodeId: {
          homeworkId: id,
          studentCodeId: session.id,
        },
      },
    });
    return NextResponse.json({ homework, mySubmission });
  }

  if (session.role === "TEACHER") {
    if (homework.teacherId !== session.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }
    const submissions = await prisma.submission.findMany({
      where: { homeworkId: id },
      include: { student: { select: { studentName: true, code: true } } },
      orderBy: { submittedAt: "desc" },
    });
    return NextResponse.json({ homework, submissions });
  }

  return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
}
