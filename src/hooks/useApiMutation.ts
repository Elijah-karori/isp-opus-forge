import { useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from '@/hooks/use-toast';

interface ApiMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, AxiosError, TVariables, unknown>, 'mutationFn' | 'onSuccess'> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateKeys?: string[][];
  successMessage?: string;
  onSuccess?: (data: TData, variables: TVariables) => void;
}

export function useApiMutation<TData = unknown, TVariables = void>(
  options: ApiMutationOptions<TData, TVariables>
): UseMutationResult<TData, AxiosError, TVariables> {
  const queryClient = useQueryClient();

  return useMutation<TData, AxiosError, TVariables, unknown>({
    ...options,
    mutationFn: options.mutationFn,
    onSuccess: async (data, variables) => {
      // Show success toast
      if (options.successMessage) {
        toast({
          title: 'Success',
          description: options.successMessage,
        });
      }

      // Invalidate queries
      if (options.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          await queryClient.invalidateQueries({ queryKey: key });
        }
      }

      // Call custom onSuccess
      if (options.onSuccess) {
        options.onSuccess(data, variables);
      }
    },
  });
}
