import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PARENT") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const student = await prisma.studentCode.findUnique({
    where: { id: session.id },
    include: {
      submissions: {
        where: { gradedAt: { not: null } },
        include: { homework: { include: { subject: true } } },
        orderBy: { gradedAt: "desc" },
      },
    },
  });

  if (!student) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  return NextResponse.json({ student });
}
