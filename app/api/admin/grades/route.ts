import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim().toUpperCase();
  if (!code) return NextResponse.json({ error: "لازم كود" }, { status: 400 });

  const student = await prisma.studentCode.findUnique({
    where: { code },
    include: {
      submissions: {
        include: { homework: { include: { subject: true } } },
        orderBy: { submittedAt: "desc" },
      },
    },
  });
  if (!student) return NextResponse.json({ error: "الكود غير موجود" }, { status: 404 });

  return NextResponse.json({ student });
}
