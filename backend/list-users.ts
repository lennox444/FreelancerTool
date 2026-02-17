import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Datenbank Benutzer Übersicht ---');

  const users = await prisma.user.findMany({
    select: {
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  if (users.length === 0) {
    console.log('Keine Benutzer in der Datenbank gefunden.');
  } else {
    console.table(users);
  }
}

main()
  .catch((e) => {
    console.error('Fehler beim Abrufen der Benutzer:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
