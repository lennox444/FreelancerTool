import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const user = await prisma.user.findFirst();
        const customers = await prisma.customer.findMany({
            where: { ownerId: user?.id }
        });
        console.log('User:', user?.id);
        console.log('Customers found for user:', customers.length);
        if (customers.length > 0) {
            console.log('First customer ID:', customers[0].id);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
