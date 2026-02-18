// Plain JS — no TypeScript compilation needed, bypasses nodenext module issues
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = 'Demo123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Checking if super admin exists: ${email}`);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log('User exists — upgrading to SUPER_ADMIN and resetting password...');
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        firstName: 'Super',
        lastName: 'Admin',
      },
    });
  } else {
    console.log('Creating new Super Admin user...');
    await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
      },
    });
  }

  console.log('\n✅ Super Admin ready!');
  console.log('   Email:    admin@example.com');
  console.log('   Password: Demo123!');
}

main()
  .catch((e) => { console.error('Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
