import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.POSTGRES_URL || process.env.DATABASE_URL,
      },
    },
  });

  // Test the connection
  client
    .$connect()
    .then(() => console.log('Database connection successful'))
    .catch((e: Error) => console.error('Database connection failed:', e));

  return client;
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
