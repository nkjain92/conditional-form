const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const themes = [
    { name: 'Italian', maxVotes: 100 },
    { name: 'Mexican', maxVotes: 100 },
    { name: 'Chinese', maxVotes: 100 },
    { name: 'Indian', maxVotes: 100 },
    { name: 'Mediterranean', maxVotes: 100 },
  ];

  for (const theme of themes) {
    await prisma.theme.create({
      data: theme,
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
