export type TaskStatus   = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW'  | 'MEDIUM'      | 'HIGH';
export type UserRole     = 'ADMIN' | 'MEMBER';

export interface User {
  id:        string;
  name:      string;
  email:     string;
  role:      UserRole;
  createdAt: string;
}

export interface Task {
  id:          string;
  title:       string;
  description?: string;
  status:      TaskStatus;
  priority:    TaskPriority;
  dueDate?:    string;
  createdAt:   string;
  updatedAt:   string;
  assignedTo?: Pick<User, 'id' | 'name' | 'email'> | null;
  createdBy:   Pick<User, 'id' | 'name' | 'email'>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
  };
}

export interface TaskFilters {
  status?:       TaskStatus | '';
  assignedToId?: string;
  search?:       string;
  page?:         number;
  limit?:        number;
}
