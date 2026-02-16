import { PrismaClient, InvoiceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Demo User
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@freelancer.com' },
    update: {},
    create: {
      email: 'demo@freelancer.com',
      passwordHash: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
    },
  });

  console.log('✅ Created demo user:', demoUser.email);

  // Create Customers
  const customer1 = await prisma.customer.upsert({
    where: {
      email_ownerId: {
        email: 'john@techcorp.com',
        ownerId: demoUser.id,
      }
    },
    update: {},
    create: {
      ownerId: demoUser.id,
      name: 'John Smith',
      company: 'TechCorp Inc.',
      email: 'john@techcorp.com',
      defaultPaymentTerms: 30,
      notes: 'Regular client, always pays on time',
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: {
      email_ownerId: {
        email: 'sarah@designstudio.com',
        ownerId: demoUser.id,
      }
    },
    update: {},
    create: {
      ownerId: demoUser.id,
      name: 'Sarah Johnson',
      company: 'Design Studio LLC',
      email: 'sarah@designstudio.com',
      defaultPaymentTerms: 14,
      notes: 'Prefers quick turnaround projects',
    },
  });

  const customer3 = await prisma.customer.upsert({
    where: {
      email_ownerId: {
        email: 'mike@startup.io',
        ownerId: demoUser.id,
      }
    },
    update: {},
    create: {
      ownerId: demoUser.id,
      name: 'Mike Brown',
      company: 'Startup.io',
      email: 'mike@startup.io',
      defaultPaymentTerms: 45,
      notes: 'New startup, invoice in smaller chunks',
    },
  });

  console.log('✅ Created 3 customers');

  // Create Invoices with different statuses

  // 1. PAID Invoice (fully paid)
  const invoice1 = await prisma.invoice.create({
    data: {
      ownerId: demoUser.id,
      customerId: customer1.id,
      amount: 5000,
      description: 'Website redesign - Homepage and Landing Pages',
      status: InvoiceStatus.PAID,
      totalPaid: 5000,
      issueDate: new Date('2025-12-15'),
      dueDate: new Date('2026-01-15'),
    },
  });

  await prisma.payment.create({
    data: {
      ownerId: demoUser.id,
      invoiceId: invoice1.id,
      amount: 5000,
      paymentDate: new Date('2026-01-10'),
      note: 'Bank transfer - Reference: WR-001',
    },
  });

  // 2. PARTIALLY_PAID Invoice
  const invoice2 = await prisma.invoice.create({
    data: {
      ownerId: demoUser.id,
      customerId: customer2.id,
      amount: 3000,
      description: 'Logo Design and Brand Identity Package',
      status: InvoiceStatus.PARTIALLY_PAID,
      totalPaid: 1500,
      issueDate: new Date('2026-01-20'),
      dueDate: new Date('2026-02-20'),
    },
  });

  await prisma.payment.create({
    data: {
      ownerId: demoUser.id,
      invoiceId: invoice2.id,
      amount: 1500,
      paymentDate: new Date('2026-01-25'),
      note: 'First payment - 50% deposit',
    },
  });

  // 3. SENT Invoice (not paid yet, not overdue)
  await prisma.invoice.create({
    data: {
      ownerId: demoUser.id,
      customerId: customer3.id,
      amount: 2500,
      description: 'Mobile App Development - Phase 1',
      status: InvoiceStatus.SENT,
      totalPaid: 0,
      issueDate: new Date('2026-02-01'),
      dueDate: new Date('2026-03-15'),
    },
  });

  // 4. OVERDUE Invoice
  await prisma.invoice.create({
    data: {
      ownerId: demoUser.id,
      customerId: customer1.id,
      amount: 1800,
      description: 'SEO Optimization Service - Q4 2025',
      status: InvoiceStatus.OVERDUE,
      totalPaid: 0,
      issueDate: new Date('2025-12-01'),
      dueDate: new Date('2026-01-01'),
    },
  });

  // 5. DRAFT Invoice (not sent yet)
  await prisma.invoice.create({
    data: {
      ownerId: demoUser.id,
      customerId: customer2.id,
      amount: 4200,
      description: 'E-commerce Platform Development',
      status: InvoiceStatus.DRAFT,
      totalPaid: 0,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  // 6. Another SENT Invoice
  await prisma.invoice.create({
    data: {
      ownerId: demoUser.id,
      customerId: customer3.id,
      amount: 1500,
      description: 'Content Management System Setup',
      status: InvoiceStatus.SENT,
      totalPaid: 0,
      issueDate: new Date('2026-02-10'),
      dueDate: new Date('2026-03-10'),
    },
  });

  console.log('✅ Created 6 invoices with various statuses');
  console.log('✅ Created 2 payments');

  console.log('\n🎉 Seeding completed!');
  console.log('\n📊 Demo Account Credentials:');
  console.log('   Email:    demo@freelancer.com');
  console.log('   Password: demo123');
  console.log('\n💰 Summary:');
  console.log('   - 3 Customers');
  console.log('   - 6 Invoices (1 PAID, 1 PARTIALLY_PAID, 2 SENT, 1 OVERDUE, 1 DRAFT)');
  console.log('   - 2 Payments');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
