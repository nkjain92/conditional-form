import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create system user if it doesn't exist
    console.log('Creating system user...');
    const systemUser = await prisma.user.upsert({
      where: { email: 'system@example.com' },
      update: {},
      create: {
        id: 'system',
        email: 'system@example.com',
        password: await bcrypt.hash('system-password-not-used', 10),
      },
    });
    console.log('System user created/updated:', systemUser.id);

    // Create default form
    console.log('Creating default form...');
    const defaultForm = await prisma.form.upsert({
      where: { id: 'default' },
      update: {
        title: 'Default Voting Form',
        description: 'Default form for theme voting',
        creatorId: systemUser.id,
      },
      create: {
        id: 'default',
        title: 'Default Voting Form',
        description: 'Default form for theme voting',
        creatorId: systemUser.id,
      },
    });
    console.log('Default form created/updated:', defaultForm.id);

    // Create default themes if they don't exist
    const themes = [
      { name: 'Italian', maxVotes: 100 },
      { name: 'Mexican', maxVotes: 100 },
      { name: 'Chinese', maxVotes: 100 },
      { name: 'Indian', maxVotes: 100 },
      { name: 'Mediterranean', maxVotes: 100 },
    ];

    console.log('Creating default themes...');
    await Promise.all(
      themes.map(async theme => {
        const themeId = `default-${theme.name.toLowerCase()}`;
        const result = await prisma.theme.upsert({
          where: { id: themeId },
          update: {
            maxVotes: theme.maxVotes,
            formId: defaultForm.id,
          },
          create: {
            id: themeId,
            ...theme,
            formId: defaultForm.id,
          },
        });
        console.log(`Theme created/updated: ${result.id}`);
        return result;
      }),
    );

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error; // Re-throw to trigger the error handling in main()
  }
}

// Proper error handling and cleanup
main()
  .catch(error => {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    // Ensure we always disconnect from the database
    try {
      await prisma.$disconnect();
      console.log('Disconnected from database');
    } catch (error) {
      console.error('Error disconnecting from database:', error);
      process.exit(1);
    }
  });
