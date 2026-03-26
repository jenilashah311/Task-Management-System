import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn:  usersApi.getAll,
    staleTime: 5 * 60 * 1000, // user list changes rarely, no need to refetch constantly
  });
}
