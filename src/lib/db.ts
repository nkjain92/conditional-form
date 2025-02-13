import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.POSTGRES_URL,
      },
    },
  });
};

type GlobalWithPrisma = typeof globalThis & {
  prisma?: ReturnType<typeof prismaClientSingleton>;
};

declare const global: GlobalWithPrisma;

const prisma = global.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
