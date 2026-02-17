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
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    company?: string;
    email: string;
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
  _count?: {
    invoices: number;
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
  createdAt: string;
  updatedAt: string;
  project?: Project;
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
