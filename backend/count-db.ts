import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const userCount = await prisma.user.count();
        const customerCount = await prisma.customer.count();
        const projectCount = await prisma.project.count();
        console.log('Total users:', userCount);
        console.log('Total customers:', customerCount);
        console.log('Total projects:', projectCount);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
