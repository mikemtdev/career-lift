import useSWR from 'swr';
import { apiClient } from '@/lib/api';
import { AdminStats, Pricing } from '@/types';

export const useAdminStats = () => {
  const { data, error, mutate } = useSWR(
    '/admin/stats',
    () => apiClient.getAdminStats()
  );

  return {
    stats: data?.stats as AdminStats | undefined,
    pricing: data?.pricing as Pricing | undefined,
    isLoading: !error && !data,
    error,
    mutate,
  };
};
