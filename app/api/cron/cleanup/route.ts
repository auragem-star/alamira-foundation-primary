import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/blob";

// شغالة عن طريق Vercel Cron (راجع vercel.json)
// بتحذف صور/نصوص حلول الطلبة اللي المدرس صححها وعدّى معاد الحذف بتاعها
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const expired = await prisma.submission.findMany({
    where: {
      deleted: false,
      fileDeleteAt: { lte: new Date() },
    },
    take: 200,
  });

  let deletedCount = 0;
  for (const sub of expired) {
    if (sub.fileUrl) {
      await deleteFile(sub.fileUrl);
    }
    await prisma.submission.update({
      where: { id: sub.id },
      data: { fileUrl: null, textContent: null, deleted: true },
    });
    deletedCount++;
  }

  return NextResponse.json({ deletedCount });
}
