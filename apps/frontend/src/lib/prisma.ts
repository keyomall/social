import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Next.js static evaluation hack
let _prisma;
try {
  _prisma = globalForPrisma.prisma ?? new PrismaClient();
} catch(e) {
  _prisma = {} as PrismaClient; 
}
export const prisma = _prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
