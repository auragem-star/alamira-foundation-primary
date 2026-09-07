import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { LEVEL_LABELS } from "@/lib/levels";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");
  if (!batchId) {
    return NextResponse.json({ error: "لازم batchId" }, { status: 400 });
  }

  const codes = await prisma.studentCode.findMany({
    where: { batchId },
    orderBy: { code: "asc" },
  });

  const rows = ["الكود,المرحلة"];
  for (const c of codes) {
    const label = c.level ? LEVEL_LABELS[c.level] : "يحددها الطالب عند التسجيل";
    rows.push(`${c.code},${label}`);
  }
  const csv = "\uFEFF" + rows.join("\n"); // BOM عشان اكسل يقرا العربي صح

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="codes-${batchId}.csv"`,
    },
  });
}
