import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('--- Users ---');
    users.forEach(u => console.log(`${u.id}: ${u.email}`));

    const invoices = await prisma.invoice.findMany();
    console.log('\n--- Invoices ---');
    console.log(`Total: ${invoices.length}`);

    const payments = await prisma.payment.findMany();
    console.log('\n--- Payments ---');
    console.log(`Total: ${payments.length}`);

    if (users.length > 0) {
        const demoUser = users.find(u => u.email === 'demo@freelancer.com');
        if (demoUser) {
            const overviewInvoices = await prisma.invoice.count({ where: { ownerId: demoUser.id } });
            console.log(`\nInvoices for demo user: ${overviewInvoices}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
