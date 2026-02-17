const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createExpiredUser() {
    const email = 'expired@example.com';
    const password = 'Demo123!';

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Set trial end date to 1 day ago (expired)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() - 1);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        console.log('⚠️  User already exists. Updating trial date...');
        await prisma.user.update({
            where: { email },
            data: {
                trialEndsAt,
                subscriptionStatus: 'TRIAL',
                subscriptionPlan: 'FREE_TRIAL',
            }
        });
        console.log('✅ User updated with expired trial!');
    } else {
        console.log('📝 Creating new user with expired trial...');
        await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName: 'Expired',
                lastName: 'Trial User',
                subscriptionStatus: 'TRIAL',
                subscriptionPlan: 'FREE_TRIAL',
                trialEndsAt,
            }
        });
        console.log('✅ User created successfully!');
    }

    console.log('\n📋 Test User Details:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Trial Ended:', trialEndsAt.toISOString());
    console.log('Days expired:', Math.ceil((new Date() - trialEndsAt) / (1000 * 60 * 60 * 24)));
    console.log('\n🧪 You can now login and test expired trial behavior!');

    await prisma.$disconnect();
}

createExpiredUser().catch(console.error);
