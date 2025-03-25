import { api } from '@/lib/api-client';
import { Login, CustomUser } from '@/types/api';

interface LoginResponse {
  jwt: {
    access: string;
    refresh: string;
    user: CustomUser;
  };
}

export async function login(credentials: Login): Promise<LoginResponse> {
  const response = await api.post('/auth/login', credentials);
  return response as LoginResponse;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function verifyToken(token: string): Promise<void> {
  await api.post('/auth/verify', { token });
}

export async function getCurrentUser(): Promise<CustomUser> {
  const response = await api.get('/auth/me');
  return response as CustomUser;
}