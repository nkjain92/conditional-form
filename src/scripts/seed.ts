import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create system user if it doesn't exist
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@example.com' },
    update: {},
    create: {
      id: 'system',
      email: 'system@example.com',
      password: await bcrypt.hash('system-password-not-used', 10),
    },
  });

  // Create default form
  const defaultForm = await prisma.form.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      title: 'Default Voting Form',
      description: 'Default form for theme voting',
      creatorId: systemUser.id,
    },
  });

  // Create default themes if they don't exist
  const themes = [
    { name: 'Italian', maxVotes: 100 },
    { name: 'Mexican', maxVotes: 100 },
    { name: 'Chinese', maxVotes: 100 },
    { name: 'Indian', maxVotes: 100 },
    { name: 'Mediterranean', maxVotes: 100 },
  ];

  for (const theme of themes) {
    await prisma.theme.upsert({
      where: { id: `default-${theme.name.toLowerCase()}` },
      update: {},
      create: {
        id: `default-${theme.name.toLowerCase()}`,
        ...theme,
        formId: defaultForm.id,
      },
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
