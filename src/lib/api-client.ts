import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { toast } from '@/hooks/use-toast';

const baseURL = import.meta.env.VITE_API_BASE_URL?.endsWith("/api/v1")
  ? import.meta.env.VITE_API_BASE_URL
  : `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 30000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

export function handleApiError(error: AxiosError) {
  if (!error.response) {
    toast({
      title: 'Network Error',
      description: 'Unable to connect to server. Please check your internet connection.',
      variant: 'destructive',
    });
    return;
  }

  const status = error.response.status;
  const data: any = error.response.data;

  switch (status) {
    case 400:
      toast({
        title: 'Invalid Request',
        description: data?.detail || data?.message || 'Please check your input.',
        variant: 'destructive',
      });
      break;
    case 401:
      toast({
        title: 'Unauthorized',
        description: 'Please log in again.',
        variant: 'destructive',
      });
      localStorage.removeItem('token');
      window.location.href = '/login';
      break;
    case 403:
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to perform this action.',
        variant: 'destructive',
      });
      break;
    case 404:
      toast({
        title: 'Not Found',
        description: data?.detail || 'The requested resource was not found.',
        variant: 'destructive',
      });
      break;
    case 500:
      toast({
        title: 'Server Error',
        description: 'Something went wrong on our end. Please try again later.',
        variant: 'destructive',
      });
      break;
    default:
      toast({
        title: 'Error',
        description: data?.detail || data?.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
  }
}

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient(config);
  return response.data;
}

export default apiClient;
