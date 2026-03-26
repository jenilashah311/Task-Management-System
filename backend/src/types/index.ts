import { Request } from 'express';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type UserRole = 'ADMIN' | 'MEMBER';

// Extends Express's Request so controllers can access the authenticated user
// after the JWT middleware has verified and decoded the token.
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  assignedToId?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
