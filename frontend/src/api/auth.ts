import apiClient from './client';
import { User } from '../types';

interface LoginResponse {
  token: string;
  user:  User;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    return data;
  },
};
