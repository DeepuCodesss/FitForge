import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "Vannu123sh78@gmail.com";
  const adminPassword = "2e606836";
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const memberHash = await bcrypt.hash("demo1234", 10);
  const member = await prisma.member.upsert({
    where: { email: "deeepak@gmail.com" },
    update: {},
    create: {
      name: "Deepak Kumar",
      email: "deeepak@gmail.com",
      password_hash: memberHash,
      phone: "09350432714",
      plan: "Basic",
      status: "active",
      createdAt: new Date(),
    },
  });
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { password_hash: adminHash, name: "Admin" },
    create: { email: adminEmail, name: "Admin", password_hash: adminHash },
  });
  await prisma.attendance.upsert({
    where: { id: "seed-attendance" },
    update: {},
    create: { id: "seed-attendance", memberId: member.id, date: new Date().toISOString().slice(0, 10), status: "present" },
  });
}

main().finally(() => prisma.$disconnect());
