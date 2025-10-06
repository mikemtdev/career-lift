import useSWR from 'swr';
import { apiClient } from '@/lib/api';
import { CV } from '@/types';

const fetcher = (url: string) => apiClient.fetch(url);

export const useCvs = () => {
  const { data, error, mutate } = useSWR<{ cvs: CV[] }>('/cv', fetcher);

  return {
    cvs: data?.cvs || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
};
