import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { uploadFile } from "@/lib/blob";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "TEACHER" && session.role !== "STUDENT")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "مفيش ملف" }, { status: 400 });
  }

  const prefix = session.role === "TEACHER" ? "homework" : "submissions";

  try {
    const url = await uploadFile(file, prefix);
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "فشل رفع الملف";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
