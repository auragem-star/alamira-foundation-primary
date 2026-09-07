import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_SUBJECTS } from "../lib/levels";

const prisma = new PrismaClient();

async function main() {
  for (const s of DEFAULT_SUBJECTS) {
    await prisma.subject.upsert({
      where: { name_level: { name: s.name, level: s.level as any } },
      update: {},
      create: { name: s.name, level: s.level as any },
    });
  }
  console.log(`تم إضافة ${DEFAULT_SUBJECTS.length} مادة.`);

  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { username },
    update: {},
    create: { username, passwordHash },
  });
  console.log(
    `تم إنشاء حساب مدير: ${username} / ${password} — غيّر كلمة السر دي فورًا بعد أول دخول.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
