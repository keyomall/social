import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const ADMIN_ALIAS = "admin";
const ADMIN_EMAIL = "admin@keryx.local";
const ADMIN_PASSWORD = "dios";
const DEFAULT_ORG_ID = "org-default-123";

async function seedAdmin() {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      role: "ADMIN",
      name: "Administrador KERYX",
      hashedPassword,
    },
    create: {
      email: ADMIN_EMAIL,
      role: "ADMIN",
      name: "Administrador KERYX",
      hashedPassword,
    },
    select: { id: true, email: true, role: true },
  });

  await prisma.organization.upsert({
    where: { id: DEFAULT_ORG_ID },
    update: {},
    create: { id: DEFAULT_ORG_ID, name: "Workspace Inicial" },
  });

  await prisma.organizationUser.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: DEFAULT_ORG_ID,
      },
    },
    update: { role: "OWNER" },
    create: {
      userId: user.id,
      organizationId: DEFAULT_ORG_ID,
      role: "OWNER",
    },
  });

  console.log(`[seed-admin] Cuenta lista. Usuario alias: ${ADMIN_ALIAS} | Email real: ${ADMIN_EMAIL}`);
  console.log(`[seed-admin] Organización asignada: ${DEFAULT_ORG_ID} (OWNER)`);
}

seedAdmin()
  .catch((error) => {
    console.error("[seed-admin] Error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
