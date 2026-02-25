export enum UserRole {
  USER = 'USER',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum SubscriptionPlan {
  FREE_TRIAL = 'FREE_TRIAL',
  PRO = 'PRO',
}

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
  trialEndsAt?: string;
  targetHourlyRate?: number | null;
  isKleinunternehmer?: boolean;
  stripeConnectAccountId?: string;
  stripeConnectEnabled?: boolean;
  hasPassword?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Customer {
  id: string;
  ownerId: string;
  name: string;
  company?: string;
  email: string;
  defaultPaymentTerms: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    invoices: number;
  };
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum RecurringInterval {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export interface Invoice {
  id: string;
  ownerId: string;
  customerId: string;
  projectId?: string;
  invoiceNumber?: string;
  amount: number;
  description: string;
  status: InvoiceStatus;
  totalPaid: number;
  issueDate: string;
  dueDate: string;
  publicToken?: string;
  dunningLevel: number;
  lastDunningDate?: string;
  isRecurring: boolean;
  recurringInterval?: RecurringInterval;
  recurringStartDate?: string;
  recurringEndDate?: string;
  nextInvoiceDate?: string;
  parentInvoiceId?: string;
  onlinePaymentEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    company?: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
  payments?: Payment[];
  _count?: {
    payments: number;
  };
}

export interface Payment {
  id: string;
  ownerId: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  invoice?: Invoice;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    total?: number;
    page?: number;
    perPage?: number;
    totalPages?: number;
  };
}

// ========================================
// QUOTES / ANGEBOTE
// ========================================
export enum QuoteStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CONVERTED = 'CONVERTED',
}

export interface Quote {
  id: string;
  ownerId: string;
  customerId: string;
  projectId?: string;
  quoteNumber?: string;
  amount: number;
  description: string;
  status: QuoteStatus;
  issueDate: string;
  validUntil: string;
  notes?: string;
  convertedToInvoiceId?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    company?: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

// ========================================
// EXPENSES / AUSGABEN
// ========================================
export enum ExpenseCategory {
  SOFTWARE = 'SOFTWARE',
  HARDWARE = 'HARDWARE',
  TRAVEL = 'TRAVEL',
  MARKETING = 'MARKETING',
  OFFICE = 'OFFICE',
  TRAINING = 'TRAINING',
  OTHER = 'OTHER',
}

export interface Expense {
  id: string;
  ownerId: string;
  projectId?: string | null;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
  receiptUrl?: string;
  notes?: string;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  recurringStartDate?: string;
  recurringEndDate?: string;
  nextExpenseDate?: string;
  parentExpenseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  byCategory: Record<string, number>;
  monthlyData: {
    month: number;
    monthName: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
}

// ========================================
// TAX ASSISTANT
// ========================================
export interface TaxAssistantResult {
  year: number;
  disclaimer: string;
  revenue: {
    gross: number;
    net: number;
    vat: number;
  };
  expenses: {
    total: number;
  };
  profit: {
    gross: number;
    net: number;
    taxable: number;
  };
  taxes: {
    incomeTax: number;
    solidaritySurcharge: number;
    vatCollected: number;
    total: number;
    effectiveRate: number;
  };
  prepayments: {
    quarterlyVat: number;
    quarterlyIncomeTax: number;
  };
  recommendations: {
    monthlySavings: number;
    setAsidePercentage: number;
    conservative: number;
    realistic: number;
    optimistic: number;
  };
  invoiceCount: number;
  expenseCount: number;
  monthsElapsed: number;
}

// ========================================
// ONBOARDING
// ========================================
export enum FreelancerVertical {
  DESIGNER = 'DESIGNER',
  DEVELOPER = 'DEVELOPER',
  CONSULTANT = 'CONSULTANT',
  MARKETING_CONTENT = 'MARKETING_CONTENT',
  PHOTOGRAPHER_VIDEOGRAPHER = 'PHOTOGRAPHER_VIDEOGRAPHER',
  OTHER = 'OTHER',
}

export enum CurrentWorkflow {
  EXCEL_SHEETS = 'EXCEL_SHEETS',
  WORD_DOCUMENTS = 'WORD_DOCUMENTS',
  OTHER_SOFTWARE = 'OTHER_SOFTWARE',
  UNORGANIZED = 'UNORGANIZED',
}

export enum BusinessStage {
  JUST_STARTED = 'JUST_STARTED',
  GROWING = 'GROWING',
  ESTABLISHED = 'ESTABLISHED',
  SIDE_BUSINESS = 'SIDE_BUSINESS',
}

export enum AcquisitionChannel {
  LINKEDIN = 'LINKEDIN',
  REDDIT = 'REDDIT',
  FACEBOOK_GROUP = 'FACEBOOK_GROUP',
  REFERRAL = 'REFERRAL',
  GOOGLE_SEARCH = 'GOOGLE_SEARCH',
  OTHER = 'OTHER',
}

export interface OnboardingProfile {
  id: string;
  userId: string;
  vertical?: FreelancerVertical;
  currentWorkflow?: CurrentWorkflow;
  businessStage?: BusinessStage;
  acquisitionChannel?: AcquisitionChannel;
  acquisitionChannelOther?: string;
  onboardingCompleted: boolean;
  currentStep: number;
  completedAt?: string;
  additionalData?: any;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// PROJECTS
// ========================================
export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Project {
  id: string;
  ownerId: string;
  customerId?: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  budget?: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    company?: string;
    email: string;
  };
  invoices?: {
    id: string;
    invoiceNumber?: string;
    amount: number;
    totalPaid?: number;
    status: InvoiceStatus;
    issueDate: string;
    dueDate: string;
  }[];
  quotes?: {
    id: string;
    quoteNumber?: string;
    amount: number;
    status: QuoteStatus;
    issueDate: string;
    validUntil: string;
    description: string;
  }[];
  appointments?: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    contactName?: string;
    meetingLink?: string;
  }[];
  stats?: {
    totalSeconds: number;
    totalHours: number;
    totalInvoiced: number;
    totalPaid: number;
    effectiveHourlyRate: number | null;
    billedHourlyRate: number | null;
    budgetUsedPct: number | null;
  };
  _count?: {
    invoices: number;
    quotes?: number;
    timeEntries?: number;
    appointments?: number;
  };
}

// ========================================
// TIME TRACKING
// ========================================
export interface TimeEntry {
  id: string;
  ownerId: string;
  projectId?: string;
  description?: string;
  duration: number; // In Sekunden
  pauseDuration: number; // In Sekunden
  startTime: string;
  endTime?: string;
  isActive: boolean;
  pauseStartedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: Project;
}

// ========================================
// PROJECT PROFITABILITY
// ========================================
export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED';

export interface ProjectProfitability {
  targetHourlyRate: number;
  effectiveTaxRate: number; // as percentage, e.g. 27
  totalRevenue: number;
  totalPaid: number;
  totalHours: number;
  billableHours: number;
  unbilledHours: number;
  projectExpenses: number;
  estimatedTax: number;
  hourlyRateReal: number;
  profitabilityScore: number;
  riskLevel: RiskLevel;
}

export interface ProjectProfitabilityHistoryItem {
  year: number;
  month: number;
  label: string;
  revenue: number;
  hours: number;
  hourlyRate: number;
}

// ========================================
// APPOINTMENTS
// ========================================
export interface Appointment {
  id: string;
  ownerId: string;
  customerId?: string;
  projectId?: string;

  title: string;
  description?: string;
  startTime: string;
  endTime: string;

  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;

  meetingLink?: string;
  meetingId?: string;

  createdAt: string;
  updatedAt: string;

  customer?: {
    id: string;
    name: string;
    company?: string;
  };
  project?: {
    id: string;
    name: string;
  };
}
