import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log('No user found');
            return;
        }
        console.log('Using user:', user.id);

        const project = await prisma.project.create({
            data: {
                ownerId: user.id,
                name: 'Test Project',
                status: 'PLANNING',
                budget: 1000.50,
            }
        });
        console.log('Created project:', project.id);
    } catch (e) {
        console.error('Error creating project:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
