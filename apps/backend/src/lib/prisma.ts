/* eslint-disable @typescript-eslint/no-var-requires */
type PrismaClientLike = {
  [key: string]: any;
};

const { PrismaClient } = require("@prisma/client") as {
  PrismaClient: new () => PrismaClientLike;
};

const globalForPrisma = globalThis as { prisma?: PrismaClientLike };

export const prisma: PrismaClientLike = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
