import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';

interface ApiQueryOptions<TData> extends Omit<UseQueryOptions<TData, AxiosError>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  queryFn: () => Promise<TData>;
}

export function useApiQuery<TData = unknown>(
  options: ApiQueryOptions<TData>
): UseQueryResult<TData, AxiosError> {
  return useQuery<TData, AxiosError>({
    ...options,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 30000, // 30 seconds
  });
}
