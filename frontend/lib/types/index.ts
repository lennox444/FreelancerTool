export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
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
