import apiClient from './client';
import { Task, PaginatedResponse, TaskFilters } from '../types';

export const tasksApi = {
  getAll: async (filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> => {
    const params = new URLSearchParams();
    if (filters.status)       params.set('status',       filters.status);
    if (filters.assignedToId) params.set('assignedToId', filters.assignedToId);
    if (filters.search)       params.set('search',       filters.search);
    if (filters.page)         params.set('page',         String(filters.page));
    if (filters.limit)        params.set('limit',        String(filters.limit));

    const { data } = await apiClient.get<PaginatedResponse<Task>>(`/tasks?${params}`);
    return data;
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await apiClient.get<Task>(`/tasks/${id}`);
    return data;
  },

  create: async (payload: Partial<Task> & { title: string }): Promise<Task> => {
    const { data } = await apiClient.post<Task>('/tasks', payload);
    return data;
  },

  update: async (id: string, payload: Partial<Task>): Promise<Task> => {
    const { data } = await apiClient.put<Task>(`/tasks/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
