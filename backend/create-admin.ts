import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = 'Demo123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Checking if super admin user exists: ${email}`);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(
      'User already exists. Updating to Super Admin and setting password...',
    );
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash: hashedPassword,
        role: UserRole.SUPER_ADMIN,
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
        role: UserRole.SUPER_ADMIN,
      },
    });
  }

  console.log('Super Admin user prepared successfully!');
}

main()
  .catch((e) => {
    console.error('Error creating super admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
