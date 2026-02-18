import {
  PrismaClient,
  InvoiceStatus,
  QuoteStatus,
  ExpenseCategory,
  ProjectStatus,
  RecurringInterval,
  FreelancerVertical,
  CurrentWorkflow,
  BusinessStage,
  AcquisitionChannel,
  OnboardingEventType,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  console.log('🌱 Seeding comprehensive demo data...');

  // ============================================================
  // CLEANUP – delete existing demo user and all related data
  // ============================================================
  const existing = await prisma.user.findUnique({ where: { email: 'demo@freelancer.com' } });
  if (existing) {
    await prisma.user.delete({ where: { id: existing.id } });
    console.log('🗑️  Deleted old demo user');
  }

  // ============================================================
  // USER
  // ============================================================
  const hashedPassword = await bcrypt.hash('Demo123!', 10);

  const user = await prisma.user.create({
    data: {
      email: 'demo@freelancer.com',
      passwordHash: hashedPassword,
      firstName: 'Max',
      lastName: 'Mustermann',
      targetHourlyRate: 85,
      subscriptionPlan: SubscriptionPlan.PRO,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionEndsAt: daysFromNow(335),
      trialEndsAt: daysAgo(300),
    },
  });
  console.log('✅ User created:', user.email);

  // ============================================================
  // ONBOARDING PROFILE
  // ============================================================
  await prisma.onboardingProfile.create({
    data: {
      userId: user.id,
      vertical: FreelancerVertical.DEVELOPER,
      currentWorkflow: CurrentWorkflow.EXCEL_SHEETS,
      businessStage: BusinessStage.GROWING,
      acquisitionChannel: AcquisitionChannel.LINKEDIN,
      onboardingCompleted: true,
      currentStep: 5,
      completedAt: daysAgo(300),
    },
  });

  await prisma.onboardingEvent.createMany({
    data: [
      { userId: user.id, eventType: OnboardingEventType.ONBOARDING_STARTED, stepNumber: 1, createdAt: daysAgo(300) },
      { userId: user.id, eventType: OnboardingEventType.STEP_COMPLETED, stepNumber: 1, createdAt: daysAgo(300) },
      { userId: user.id, eventType: OnboardingEventType.STEP_COMPLETED, stepNumber: 2, createdAt: daysAgo(300) },
      { userId: user.id, eventType: OnboardingEventType.STEP_COMPLETED, stepNumber: 3, createdAt: daysAgo(300) },
      { userId: user.id, eventType: OnboardingEventType.STEP_COMPLETED, stepNumber: 4, createdAt: daysAgo(300) },
      { userId: user.id, eventType: OnboardingEventType.ONBOARDING_COMPLETED, stepNumber: 5, createdAt: daysAgo(300) },
    ],
  });
  console.log('✅ Onboarding profile created');

  // ============================================================
  // BANK ACCOUNTS
  // ============================================================
  const bankMain = await prisma.bankAccount.create({
    data: {
      ownerId: user.id,
      name: 'Geschäftskonto Sparkasse',
      bankName: 'Sparkasse Berlin',
      iban: 'DE89 3704 0044 0532 0130 00',
      bic: 'COBADEFFXXX',
      accountHolder: 'Max Mustermann',
      isDefault: true,
    },
  });
  const bankPaypal = await prisma.bankAccount.create({
    data: {
      ownerId: user.id,
      name: 'PayPal Business',
      isPaypal: true,
      paypalEmail: 'max.mustermann@paypal.com',
      isDefault: false,
    },
  });
  console.log('✅ Bank accounts created');

  // ============================================================
  // CUSTOMERS
  // ============================================================
  const c1 = await prisma.customer.create({
    data: {
      ownerId: user.id,
      name: 'Johannes Schmidt',
      company: 'TechVision GmbH',
      email: 'j.schmidt@techvision.de',
      defaultPaymentTerms: 30,
      notes: 'Stammkunde seit 2023. Zahlt pünktlich. Bevorzugt Überweisung.',
    },
  });
  const c2 = await prisma.customer.create({
    data: {
      ownerId: user.id,
      name: 'Anna Weber',
      company: 'Creative Studio AG',
      email: 'anna.weber@creativestudio.de',
      defaultPaymentTerms: 14,
      notes: 'Kleine Agentur, schnelle Projekte. Immer kurzfristig.',
    },
  });
  const c3 = await prisma.customer.create({
    data: {
      ownerId: user.id,
      name: 'Lukas Hoffmann',
      company: 'Startup Labs UG',
      email: 'lukas@startuplabs.io',
      defaultPaymentTerms: 45,
      notes: 'Junges Startup. Manchmal Zahlungsverzug, aber zuverlässig.',
    },
  });
  const c4 = await prisma.customer.create({
    data: {
      ownerId: user.id,
      name: 'Maria Fischer',
      company: 'Fischer Consulting',
      email: 'maria.fischer@consulting.de',
      defaultPaymentTerms: 30,
      notes: 'Beraterin, braucht immer detaillierte Rechnungen.',
    },
  });
  const c5 = await prisma.customer.create({
    data: {
      ownerId: user.id,
      name: 'Thomas Müller',
      company: 'E-Commerce Solutions',
      email: 't.mueller@ecom-solutions.de',
      defaultPaymentTerms: 7,
      notes: 'Großkunde. Quarterly Retainer. Zahlt sofort.',
    },
  });
  console.log('✅ 5 customers created');

  // ============================================================
  // PROJECTS
  // ============================================================
  const p1 = await prisma.project.create({
    data: {
      ownerId: user.id,
      customerId: c1.id,
      name: 'TechVision Portal Relaunch',
      description: 'Komplette Neuentwicklung des Kundenportals mit React und NestJS. Inkl. SSO-Integration und Dashboard.',
      status: ProjectStatus.ACTIVE,
      budget: 18000,
      startDate: daysAgo(60),
      endDate: daysFromNow(30),
    },
  });
  const p2 = await prisma.project.create({
    data: {
      ownerId: user.id,
      customerId: c2.id,
      name: 'Brand Redesign Website',
      description: 'Neue Corporate Website für Creative Studio. 5 Seiten, CMS-Integration, responsive.',
      status: ProjectStatus.COMPLETED,
      budget: 6500,
      startDate: daysAgo(120),
      endDate: daysAgo(30),
    },
  });
  const p3 = await prisma.project.create({
    data: {
      ownerId: user.id,
      customerId: c3.id,
      name: 'MVP Mobile App',
      description: 'React Native App für iOS und Android. Authentifizierung, Push-Notifications, Backend-API.',
      status: ProjectStatus.PLANNING,
      budget: 22000,
      startDate: daysFromNow(14),
      endDate: daysFromNow(120),
    },
  });
  const p4 = await prisma.project.create({
    data: {
      ownerId: user.id,
      customerId: c5.id,
      name: 'E-Commerce Retainer Q1',
      description: 'Monatlicher Wartungs- und Entwicklungs-Retainer. 40h/Monat.',
      status: ProjectStatus.ACTIVE,
      budget: 12000,
      startDate: daysAgo(90),
      endDate: daysFromNow(90),
    },
  });
  const p5 = await prisma.project.create({
    data: {
      ownerId: user.id,
      customerId: c4.id,
      name: 'API-Integration Steuerberater-Tool',
      description: 'REST-API Entwicklung für DATEV-Schnittstelle.',
      status: ProjectStatus.ON_HOLD,
      budget: 9000,
      startDate: daysAgo(45),
      endDate: daysFromNow(60),
      notes: 'Auf Eis gelegt bis Kunde Budget freigibt.',
    },
  });
  console.log('✅ 5 projects created');

  // ============================================================
  // INVOICES
  // ============================================================

  // 1. PAID – TechVision Phase 1
  const inv1 = await prisma.invoice.create({
    data: {
      ownerId: user.id,
      customerId: c1.id,
      projectId: p1.id,
      invoiceNumber: 'RE-2025-001',
      amount: 7500,
      description: 'TechVision Portal – Phase 1: Konzept, Design & Projektsetup\n\nLeistungen:\n- Anforderungsanalyse und technisches Konzept\n- UI/UX Design (10 Screens)\n- Projekt-Setup und CI/CD Pipeline\n- Technische Dokumentation',
      status: InvoiceStatus.PAID,
      totalPaid: 7500,
      issueDate: daysAgo(90),
      dueDate: daysAgo(60),
      bankAccountId: bankMain.id,
      dunningLevel: 0,
    },
  });
  await prisma.payment.create({
    data: {
      ownerId: user.id,
      invoiceId: inv1.id,
      amount: 7500,
      paymentDate: daysAgo(65),
      note: 'Überweisung eingegangen – Verwendungszweck: RE-2025-001',
    },
  });

  // 2. PAID – Brand Redesign vollständig
  const inv2 = await prisma.invoice.create({
    data: {
      ownerId: user.id,
      customerId: c2.id,
      projectId: p2.id,
      invoiceNumber: 'RE-2025-002',
      amount: 6500,
      description: 'Brand Redesign Website – Abschlussrechnung\n\nLeistungen:\n- 5 Seiten WordPress Implementierung\n- Responsive Design\n- SEO-Grundsetup\n- 2 Revisions-Runden',
      status: InvoiceStatus.PAID,
      totalPaid: 6500,
      issueDate: daysAgo(35),
      dueDate: daysAgo(21),
      bankAccountId: bankMain.id,
      dunningLevel: 0,
    },
  });
  await prisma.payment.create({
    data: {
      ownerId: user.id,
      invoiceId: inv2.id,
      amount: 6500,
      paymentDate: daysAgo(25),
      note: 'PayPal-Zahlung eingegangen',
    },
  });

  // 3. PARTIALLY_PAID – TechVision Phase 2
  const inv3 = await prisma.invoice.create({
    data: {
      ownerId: user.id,
      customerId: c1.id,
      projectId: p1.id,
      invoiceNumber: 'RE-2025-003',
      amount: 8500,
      description: 'TechVision Portal – Phase 2: Backend-Entwicklung\n\nLeistungen:\n- NestJS Backend-Architektur\n- Datenbankdesign und Migration\n- REST-API (24 Endpoints)\n- Unit- und Integration-Tests',
      status: InvoiceStatus.PARTIALLY_PAID,
      totalPaid: 4250,
      issueDate: daysAgo(25),
      dueDate: daysFromNow(5),
      bankAccountId: bankMain.id,
      dunningLevel: 0,
    },
  });
  await prisma.payment.create({
    data: {
      ownerId: user.id,
      invoiceId: inv3.id,
      amount: 4250,
      paymentDate: daysAgo(15),
      note: 'Anzahlung 50% gemäß Vereinbarung',
    },
  });

  // 4. SENT – Startup Labs
  const inv4 = await prisma.invoice.create({
    data: {
      ownerId: user.id,
      customerId: c3.id,
      projectId: p3.id,
      invoiceNumber: 'RE-2026-001',
      amount: 3200,
      description: 'MVP Mobile App – Discovery & Scoping\n\nLeistungen:\n- User Research & Interviews\n- Technisches Scoping\n- Architektur-Entscheidungen\n- Projektplan & Milestones',
      status: InvoiceStatus.SENT,
      totalPaid: 0,
      issueDate: daysAgo(10),
      dueDate: daysFromNow(20),
      bankAccountId: bankMain.id,
      dunningLevel: 0,
    },
  });

  // 5. OVERDUE – Mahnwesen Level 1
  const inv5 = await prisma.invoice.create({
    data: {
      ownerId: user.id,
      customerId: c4.id,
      invoiceNumber: 'RE-2025-004',
      amount: 2800,
      description: 'API-Integration Konzeptionsphase\n\nLeistungen:\n- DATEV-Schnittstellen-Analyse\n- Technisches Konzept\n- Proof of Concept Implementierung',
      status: InvoiceStatus.OVERDUE,
      totalPaid: 0,
      issueDate: daysAgo(60),
      dueDate: daysAgo(30),
      bankAccountId: bankMain.id,
      dunningLevel: 1,
      lastDunningDate: daysAgo(15),
    },
  });

  // 6. OVERDUE – Mahnwesen Level 2 (schlimmer)
  const inv6 = await prisma.invoice.create({
    data: {
      ownerId: user.id,
      customerId: c3.id,
      invoiceNumber: 'RE-2025-003B',
      amount: 1400,
      description: 'Technische Beratung Startup Labs – Oktober 2025',
      status: InvoiceStatus.OVERDUE,
      totalPaid: 0,
      issueDate: daysAgo(90),
      dueDate: daysAgo(60),
      bankAccountId: bankMain.id,
      dunningLevel: 2,
      lastDunningDate: daysAgo(10),
    },
  });

  // 7. DRAFT – noch nicht versendet
  await prisma.invoice.create({
    data: {
      ownerId: user.id,
      customerId: c5.id,
      projectId: p4.id,
      invoiceNumber: 'RE-2026-002',
      amount: 4000,
      description: 'E-Commerce Retainer – Januar 2026\n\n40 Stunden Entwicklung und Wartung\n@ 100,00 EUR/Stunde',
      status: InvoiceStatus.DRAFT,
      totalPaid: 0,
      issueDate: new Date(),
      dueDate: daysFromNow(7),
      bankAccountId: bankMain.id,
      dunningLevel: 0,
    },
  });

  // 8. Recurring Invoice Template (monatlicher Retainer)
  const invRecurring = await prisma.invoice.create({
    data: {
      ownerId: user.id,
      customerId: c5.id,
      projectId: p4.id,
      invoiceNumber: 'RE-2025-REC',
      amount: 4000,
      description: 'E-Commerce Retainer – Monatliche Abrechnung (Vorlage)\n40h @ 100 EUR/h',
      status: InvoiceStatus.PAID,
      totalPaid: 4000,
      issueDate: daysAgo(120),
      dueDate: daysAgo(113),
      bankAccountId: bankMain.id,
      isRecurring: true,
      recurringInterval: RecurringInterval.MONTHLY,
      recurringStartDate: daysAgo(120),
      nextInvoiceDate: daysFromNow(10),
      dunningLevel: 0,
    },
  });
  await prisma.payment.create({
    data: {
      ownerId: user.id,
      invoiceId: invRecurring.id,
      amount: 4000,
      paymentDate: daysAgo(115),
      note: 'Retainer Oktober – Sofortzahlung',
    },
  });

  // Child-Recurring November
  const invRecChild1 = await prisma.invoice.create({
    data: {
      ownerId: user.id,
      customerId: c5.id,
      projectId: p4.id,
      invoiceNumber: 'RE-2025-REC-2',
      amount: 4000,
      description: 'E-Commerce Retainer – November 2025\n40h @ 100 EUR/h',
      status: InvoiceStatus.PAID,
      totalPaid: 4000,
      issueDate: daysAgo(90),
      dueDate: daysAgo(83),
      bankAccountId: bankMain.id,
      parentInvoiceId: invRecurring.id,
      dunningLevel: 0,
    },
  });
  await prisma.payment.create({
    data: {
      ownerId: user.id,
      invoiceId: invRecChild1.id,
      amount: 4000,
      paymentDate: daysAgo(85),
      note: 'Retainer November – Sofortzahlung',
    },
  });

  console.log('✅ 9 invoices created (incl. recurring)');

  // ============================================================
  // QUOTES / ANGEBOTE
  // ============================================================

  // ACCEPTED → converted to invoice
  const q1 = await prisma.quote.create({
    data: {
      ownerId: user.id,
      customerId: c1.id,
      projectId: p1.id,
      quoteNumber: 'ANG-2025-001',
      amount: 18000,
      description: 'Angebot TechVision Portal Relaunch\n\nPhase 1: Konzept & Design – 7.500 EUR\nPhase 2: Backend-Entwicklung – 8.500 EUR\nPhase 3: Frontend & Integration – 2.000 EUR\n\nGültig bis: 30 Tage ab Ausstellungsdatum',
      status: QuoteStatus.ACCEPTED,
      issueDate: daysAgo(95),
      validUntil: daysAgo(65),
      notes: 'Kunde hat telefonisch zugesagt. Unterschriebenes Dokument per E-Mail erhalten.',
    },
  });

  // SENT – noch ausstehend
  await prisma.quote.create({
    data: {
      ownerId: user.id,
      customerId: c3.id,
      projectId: p3.id,
      quoteNumber: 'ANG-2026-001',
      amount: 22000,
      description: 'Angebot MVP Mobile App\n\nDiscovery & Scoping – 3.200 EUR\nDesign (iOS + Android) – 5.800 EUR\nEntwicklung React Native – 11.000 EUR\nTesting & Deployment – 2.000 EUR\n\nInkl. 1 Jahr Gewährleistung auf Bugs',
      status: QuoteStatus.SENT,
      issueDate: daysAgo(12),
      validUntil: daysFromNow(18),
      notes: 'Follow-up Anruf in 5 Tagen.',
    },
  });

  // REJECTED
  await prisma.quote.create({
    data: {
      ownerId: user.id,
      customerId: c2.id,
      quoteNumber: 'ANG-2025-002',
      amount: 15000,
      description: 'Angebot E-Learning Plattform – Komplett-Entwicklung\n\nLMS-Integration, Video-Hosting, Zahlungsabwicklung',
      status: QuoteStatus.REJECTED,
      issueDate: daysAgo(50),
      validUntil: daysAgo(20),
      notes: 'Kunde hat sich für günstigere Alternative entschieden.',
    },
  });

  // DRAFT
  await prisma.quote.create({
    data: {
      ownerId: user.id,
      customerId: c4.id,
      quoteNumber: 'ANG-2026-002',
      amount: 9000,
      description: 'Angebot DATEV API-Integration\n\nNoch in Ausarbeitung...',
      status: QuoteStatus.DRAFT,
      issueDate: new Date(),
      validUntil: daysFromNow(30),
    },
  });

  // CONVERTED (wurde zu Rechnung)
  const q5 = await prisma.quote.create({
    data: {
      ownerId: user.id,
      customerId: c5.id,
      projectId: p4.id,
      quoteNumber: 'ANG-2025-003',
      amount: 12000,
      description: 'Angebot Retainer E-Commerce Q4 2025 – Q1 2026\n\n3 Monate × 40h/Monat @ 100 EUR/h',
      status: QuoteStatus.CONVERTED,
      issueDate: daysAgo(100),
      validUntil: daysAgo(70),
      convertedToInvoiceId: invRecurring.id,
      notes: 'Sofort akzeptiert. Erstrechnung bereits gestellt.',
    },
  });

  console.log('✅ 5 quotes created');

  // ============================================================
  // EXPENSES / AUSGABEN
  // ============================================================

  // SOFTWARE
  await prisma.expense.createMany({
    data: [
      {
        ownerId: user.id,
        amount: 49,
        description: 'GitHub Pro – Monatliches Abo',
        category: ExpenseCategory.SOFTWARE,
        date: daysAgo(10),
        isRecurring: true,
        recurringInterval: RecurringInterval.MONTHLY,
        recurringStartDate: daysAgo(300),
        nextExpenseDate: daysFromNow(20),
        notes: 'GitHub Pro inkl. Copilot',
      },
      {
        ownerId: user.id,
        amount: 35,
        description: 'Figma – Professional Plan',
        category: ExpenseCategory.SOFTWARE,
        date: daysAgo(5),
        isRecurring: true,
        recurringInterval: RecurringInterval.MONTHLY,
        recurringStartDate: daysAgo(200),
        nextExpenseDate: daysFromNow(25),
      },
      {
        ownerId: user.id,
        amount: 16.99,
        description: 'Adobe Acrobat – Monatsabo',
        category: ExpenseCategory.SOFTWARE,
        date: daysAgo(15),
        isRecurring: true,
        recurringInterval: RecurringInterval.MONTHLY,
        recurringStartDate: daysAgo(180),
        nextExpenseDate: daysFromNow(15),
      },
      {
        ownerId: user.id,
        amount: 299,
        description: 'JetBrains All Products Pack – Jahresabo',
        category: ExpenseCategory.SOFTWARE,
        date: daysAgo(45),
        isRecurring: true,
        recurringInterval: RecurringInterval.YEARLY,
        recurringStartDate: daysAgo(45),
        nextExpenseDate: daysFromNow(320),
      },
    ],
  });

  // HARDWARE
  await prisma.expense.createMany({
    data: [
      {
        ownerId: user.id,
        amount: 1849,
        description: 'MacBook Pro 14" M3 – Arbeitslaptop',
        category: ExpenseCategory.HARDWARE,
        date: daysAgo(200),
        notes: 'Steuerlich absetzbar (100% betrieblich)',
      },
      {
        ownerId: user.id,
        amount: 349,
        description: 'LG 27" 4K Monitor – zweiter Bildschirm',
        category: ExpenseCategory.HARDWARE,
        date: daysAgo(150),
      },
      {
        ownerId: user.id,
        amount: 129,
        description: 'Logitech MX Keys – Tastatur',
        category: ExpenseCategory.HARDWARE,
        date: daysAgo(180),
      },
    ],
  });

  // TRAVEL
  await prisma.expense.createMany({
    data: [
      {
        ownerId: user.id,
        amount: 68.50,
        description: 'Bahnfahrt Berlin–Hamburg (Kundentermin TechVision)',
        category: ExpenseCategory.TRAVEL,
        date: daysAgo(20),
        projectId: p1.id,
        notes: '1. Klasse, Geschäftsreise',
      },
      {
        ownerId: user.id,
        amount: 42.30,
        description: 'Taxi zum Flughafen – Messe',
        category: ExpenseCategory.TRAVEL,
        date: daysAgo(35),
      },
      {
        ownerId: user.id,
        amount: 215,
        description: 'Hotel 2 Nächte – Konferenz Berlin',
        category: ExpenseCategory.TRAVEL,
        date: daysAgo(33),
      },
    ],
  });

  // MARKETING
  await prisma.expense.createMany({
    data: [
      {
        ownerId: user.id,
        amount: 150,
        description: 'LinkedIn Premium – Monatsabo',
        category: ExpenseCategory.MARKETING,
        date: daysAgo(8),
        isRecurring: true,
        recurringInterval: RecurringInterval.MONTHLY,
        recurringStartDate: daysAgo(90),
        nextExpenseDate: daysFromNow(22),
      },
      {
        ownerId: user.id,
        amount: 89,
        description: 'Freelance Portfolio Website – Hosting Jahresgebühr',
        category: ExpenseCategory.MARKETING,
        date: daysAgo(120),
        isRecurring: true,
        recurringInterval: RecurringInterval.YEARLY,
        recurringStartDate: daysAgo(120),
        nextExpenseDate: daysFromNow(245),
      },
    ],
  });

  // OFFICE
  await prisma.expense.createMany({
    data: [
      {
        ownerId: user.id,
        amount: 650,
        description: 'Coworking Space Mitgliedschaft – Januar 2026',
        category: ExpenseCategory.OFFICE,
        date: daysAgo(18),
        isRecurring: true,
        recurringInterval: RecurringInterval.MONTHLY,
        recurringStartDate: daysAgo(200),
        nextExpenseDate: daysFromNow(12),
      },
      {
        ownerId: user.id,
        amount: 23.99,
        description: 'Büromaterial – Stifte, Notizblöcke, Ordner',
        category: ExpenseCategory.OFFICE,
        date: daysAgo(40),
      },
    ],
  });

  // TRAINING
  await prisma.expense.createMany({
    data: [
      {
        ownerId: user.id,
        amount: 299,
        description: 'Udemy Kurs – Advanced TypeScript Patterns',
        category: ExpenseCategory.TRAINING,
        date: daysAgo(70),
      },
      {
        ownerId: user.id,
        amount: 1290,
        description: 'AWS Solutions Architect Zertifizierung – Kurs + Prüfungsgebühr',
        category: ExpenseCategory.TRAINING,
        date: daysAgo(110),
        notes: 'Prüfung bestanden ✓',
      },
    ],
  });

  // OTHER
  await prisma.expense.createMany({
    data: [
      {
        ownerId: user.id,
        amount: 95,
        description: 'Steuerberater – Quartalsgebühr',
        category: ExpenseCategory.OTHER,
        date: daysAgo(5),
        isRecurring: true,
        recurringInterval: RecurringInterval.QUARTERLY,
        recurringStartDate: daysAgo(270),
        nextExpenseDate: daysFromNow(85),
      },
      {
        ownerId: user.id,
        amount: 38.50,
        description: 'Geschäftsessen mit Kunde Fischer (Bewirtungsbeleg)',
        category: ExpenseCategory.OTHER,
        date: daysAgo(22),
        projectId: p5.id,
      },
    ],
  });

  console.log('✅ 18 expenses created (diverse categories + recurring)');

  // ============================================================
  // TIME ENTRIES
  // ============================================================

  // Abgeschlossene Zeiteinträge (verschiedene Projekte)
  await prisma.timeEntry.createMany({
    data: [
      // TechVision Portal
      {
        ownerId: user.id, projectId: p1.id, invoiceId: inv1.id,
        description: 'Requirements Engineering & Kickoff-Meeting',
        duration: 3 * 3600 + 30 * 60, startTime: daysAgo(88),
        endTime: new Date(daysAgo(88).getTime() + (3 * 3600 + 30 * 60) * 1000),
        isActive: false,
      },
      {
        ownerId: user.id, projectId: p1.id, invoiceId: inv1.id,
        description: 'UI/UX Design – Wireframes & Mockups',
        duration: 8 * 3600, startTime: daysAgo(85),
        endTime: new Date(daysAgo(85).getTime() + 8 * 3600 * 1000),
        isActive: false,
      },
      {
        ownerId: user.id, projectId: p1.id, invoiceId: inv3.id,
        description: 'Backend NestJS Setup & Architektur',
        duration: 6 * 3600, startTime: daysAgo(55),
        endTime: new Date(daysAgo(55).getTime() + 6 * 3600 * 1000),
        isActive: false,
      },
      {
        ownerId: user.id, projectId: p1.id, invoiceId: inv3.id,
        description: 'Prisma Schema & Migrations',
        duration: 4 * 3600 + 15 * 60, startTime: daysAgo(52),
        endTime: new Date(daysAgo(52).getTime() + (4 * 3600 + 15 * 60) * 1000),
        isActive: false,
      },
      {
        ownerId: user.id, projectId: p1.id,
        description: 'REST API Implementierung (Auth, Users, Projects)',
        duration: 7 * 3600 + 45 * 60, startTime: daysAgo(48),
        endTime: new Date(daysAgo(48).getTime() + (7 * 3600 + 45 * 60) * 1000),
        isActive: false,
      },
      // Brand Redesign
      {
        ownerId: user.id, projectId: p2.id, invoiceId: inv2.id,
        description: 'WordPress Theme Entwicklung',
        duration: 12 * 3600, startTime: daysAgo(80),
        endTime: new Date(daysAgo(80).getTime() + 12 * 3600 * 1000),
        isActive: false,
      },
      {
        ownerId: user.id, projectId: p2.id, invoiceId: inv2.id,
        description: 'Responsive Anpassungen & Cross-Browser Testing',
        duration: 5 * 3600, startTime: daysAgo(35),
        endTime: new Date(daysAgo(35).getTime() + 5 * 3600 * 1000),
        isActive: false,
      },
      // E-Commerce Retainer
      {
        ownerId: user.id, projectId: p4.id,
        description: 'Shop-Performance Optimierung & Caching',
        duration: 4 * 3600, startTime: daysAgo(14),
        endTime: new Date(daysAgo(14).getTime() + 4 * 3600 * 1000),
        isActive: false,
      },
      {
        ownerId: user.id, projectId: p4.id,
        description: 'Bugfixing Payment-Provider Integration',
        duration: 2 * 3600 + 30 * 60, startTime: daysAgo(7),
        endTime: new Date(daysAgo(7).getTime() + (2 * 3600 + 30 * 60) * 1000),
        isActive: false,
      },
      // Heute aktiver Timer
      {
        ownerId: user.id, projectId: p1.id,
        description: 'Frontend React Komponenten – Dashboard',
        duration: 0,
        startTime: new Date(Date.now() - 2 * 3600 * 1000 - 15 * 60 * 1000),
        endTime: null,
        isActive: true,
      },
    ],
  });
  console.log('✅ 10 time entries created (1 active timer)');

  // ============================================================
  // APPOINTMENTS / TERMINE
  // ============================================================
  await prisma.appointment.createMany({
    data: [
      // Vergangene Termine
      {
        ownerId: user.id, customerId: c1.id, projectId: p1.id,
        title: 'Sprint Review – TechVision Phase 1',
        description: 'Präsentation der fertigen Designs und ersten Backend-Strukturen.',
        startTime: daysAgo(30),
        endTime: new Date(daysAgo(30).getTime() + 2 * 3600 * 1000),
        contactName: 'Johannes Schmidt',
        contactEmail: 'j.schmidt@techvision.de',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
      },
      {
        ownerId: user.id, customerId: c2.id, projectId: p2.id,
        title: 'Projekt-Abnahme Brand Redesign',
        description: 'Finale Abnahme der Website. Alle Punkte aus dem Review abgearbeitet.',
        startTime: daysAgo(28),
        endTime: new Date(daysAgo(28).getTime() + 1.5 * 3600 * 1000),
        contactName: 'Anna Weber',
        contactEmail: 'anna.weber@creativestudio.de',
        contactPhone: '+49 30 12345678',
        meetingLink: 'https://teams.microsoft.com/l/meetup/xyz',
      },
      {
        ownerId: user.id, customerId: c5.id, projectId: p4.id,
        title: 'Monatliches Retainer-Meeting',
        description: 'Status-Update, offene Tickets, Planung nächste Woche.',
        startTime: daysAgo(7),
        endTime: new Date(daysAgo(7).getTime() + 1 * 3600 * 1000),
        contactName: 'Thomas Müller',
        contactEmail: 't.mueller@ecom-solutions.de',
      },
      // Zukünftige Termine
      {
        ownerId: user.id, customerId: c3.id, projectId: p3.id,
        title: 'Kickoff Meeting – MVP Mobile App',
        description: 'Projektstart, Vorstellung Team, Tooling, Workflow besprechen.',
        startTime: daysFromNow(3),
        endTime: new Date(daysFromNow(3).getTime() + 3 * 3600 * 1000),
        contactName: 'Lukas Hoffmann',
        contactEmail: 'lukas@startuplabs.io',
        contactPhone: '+49 177 9876543',
        meetingLink: 'https://zoom.us/j/123456789',
        meetingId: '123456789',
      },
      {
        ownerId: user.id, customerId: c1.id, projectId: p1.id,
        title: 'Sprint Planning – TechVision Phase 3',
        description: 'Planung der finalen Frontend-Entwicklungsphase.',
        startTime: daysFromNow(7),
        endTime: new Date(daysFromNow(7).getTime() + 2 * 3600 * 1000),
        contactName: 'Johannes Schmidt',
        contactEmail: 'j.schmidt@techvision.de',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
      },
      {
        ownerId: user.id, customerId: c4.id, projectId: p5.id,
        title: 'Budget-Freigabe Gespräch – Fischer Consulting',
        description: 'Entscheidung ob Projekt fortgeführt wird.',
        startTime: daysFromNow(14),
        endTime: new Date(daysFromNow(14).getTime() + 1 * 3600 * 1000),
        contactName: 'Maria Fischer',
        contactEmail: 'maria.fischer@consulting.de',
        contactPhone: '+49 89 55443322',
      },
      {
        ownerId: user.id,
        title: 'Steuerberater – Jahresabschluss 2025',
        description: 'Unterlagen übergeben, offene Fragen besprechen.',
        startTime: daysFromNow(21),
        endTime: new Date(daysFromNow(21).getTime() + 1.5 * 3600 * 1000),
        contactName: 'Dipl. Kfm. Klaus Bauer',
        contactEmail: 'bauer@steuerberatung-bauer.de',
        contactPhone: '+49 30 99887766',
      },
    ],
  });
  console.log('✅ 7 appointments created (3 past, 4 upcoming)');

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n🎉 Demo data seeding completed!');
  console.log('\n📋 Account:');
  console.log('   Email:    demo@freelancer.com');
  console.log('   Password: Demo123!');
  console.log('   Plan:     PRO (aktiv)');
  console.log('\n📊 Erstellt:');
  console.log('   - 2 Bankkonten (IBAN + PayPal)');
  console.log('   - 5 Kunden');
  console.log('   - 5 Projekte (ACTIVE, COMPLETED, PLANNING, ON_HOLD)');
  console.log('   - 9 Rechnungen (PAID×3, PARTIALLY_PAID, SENT, OVERDUE×2, DRAFT, RECURRING)');
  console.log('   - 6 Zahlungen');
  console.log('   - 5 Angebote (ACCEPTED, SENT, REJECTED, DRAFT, CONVERTED)');
  console.log('   - 18 Ausgaben (alle Kategorien, inkl. Abonnements)');
  console.log('   - 10 Zeiteinträge (1 aktiver Timer läuft)');
  console.log('   - 7 Termine (3 vergangen, 4 bevorstehend)');
  console.log('   - Onboarding-Profil (abgeschlossen)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
