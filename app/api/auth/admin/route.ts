import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const schema = z.object({
  username: z.string().trim().min(2).max(60),
  password: z.string().min(4).max(100),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }
  const { username, password } = parsed.data;

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    return NextResponse.json(
      { error: "اسم المستخدم أو كلمة السر غلط" },
      { status: 401 }
    );
  }
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "اسم المستخدم أو كلمة السر غلط" },
      { status: 401 }
    );
  }

  await createSession({ role: "ADMIN", id: admin.id, name: admin.username });
  return NextResponse.json({ ok: true });
}
