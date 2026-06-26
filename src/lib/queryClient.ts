import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dữ liệu được coi là "fresh" trong 5 phút
      staleTime: 5 * 60 * 1000,
      // Giữ cache 10 phút sau khi component unmount
      gcTime: 10 * 60 * 1000,
      // Chỉ retry 1 lần khi thất bại
      retry: 1,
      // Không refetch khi focus lại window (tránh gọi API quá nhiều)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
