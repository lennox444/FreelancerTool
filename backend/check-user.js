const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            subscriptionPlan: true,
            subscriptionStatus: true,
            trialEndsAt: true,
        }
    });

    console.log('\n=== USER SUBSCRIPTION STATUS ===');
    users.forEach(user => {
        console.log(`\nUser: ${user.firstName} ${user.lastName} (${user.email})`);
        console.log(`Plan: ${user.subscriptionPlan || 'FREE_TRIAL'}`);
        console.log(`Status: ${user.subscriptionStatus || 'TRIAL'}`);
        console.log(`Trial Ends: ${user.trialEndsAt || 'N/A'}`);
    });
    console.log('\n');

    await prisma.$disconnect();
}

checkUser().catch(console.error);
