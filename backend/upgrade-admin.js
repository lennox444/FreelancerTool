const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upgradeAdmin() {
    await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: {
            subscriptionPlan: 'PRO',
            subscriptionStatus: 'ACTIVE',
            trialEndsAt: null,
        }
    });

    console.log('✅ Admin account upgraded to PRO!');
    await prisma.$disconnect();
}

upgradeAdmin().catch(console.error);
