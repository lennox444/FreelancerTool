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
