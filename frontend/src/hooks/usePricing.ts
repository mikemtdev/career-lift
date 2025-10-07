import useSWR from 'swr';
import { apiClient } from '@/lib/api';

export const usePricing = () => {
  const { data, error, mutate } = useSWR(
    '/cv/pricing',
    () => apiClient.getPricing()
  );

  return {
    pricing: data?.additionalCvPrice,
    isLoading: !error && !data,
    error,
    mutate,
  };
};
