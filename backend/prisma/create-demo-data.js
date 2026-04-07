'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const USER_ID = 'cmm25g6nr0000wqubdsn16yi2';
const ownerId = USER_ID;

// ─── Date helpers ──────────────────────────────────────────────────────────────
// Returns a Date in the month that is `mb` months before today, on `day` of that month
function md(mb, day) {
  const d = new Date();
  d.setMonth(d.getMonth() - mb);
  d.setDate(day);
  d.setHours(9, 0, 0, 0);
  return d;
}
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(9, 0, 0, 0); return d; }
function daysFromNow(n) { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(9, 0, 0, 0); return d; }
function monthsFromNow(n) { const d = new Date(); d.setMonth(d.getMonth() + n); return d; }
function hoursMs(h) { return h * 3600 * 1000; }
function hoursSec(h) { return h * 3600; }

// Time entry at a specific date
function teAt(projectId, invoiceId, hours, date, description) {
  return {
    ownerId, projectId, invoiceId, description,
    duration: hoursSec(hours), pauseDuration: 0,
    startTime: date, endTime: new Date(date.getTime() + hoursMs(hours)),
    isActive: false,
  };
}

async function main() {
  // ── Clear all existing demo data ─────────────────────────────────────────────
  console.log('🧹 Clearing existing demo data...');
  await prisma.timeEntry.deleteMany({ where: { ownerId } });
  await prisma.appointment.deleteMany({ where: { ownerId } });
  await prisma.payment.deleteMany({ where: { ownerId } });
  await prisma.invoice.deleteMany({ where: { ownerId } });
  await prisma.quote.deleteMany({ where: { ownerId } });
  await prisma.expense.deleteMany({ where: { ownerId } });
  await prisma.project.deleteMany({ where: { ownerId } });
  await prisma.customer.deleteMany({ where: { ownerId } });
  await prisma.bankAccount.deleteMany({ where: { ownerId } });
  console.log('✅ Cleared.\n');

  // ── User ─────────────────────────────────────────────────────────────────────
  await prisma.user.update({
    where: { id: ownerId },
    data: { firstName: 'Max', lastName: 'Müller', targetHourlyRate: 85, subscriptionPlan: 'PRO', subscriptionStatus: 'ACTIVE' },
  });
  console.log('✅ User: Max Müller | Ziel: 85 €/Std | PRO');

  // ── Bank accounts ─────────────────────────────────────────────────────────────
  const bank = await prisma.bankAccount.create({ data: {
    ownerId, name: 'Geschäftskonto Sparkasse', bankName: 'Sparkasse München',
    iban: 'DE89370400440532013000', bic: 'SSKMDEMMXXX',
    accountHolder: 'Max Müller', isDefault: true,
  }});
  await prisma.bankAccount.create({ data: {
    ownerId, name: 'PayPal Geschäft', isPaypal: true, paypalEmail: 'demo@freelancer.com',
  }});
  console.log('✅ 2 Bankkonten');

  // ── Customers ─────────────────────────────────────────────────────────────────
  const c1 = await prisma.customer.create({ data: {
    ownerId, name: 'Thomas Bauer', company: 'TechVision GmbH', email: 'tbauer@techvision.de',
    defaultPaymentTerms: 14, notes: 'Langjähriger Stammkunde. Pünktlicher Zahler.',
  }});
  const c2 = await prisma.customer.create({ data: {
    ownerId, name: 'Lisa Weber', company: 'Kreativ Studio Weber', email: 'lisa@kreativweber.de',
    defaultPaymentTerms: 30, notes: 'Viele Revisionen. Bezahlt zuverlässig, aber langsam.',
  }});
  const c3 = await prisma.customer.create({ data: {
    ownerId, name: 'Stefan Braun', company: 'BioShop GmbH', email: 's.braun@bioshop.de',
    defaultPaymentTerms: 30, notes: 'Scope wird laufend erweitert. Überfällige Zahlung.',
  }});
  const c4 = await prisma.customer.create({ data: {
    ownerId, name: 'Jana Koch', company: 'StartupLab Berlin', email: 'jana@startuplab.de',
    defaultPaymentTerms: 14, notes: 'Startup. Wartet auf Finanzierungsrunde.',
  }});
  const c5 = await prisma.customer.create({ data: {
    ownerId, name: 'Hans Richter', company: 'Richter Immobilien', email: 'h.richter@richter-immo.de',
    defaultPaymentTerms: 30, notes: 'Neukunde per Empfehlung von TechVision.',
  }});
  console.log('✅ 5 Kunden');

  // ── Projects ──────────────────────────────────────────────────────────────────
  const p1 = await prisma.project.create({ data: {
    ownerId, customerId: c1.id, name: 'Website-Relaunch TechVision',
    description: 'Kompletter Relaunch der Unternehmenswebsite mit Corporate Design, responsivem Layout und WordPress-CMS.',
    status: 'COMPLETED', budget: 12000, startDate: md(6, 1), endDate: md(1, 15),
    notes: 'Erfolgreich abgeschlossen. Kunde sehr zufrieden. Retainer-Vertrag abgeschlossen.',
  }});
  const p2 = await prisma.project.create({ data: {
    ownerId, customerId: c2.id, name: 'Corporate Design & Brand Identity',
    description: 'Logo, Farb- und Typografiesystem, Styleguide, Visitenkarten, Social-Media-Templates.',
    status: 'ACTIVE', budget: 6500, startDate: md(4, 5),
    notes: 'Viele Revisionen. Zeitplan leicht verschoben. Restzahlung ausstehend.',
  }});
  const p3 = await prisma.project.create({ data: {
    ownerId, customerId: c3.id, name: 'E-Commerce Plattform BioShop',
    description: 'Maßgeschneiderte E-Commerce-Plattform mit Produktkatalog, Warenkorb, Checkout, CRM und Reporting.',
    status: 'ACTIVE', budget: 28000, startDate: md(5, 10),
    notes: 'Scope mehrfach erweitert ohne Nachtrag. Viele unbezahlte Stunden aufgelaufen. Phase-3-Angebot versendet.',
  }});
  const p4 = await prisma.project.create({ data: {
    ownerId, customerId: c4.id, name: 'MVP Landing Page & Pitch Deck',
    description: 'Landing Page für das MVP sowie Unterstützung beim Investor-Pitch-Deck.',
    status: 'ON_HOLD', budget: 3200, startDate: md(2, 1),
    notes: 'Auf Eis. Reaktivierung für März geplant nach Finanzierungsrunde.',
  }});
  const p5 = await prisma.project.create({ data: {
    ownerId, customerId: c5.id, name: 'Immobilien-Portal Richter',
    description: 'Modernes Immobilien-Portal mit Objektverwaltung, Exposé-Generator und CRM-Integration.',
    status: 'PLANNING', budget: 18000, startDate: daysFromNow(14),
    notes: 'Kick-off nächste Woche. Anforderungen in Klärung.',
  }});
  const p6 = await prisma.project.create({ data: {
    ownerId, name: 'Eigene Website & Portfolio',
    description: 'Neugestaltung der eigenen Freelancer-Website mit Portfolio, Referenzen und Kontaktformular.',
    status: 'ACTIVE', startDate: md(1, 10),
    notes: 'Eigenprojekt für Neukundenakquise.',
  }});
  console.log('✅ 6 Projekte');

  // ══════════════════════════════════════════════════════════════════════════════
  // PROJECT 1 — TechVision (COMPLETED) → GREEN
  // Strategie: 90 €/Std brutto über 6 Monate
  // grossRate = 10.800 / 120h = 90 €/Std → ratio 90/85 = 1.06 → GREEN
  // Geschichte: 6 grüne Balken bei 90 €/Std
  // ══════════════════════════════════════════════════════════════════════════════
  const p1_i_sep = await prisma.invoice.create({ data: {
    ownerId, customerId: c1.id, projectId: p1.id, bankAccountId: bank.id,
    invoiceNumber: 'RE-2025-001',
    amount: 1800, description: 'TechVision – Konzept & Wireframes Sep 2025\n20 Std × 90,00 €',
    status: 'PAID', totalPaid: 1800,
    issueDate: md(5, 12), dueDate: md(5, 26),
  }});
  const p1_i_oct = await prisma.invoice.create({ data: {
    ownerId, customerId: c1.id, projectId: p1.id, bankAccountId: bank.id,
    invoiceNumber: 'RE-2025-002',
    amount: 2700, description: 'TechVision – UI-Design & Styleguide Okt 2025\n30 Std × 90,00 €',
    status: 'PAID', totalPaid: 2700,
    issueDate: md(4, 10), dueDate: md(4, 24),
  }});
  const p1_i_nov = await prisma.invoice.create({ data: {
    ownerId, customerId: c1.id, projectId: p1.id, bankAccountId: bank.id,
    invoiceNumber: 'RE-2025-003',
    amount: 2700, description: 'TechVision – Frontend-Entwicklung Nov 2025\n30 Std × 90,00 €',
    status: 'PAID', totalPaid: 2700,
    issueDate: md(3, 12), dueDate: md(3, 26),
  }});
  const p1_i_dec = await prisma.invoice.create({ data: {
    ownerId, customerId: c1.id, projectId: p1.id, bankAccountId: bank.id,
    invoiceNumber: 'RE-2025-004',
    amount: 1800, description: 'TechVision – CMS, Tests & Launch Dez 2025\n20 Std × 90,00 €',
    status: 'PAID', totalPaid: 1800,
    issueDate: md(2, 10), dueDate: md(2, 24),
  }});
  const p1_i_jan = await prisma.invoice.create({ data: {
    ownerId, customerId: c1.id, projectId: p1.id, bankAccountId: bank.id,
    invoiceNumber: 'RE-2026-RET-01',
    amount: 900, description: 'TechVision – Wartung & Support Jan 2026\n10 Std × 90,00 €',
    status: 'PAID', totalPaid: 900,
    issueDate: md(1, 5), dueDate: md(1, 19),
    isRecurring: true, recurringInterval: 'MONTHLY', recurringStartDate: md(2, 1), nextInvoiceDate: monthsFromNow(1),
  }});
  const p1_i_feb = await prisma.invoice.create({ data: {
    ownerId, customerId: c1.id, projectId: p1.id, bankAccountId: bank.id,
    invoiceNumber: 'RE-2026-RET-02',
    amount: 900, description: 'TechVision – Wartung & Support Feb 2026\n10 Std × 90,00 €',
    status: 'SENT', totalPaid: 0,
    issueDate: daysAgo(10), dueDate: daysFromNow(4),
  }});

  // Payments for p1
  for (const [inv, d] of [
    [p1_i_sep, md(5, 25)], [p1_i_oct, md(4, 22)], [p1_i_nov, md(3, 25)],
    [p1_i_dec, md(2, 22)], [p1_i_jan, md(1, 18)],
  ]) {
    await prisma.payment.create({ data: { ownerId, invoiceId: inv.id, amount: inv.amount, paymentDate: d, note: 'Überweisung eingegangen' }});
  }

  // Time entries p1 — 120h total, all billable, 20h per month (5h×4)
  // Sep: 20h linked to p1_i_sep
  const p1_te = [
    teAt(p1.id, p1_i_sep.id, 4, md(5, 3), 'Anforderungsanalyse & Stakeholder-Gespräch'),
    teAt(p1.id, p1_i_sep.id, 4, md(5, 8), 'Informationsarchitektur & Sitemap'),
    teAt(p1.id, p1_i_sep.id, 4, md(5, 12), 'Wireframes Desktop'),
    teAt(p1.id, p1_i_sep.id, 4, md(5, 17), 'Wireframes Mobile & Responsive'),
    teAt(p1.id, p1_i_sep.id, 4, md(5, 22), 'Moodboard & erster Stilvorschlag'),
    // Oct: 30h linked to p1_i_oct
    teAt(p1.id, p1_i_oct.id, 4, md(4, 2), 'UI-Design – Startseite'),
    teAt(p1.id, p1_i_oct.id, 4, md(4, 7), 'UI-Design – Leistungsseiten'),
    teAt(p1.id, p1_i_oct.id, 4, md(4, 10), 'UI-Design – Über uns & Kontakt'),
    teAt(p1.id, p1_i_oct.id, 4, md(4, 14), 'Styleguide & Designsystem'),
    teAt(p1.id, p1_i_oct.id, 4, md(4, 19), 'Design-Review & Kunden-Feedback'),
    teAt(p1.id, p1_i_oct.id, 5, md(4, 24), 'Design-Überarbeitungen Runde 1'),
    teAt(p1.id, p1_i_oct.id, 5, md(4, 28), 'Design-Überarbeitungen Runde 2 & Abnahme'),
    // Nov: 30h linked to p1_i_nov
    teAt(p1.id, p1_i_nov.id, 4, md(3, 3), 'Frontend-Grundstruktur & Layout-System'),
    teAt(p1.id, p1_i_nov.id, 4, md(3, 6), 'Frontend – Startseite & Hero'),
    teAt(p1.id, p1_i_nov.id, 4, md(3, 10), 'Frontend – Leistungsseiten'),
    teAt(p1.id, p1_i_nov.id, 4, md(3, 14), 'Frontend – Blog & Über uns'),
    teAt(p1.id, p1_i_nov.id, 4, md(3, 18), 'WordPress CMS-Integration'),
    teAt(p1.id, p1_i_nov.id, 5, md(3, 22), 'Performance-Optimierung & Core Web Vitals'),
    teAt(p1.id, p1_i_nov.id, 5, md(3, 26), 'Cross-Browser-Tests & Bugfixes'),
    // Dec: 20h linked to p1_i_dec
    teAt(p1.id, p1_i_dec.id, 4, md(2, 4), 'Abnahmetests & QS'),
    teAt(p1.id, p1_i_dec.id, 4, md(2, 8), 'Deployment & Server-Setup'),
    teAt(p1.id, p1_i_dec.id, 4, md(2, 12), 'DNS-Migration & SSL'),
    teAt(p1.id, p1_i_dec.id, 4, md(2, 16), 'Launch-Überwachung & CMS-Schulung'),
    teAt(p1.id, p1_i_dec.id, 4, md(2, 19), 'Abschlussdokumentation & Übergabe'),
    // Jan: 10h (retainer) linked to p1_i_jan
    teAt(p1.id, p1_i_jan.id, 5, md(1, 10), 'Wartung & Security-Updates Jan'),
    teAt(p1.id, p1_i_jan.id, 5, md(1, 22), 'Inhaltsänderungen & Support Jan'),
    // Feb: 10h (retainer) linked to p1_i_feb
    teAt(p1.id, p1_i_feb.id, 5, daysAgo(13), 'Wartung & Security-Updates Feb'),
    teAt(p1.id, p1_i_feb.id, 5, daysAgo(6), 'Performance-Report & Support Feb'),
  ];
  // p1 totals: 120h, Revenue 10.800€, grossRate 90€/h → GREEN ✓
  console.log(`   p1 TechVision: 10.800€ / 120h = 90€/h → 🟢 GREEN`);

  // ══════════════════════════════════════════════════════════════════════════════
  // PROJECT 2 — Kreativ Weber (ACTIVE) → YELLOW
  // Strategie: Gute Monate gemischt mit Revisions-Monaten + etwas unbilledHours
  // grossRate = 5.525 / 80h = 69,1 €/Std → ratio 69,1/85 = 0,81 → YELLOW
  // Geschichte: Mix aus grünen (85€) und gelben (57€) Balken
  // ══════════════════════════════════════════════════════════════════════════════
  const p2_i_oct = await prisma.invoice.create({ data: {
    ownerId, customerId: c2.id, projectId: p2.id, bankAccountId: bank.id,
    invoiceNumber: 'RE-2025-010',
    amount: 1700, description: 'Kreativ Weber – Logoentwicklung & Designsystem Okt 2025\n20 Std × 85,00 €',
    status: 'PAID', totalPaid: 1700,
    issueDate: md(4, 8), dueDate: md(4, 8 + 30),
  }});
  const p2_i_nov = await prisma.invoice.create({ data: {
    ownerId, customerId: c2.id, projectId: p2.id, bankAccountId: bank.id,
    invoiceNumber: 'RE-2025-011',
    amount: 1700, description: 'Kreativ Weber – Styleguide & Weiterentwicklung Nov 2025\n20 Std × 85,00 €',
    status: 'PAID', totalPaid: 1700,
    issueDate: md(3, 6), dueDate: md(3, 6 + 30),
  }});
  const p2_i_dec = await prisma.invoice.create({ data: {
    ownerId, customerId: c2.id, projectId: p2.id, bankAccountId: bank.id,
    invoiceNumber: 'RE-2025-012',
    amount: 1275, description: 'Kreativ Weber – Drucksachen & Abschluss Dez 2025\n15 Std × 85,00 €',
    status: 'PARTIALLY_PAID', totalPaid: 600,
    issueDate: md(2, 8), dueDate: md(2, 8 + 30),
  }});
  const p2_i_jan = await prisma.invoice.create({ data: {
    ownerId, customerId: c2.id, projectId: p2.id, bankAccountId: bank.id,
    invoiceNumber: 'RE-2026-001',
    amount: 850, description: 'Kreativ Weber – Social Media Templates Jan 2026\n10 Std × 85,00 €',
    status: 'SENT', totalPaid: 0,
    issueDate: md(1, 8), dueDate: daysFromNow(14),
  }});

  // Payments for p2
  await prisma.payment.create({ data: { ownerId, invoiceId: p2_i_oct.id, amount: 1700, paymentDate: md(3, 25), note: 'Überweisung nach Erinnerung' }});
  await prisma.payment.create({ data: { ownerId, invoiceId: p2_i_nov.id, amount: 1700, paymentDate: md(2, 20), note: 'Überweisung' }});
  await prisma.payment.create({ data: { ownerId, invoiceId: p2_i_dec.id, amount: 600, paymentDate: md(1, 15), note: 'Teilzahlung – Rest folgt' }});

  // Time entries p2 — 80h total (75h billable + 5h unbilled)
  // Oct: 20h billed → p2_i_oct → 1700/20 = 85€/h bar (GREEN)
  // Nov: 30h billed → p2_i_nov → 1700/30 = 56,7€/h bar (AMBER – revisions took longer)
  // Dec: 15h billed + 2h unbilled = 17h → 1275/17 = 75€/h bar (AMBER)
  // Jan: 10h billed → p2_i_jan → 850/10 = 85€/h bar (GREEN)
  // Feb: 3h unbilled → tiny bar (unbilled warning!)
  const p2_te = [
    // Oct: 20h billed
    teAt(p2.id, p2_i_oct.id, 4, md(4, 3), 'Kick-off & Briefing Weber'),
    teAt(p2.id, p2_i_oct.id, 4, md(4, 8), 'Markenanalyse & Wettbewerberrecherche'),
    teAt(p2.id, p2_i_oct.id, 4, md(4, 14), 'Logokonzepte – Variante A & B'),
    teAt(p2.id, p2_i_oct.id, 4, md(4, 20), 'Logokonzepte – Variante C & Präsentation'),
    teAt(p2.id, p2_i_oct.id, 4, md(4, 25), 'Farbpalette & Typografie definieren'),
    // Nov: 30h billed (same invoice amount, but more hours due to revisions → lower bar)
    teAt(p2.id, p2_i_nov.id, 4, md(3, 3), 'Logo-Überarbeitungen Runde 1'),
    teAt(p2.id, p2_i_nov.id, 4, md(3, 7), 'Logo-Überarbeitungen Runde 2'),
    teAt(p2.id, p2_i_nov.id, 4, md(3, 11), 'Logo-Überarbeitungen Runde 3 (Sonderaufwand)'),
    teAt(p2.id, p2_i_nov.id, 4, md(3, 15), 'Styleguide – Entwurf'),
    teAt(p2.id, p2_i_nov.id, 4, md(3, 19), 'Styleguide – Finalisierung & Dokumentation'),
    teAt(p2.id, p2_i_nov.id, 5, md(3, 23), 'Designsystem ausarbeiten'),
    teAt(p2.id, p2_i_nov.id, 5, md(3, 27), 'Interne Abstimmung & Kunden-Präsentation'),
    // Dec: 15h billed + 2h unbilled
    teAt(p2.id, p2_i_dec.id, 4, md(2, 4), 'Visitenkarte – Layout & Reinzeichnung'),
    teAt(p2.id, p2_i_dec.id, 4, md(2, 9), 'Briefpapier & E-Mail-Signatur'),
    teAt(p2.id, p2_i_dec.id, 4, md(2, 13), 'Druckdaten vorbereiten & Druckerei abstimmen'),
    teAt(p2.id, p2_i_dec.id, 3, md(2, 18), 'Finale Abnahme & Dateiübergabe'),
    teAt(p2.id, null, 1, md(2, 20), 'Kleinkorrektur Schriftgröße (nicht berechnet)'),
    teAt(p2.id, null, 1, md(2, 22), 'Farbkalibrierung Druckprobe (nicht berechnet)'),
    // Jan: 10h billed
    teAt(p2.id, p2_i_jan.id, 5, md(1, 8), 'Social Media Templates – Instagram'),
    teAt(p2.id, p2_i_jan.id, 5, md(1, 16), 'Social Media Templates – LinkedIn & Facebook'),
    // Feb: 3h unbilled (Folgearbeiten, noch nicht berechnet)
    teAt(p2.id, null, 2, daysAgo(10), 'Anpassungen für Frühjahrs-Kampagne (unbezahlt)'),
    teAt(p2.id, null, 1, daysAgo(5), 'Farbvarianten Ostern-Post (unbezahlt)'),
  ];
  // p2 totals: 80h, Revenue 5.525€, grossRate 69,1€/h → YELLOW ✓
  console.log(`   p2 Kreativ Weber: 5.525€ / 80h = 69,1€/h → 🟡 YELLOW`);

  // ══════════════════════════════════════════════════════════════════════════════
  // PROJECT 3 — BioShop (ACTIVE) → RED
  // Strategie: Viele unbezahlte Stunden durch Scope-Creep
  // grossRate = 4.000 / 120h = 33,3 €/Std → ratio 33,3/85 = 0,39 → RED
  // Geschichte: 2 Monate mit niedrigen Balken, 4 Monate mit winzigen 0€-Balken
  // ══════════════════════════════════════════════════════════════════════════════
  const p3_i_sep = await prisma.invoice.create({ data: {
    ownerId, customerId: c3.id, projectId: p3.id, bankAccountId: bank.id,
    invoiceNumber: 'RE-2025-020',
    amount: 2400, description: 'BioShop – Konzept, Architektur & Backend-Grundstruktur Sep 2025\n30 Std × 80,00 €',
    status: 'PAID', totalPaid: 2400,
    issueDate: md(5, 10), dueDate: md(5, 10 + 30),
  }});
  const p3_i_oct = await prisma.invoice.create({ data: {
    ownerId, customerId: c3.id, projectId: p3.id, bankAccountId: bank.id,
    invoiceNumber: 'RE-2025-021',
    amount: 1600, description: 'BioShop – Backend-Entwicklung: Warenkorb & Checkout Okt 2025\n20 Std × 80,00 €',
    status: 'OVERDUE', totalPaid: 0,
    issueDate: md(4, 5), dueDate: md(3, 5),
    dunningLevel: 1, lastDunningDate: daysAgo(22),
  }});

  // Payment for p3 (only Sep invoice was paid)
  await prisma.payment.create({ data: { ownerId, invoiceId: p3_i_sep.id, amount: 2400, paymentDate: md(5, 25 + 5), note: 'Anzahlung überwiesen' }});

  // Time entries p3 — 120h total (50h billable + 70h unbilled → RED)
  // Sep: 30h billed + 10h unbilled = 40h → 2400/40 = 60€/h bar (AMBER)
  // Oct: 20h billed + 10h unbilled = 30h → 1600/30 = 53,3€/h bar (AMBER)
  // Nov: 0€ / 20h unbilled → tiny bar (Scope-Creep)
  // Dec: 0€ / 15h unbilled → tiny bar
  // Jan: 0€ / 10h unbilled → tiny bar
  // Feb: 0€ / 5h unbilled → tiny bar
  const p3_te = [
    // Sep: 30h billed
    teAt(p3.id, p3_i_sep.id, 5, md(5, 3), 'Anforderungsworkshop & Kick-off'),
    teAt(p3.id, p3_i_sep.id, 5, md(5, 7), 'Datenbankschema & Systemarchitektur'),
    teAt(p3.id, p3_i_sep.id, 4, md(5, 11), 'Tech-Stack-Auswahl & Projektplanung'),
    teAt(p3.id, p3_i_sep.id, 4, md(5, 15), 'Entwicklungsumgebung & CI/CD-Pipeline'),
    teAt(p3.id, p3_i_sep.id, 4, md(5, 19), 'Backend-Grundstruktur & API-Gerüst'),
    teAt(p3.id, p3_i_sep.id, 4, md(5, 23), 'Benutzerauthentifizierung & Rollenverwaltung'),
    teAt(p3.id, p3_i_sep.id, 4, md(5, 27), 'Produktkatalog-API (CRUD)'),
    // Sep: 10h unbilled (Scope-Erweiterung nicht budgetiert)
    teAt(p3.id, null, 5, md(5, 25), 'Produktsuche & Filterlogik (Scope-Erweiterung)'),
    teAt(p3.id, null, 5, md(5, 29), 'Kategoriebaum & Navigation (nicht berechnet)'),
    // Oct: 20h billed
    teAt(p3.id, p3_i_oct.id, 5, md(4, 3), 'Warenkorb-Backend & Session-Management'),
    teAt(p3.id, p3_i_oct.id, 5, md(4, 8), 'Checkout-Flow & Bestellabwicklung'),
    teAt(p3.id, p3_i_oct.id, 5, md(4, 13), 'Zahlungsintegration Stripe'),
    teAt(p3.id, p3_i_oct.id, 5, md(4, 20), 'Order-Management & Bestellstatus'),
    // Oct: 10h unbilled
    teAt(p3.id, null, 5, md(4, 25), 'Bewertungssystem (nicht im Scope)'),
    teAt(p3.id, null, 5, md(4, 28), 'Wunschliste & Merkfunktion (nicht berechnet)'),
    // Nov: 20h all unbilled
    teAt(p3.id, null, 5, md(3, 5), 'Admin-Dashboard Backend (Scope-Erweiterung)'),
    teAt(p3.id, null, 5, md(3, 10), 'E-Mail-Benachrichtigungen & Templates'),
    teAt(p3.id, null, 5, md(3, 16), 'Reporting-Modul & CSV-Export'),
    teAt(p3.id, null, 5, md(3, 22), 'Lagerverwaltung (neu hinzugekommen)'),
    // Dec: 15h all unbilled
    teAt(p3.id, null, 5, md(2, 5), 'Performance-Optimierung & Caching'),
    teAt(p3.id, null, 5, md(2, 12), 'Security-Audit & Härtung'),
    teAt(p3.id, null, 5, md(2, 20), 'Bugfixes & Qualitätssicherung Dez'),
    // Jan: 10h all unbilled
    teAt(p3.id, null, 5, md(1, 8), 'Staging-Deployment & Tests Jan'),
    teAt(p3.id, null, 5, md(1, 20), 'API-Dokumentation & Übergabevorbereitung'),
    // Feb: 5h all unbilled
    teAt(p3.id, null, 5, daysAgo(8), 'Letzte Bugfixes vor möglichem Launch'),
  ];
  // p3 totals: 120h, Revenue 4.000€, grossRate 33,3€/h → RED ✓
  console.log(`   p3 BioShop: 4.000€ / 120h = 33,3€/h → 🔴 RED`);

  // ── Time entries for p4, p6 ──────────────────────────────────────────────────
  const p4_te = [
    teAt(p4.id, null, 3, md(2, 5), 'Erstgespräch & Anforderungsaufnahme'),
    teAt(p4.id, null, 4, md(2, 12), 'Konzept & Wireframes Landing Page'),
    teAt(p4.id, null, 3, md(2, 18), 'Pitch-Deck Struktur & Inhalte'),
  ];
  const p6_te = [
    teAt(p6.id, null, 3, md(1, 8), 'Konzept & Struktur Portfolio-Website'),
    teAt(p6.id, null, 4, md(1, 18), 'Design – Portfolio & Referenzseite'),
    teAt(p6.id, null, 3, daysAgo(8), 'Content & SEO-Optimierung'),
  ];

  // Create all time entries
  const allEntries = [...p1_te, ...p2_te, ...p3_te, ...p4_te, ...p6_te];
  for (const entry of allEntries) {
    await prisma.timeEntry.create({ data: entry });
  }
  console.log(`✅ ${allEntries.length} Zeiteinträge`);

  // ── Quotes ────────────────────────────────────────────────────────────────────
  await prisma.quote.create({ data: {
    ownerId, customerId: c1.id, projectId: p1.id,
    quoteNumber: 'AN-2025-001', amount: 10800, status: 'CONVERTED',
    description: 'Website-Relaunch TechVision – Gesamtprojekt\n120 Std × 90,00 €\n\nPhase 1: Konzept & Design (40h)\nPhase 2: Entwicklung (40h)\nPhase 3: Testing & Launch (40h)',
    issueDate: md(7, 5), validUntil: md(6, 5),
    notes: 'Nach zwei Verhandlungsrunden akzeptiert.',
  }});
  await prisma.quote.create({ data: {
    ownerId, customerId: c2.id, projectId: p2.id,
    quoteNumber: 'AN-2025-009', amount: 6500, status: 'ACCEPTED',
    description: 'Corporate Design & Brand Identity Weber\n• Logo (3 Varianten)\n• Designsystem & Styleguide\n• Drucksachen (Visitenkarte, Briefpapier)\n• Social Media Templates',
    issueDate: md(5, 15), validUntil: md(4, 15),
    notes: 'Sofort akzeptiert.',
  }});
  await prisma.quote.create({ data: {
    ownerId, customerId: c3.id, projectId: p3.id,
    quoteNumber: 'AN-2026-001', amount: 8500, status: 'SENT',
    description: 'BioShop – Phase 3: Frontend & Checkout\n100 Std × 85,00 €\n• Produktseiten (40h)\n• Warenkorb & Checkout (35h)\n• Kundenkonto (25h)',
    issueDate: daysAgo(7), validUntil: daysFromNow(23),
    notes: 'Angebot für die nächste Phase. Kunde prüft.',
  }});
  await prisma.quote.create({ data: {
    ownerId, customerId: c4.id,
    quoteNumber: 'AN-2025-008', amount: 4800, status: 'REJECTED',
    description: 'Full-Service Website & Branding StartupLab Berlin',
    issueDate: md(3, 10), validUntil: md(2, 10),
    notes: 'Budget zu hoch. Kleineres Angebot eingereicht.',
  }});
  await prisma.quote.create({ data: {
    ownerId, customerId: c5.id, projectId: p5.id,
    quoteNumber: 'AN-2026-003', amount: 18000, status: 'DRAFT',
    description: 'Immobilien-Portal Richter – Gesamtprojekt\n• Backend & API (80h × 90€)\n• Frontend & Design (80h × 90€)\n• Integration & Testing (50h × 90€)',
    issueDate: daysAgo(3), validUntil: daysFromNow(27),
  }});
  await prisma.quote.create({ data: {
    ownerId, customerId: c1.id,
    quoteNumber: 'AN-2026-004', amount: 4250, status: 'SENT',
    description: 'TechVision – Intranet-Portal Phase 1\n50 Std × 85,00 €\nMitarbeiterverzeichnis, News, Dokumentenverwaltung',
    issueDate: daysAgo(2), validUntil: daysFromNow(28),
    notes: 'Follow-up nach erfolgreichem Website-Relaunch.',
  }});
  console.log('✅ 6 Angebote');

  // ── Expenses ──────────────────────────────────────────────────────────────────
  const oneTime = [
    { ownerId, amount: 1299, description: 'Apple Magic Keyboard & Trackpad', category: 'HARDWARE', date: md(5, 5) },
    { ownerId, amount: 349.99, description: 'Dell UltraSharp 27" Monitor (U2722D)', category: 'HARDWARE', date: md(4, 3) },
    { ownerId, amount: 89.50, description: 'Bahn Frankfurt → München (Kundenbesuch TechVision)', category: 'TRAVEL', date: md(5, 8), projectId: p1.id },
    { ownerId, amount: 45, description: 'Taxi & ÖPNV – Kundenbesuche Kreativ Weber', category: 'TRAVEL', date: md(2, 10), projectId: p2.id },
    { ownerId, amount: 297, description: 'Udemy – Advanced React & Next.js Kurs', category: 'TRAINING', date: md(3, 15) },
    { ownerId, amount: 149, description: 'Figma Config 2025 – Konferenzticket', category: 'TRAINING', date: md(4, 20) },
    { ownerId, amount: 150, description: 'Google Ads – Kampagne Q4 2025', category: 'MARKETING', date: md(3, 1) },
    { ownerId, amount: 75.80, description: 'Büromaterial (Notizbücher, Marker, Haftnotizen)', category: 'OFFICE', date: md(1, 5) },
    { ownerId, amount: 29.99, description: 'Shutterstock – Stockfotos BioShop (5 Bilder)', category: 'OTHER', date: md(3, 12), projectId: p3.id, notes: 'Produktfotos Startseite' },
    { ownerId, amount: 199, description: 'GT Walsheim Pro – Schriftlizenz für Kreativ Weber', category: 'SOFTWARE', date: md(2, 8), projectId: p2.id, notes: 'Perpetual license' },
  ];
  const abos = [
    { ownerId, amount: 21, description: 'Figma Professional', category: 'SOFTWARE', date: daysAgo(5), isRecurring: true, recurringInterval: 'MONTHLY', recurringStartDate: md(12, 1), nextExpenseDate: daysFromNow(25), notes: 'Primäres Design-Tool.' },
    { ownerId, amount: 14.99, description: 'Adobe Fonts', category: 'SOFTWARE', date: daysAgo(10), isRecurring: true, recurringInterval: 'MONTHLY', recurringStartDate: md(18, 1), nextExpenseDate: daysFromNow(20) },
    { ownerId, amount: 10, description: 'GitHub Copilot', category: 'SOFTWARE', date: daysAgo(3), isRecurring: true, recurringInterval: 'MONTHLY', recurringStartDate: md(6, 1), nextExpenseDate: daysFromNow(27), notes: 'Spart ~1h täglich.' },
    { ownerId, amount: 15.99, description: 'Notion (Pro-Plan)', category: 'SOFTWARE', date: daysAgo(15), isRecurring: true, recurringInterval: 'MONTHLY', recurringStartDate: md(8, 1), nextExpenseDate: daysFromNow(15) },
    { ownerId, amount: 25, description: 'Slack Pro', category: 'SOFTWARE', date: daysAgo(8), isRecurring: true, recurringInterval: 'MONTHLY', recurringStartDate: md(10, 1), nextExpenseDate: daysFromNow(22) },
    { ownerId, amount: 84, description: 'Hetzner Cloud – 3× CX21 Server', category: 'SOFTWARE', date: daysAgo(20), isRecurring: true, recurringInterval: 'QUARTERLY', recurringStartDate: md(9, 1), nextExpenseDate: daysFromNow(70), notes: 'Hosting TechVision, BioShop.' },
    { ownerId, amount: 349, description: 'Steuerberater – Quartalsbesprechung', category: 'OTHER', date: daysAgo(25), isRecurring: true, recurringInterval: 'QUARTERLY', recurringStartDate: md(12, 1), nextExpenseDate: daysFromNow(65), notes: 'Dr. Müller Steuerberatung GmbH.' },
    { ownerId, amount: 99, description: 'Cloudflare Pro (Jahresplan)', category: 'SOFTWARE', date: md(2, 1), isRecurring: true, recurringInterval: 'YEARLY', recurringStartDate: md(14, 1), nextExpenseDate: monthsFromNow(10), notes: 'DNS, CDN & DDoS-Schutz.' },
  ];
  for (const e of [...oneTime, ...abos]) await prisma.expense.create({ data: e });
  console.log(`✅ ${oneTime.length + abos.length} Ausgaben (${oneTime.length} einmalig, ${abos.length} Abos)`);

  // ── Appointments ──────────────────────────────────────────────────────────────
  const appts = [
    { ownerId, customerId: c1.id, projectId: p1.id, title: 'Website-Launch Abnahme TechVision',
      description: 'Finale Abnahme und Go-live-Freigabe.', startTime: md(2, 15), endTime: new Date(md(2, 15).getTime() + hoursMs(2)), contactName: 'Thomas Bauer', contactEmail: 'tbauer@techvision.de' },
    { ownerId, customerId: c3.id, projectId: p3.id, title: 'Sprint Review BioShop – Backend',
      description: 'Vorstellung Backend-Features, nächster Sprint.', startTime: md(1, 20), endTime: new Date(md(1, 20).getTime() + hoursMs(1.5)), contactName: 'Stefan Braun', contactEmail: 's.braun@bioshop.de', meetingLink: 'https://meet.google.com/xyz-demo' },
    { ownerId, customerId: c2.id, projectId: p2.id, title: 'Design-Review Kreativ Weber',
      description: 'Präsentation des überarbeiteten Designs.', startTime: daysAgo(12), endTime: new Date(daysAgo(12).getTime() + hoursMs(1)), contactName: 'Lisa Weber', contactEmail: 'lisa@kreativweber.de' },
    { ownerId, customerId: c3.id, projectId: p3.id, title: 'BioShop – Phase 3 Kick-off',
      description: 'Anforderungen Phase 3: Frontend & Checkout.', startTime: daysFromNow(3), endTime: new Date(daysFromNow(3).getTime() + hoursMs(2)), contactName: 'Stefan Braun', contactEmail: 's.braun@bioshop.de', contactPhone: '+49 89 1234567', meetingLink: 'https://teams.microsoft.com/l/meetup-join/demo' },
    { ownerId, customerId: c5.id, projectId: p5.id, title: 'Kick-off Immobilien-Portal Richter',
      description: 'Erstgespräch & Anforderungsaufnahme neues Portal.', startTime: daysFromNow(7), endTime: new Date(daysFromNow(7).getTime() + hoursMs(2.5)), contactName: 'Hans Richter', contactEmail: 'h.richter@richter-immo.de' },
    { ownerId, customerId: c1.id, title: 'TechVision – Intranet-Vorbesprechung',
      description: 'Vorstellung Angebot AN-2026-004.', startTime: daysFromNow(10), endTime: new Date(daysFromNow(10).getTime() + hoursMs(1.5)), contactName: 'Thomas Bauer', contactEmail: 'tbauer@techvision.de', meetingLink: 'https://zoom.us/j/demo123' },
    { ownerId, customerId: c4.id, projectId: p4.id, title: 'StartupLab – Reaktivierung',
      description: 'Klärung ob Projekt nach Finanzierungsrunde fortgesetzt wird.', startTime: daysFromNow(14), endTime: new Date(daysFromNow(14).getTime() + hoursMs(1)), contactName: 'Jana Koch', contactEmail: 'jana@startuplab.de' },
    { ownerId, title: 'Steuerberater – Q1 2026',
      description: 'Buchhaltung Q1 2026, Steuervorauszahlungen.', startTime: daysFromNow(21), endTime: new Date(daysFromNow(21).getTime() + hoursMs(1.5)), contactName: 'Dr. Klaus Müller', contactEmail: 'kanzlei@steuerberater-mueller.de' },
  ];
  for (const a of appts) await prisma.appointment.create({ data: a });
  console.log(`✅ ${appts.length} Termine`);

  // ── Draft invoice for StartupLab ─────────────────────────────────────────────
  await prisma.invoice.create({ data: {
    ownerId, customerId: c4.id, projectId: p4.id, bankAccountId: bank.id,
    invoiceNumber: 'RE-2026-003',
    amount: 1600, description: 'Landing Page StartupLab – Konzept & Design\n20 Std × 80,00 €',
    status: 'DRAFT', totalPaid: 0,
    issueDate: daysAgo(10), dueDate: daysFromNow(20),
  }});
  console.log('✅ 1 Entwurfsrechnung StartupLab');

  // ── Summary ───────────────────────────────────────────────────────────────────
  const totalInvoices = 6 + 4 + 2 + 1; // p1(6) + p2(4) + p3(2) + p4(1)
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  🎉  Demo-Daten erfolgreich erstellt!');
  console.log('───────────────────────────────────────────────────────────');
  console.log('  👤  Max Müller  |  demo@freelancer.com  |  Ziel: 85 €/Std');
  console.log('  🏦  2 Bankkonten  |  👥 5 Kunden  |  📁 6 Projekte');
  console.log(`  📄  ${totalInvoices} Rechnungen  |  💬 6 Angebote  |  📅 8 Termine`);
  console.log(`  ⏱   ${allEntries.length} Zeiteinträge  |  💰 18 Ausgaben (10+8 Abos)`);
  console.log('───────────────────────────────────────────────────────────');
  console.log('  Profit-Analysen (6 Monate Verlauf):');
  console.log('  🟢  TechVision   –  90 €/Std  |  6× grüne Balken (90€/Monat)');
  console.log('  🟡  Kreativ Weber – 69 €/Std  |  Mix GREEN/AMBER + Unbilled-Warnung');
  console.log('  🔴  BioShop      –  33 €/Std  |  2 niedrige + 4 Null-Balken');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main()
  .catch((err) => { console.error('❌ Fehler:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
