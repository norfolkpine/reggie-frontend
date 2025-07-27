import { api } from '@/lib/api-client';
import { Login, User, Register, JWT, PatchedUser } from '@/types/api';

interface LoginResponse {
  jwt: {
    access: string;
    refresh: string;
    user: User;
  };
  [key: string]: any;
}

export async function login(credentials: Login): Promise<LoginResponse> {
  const response = await api.post('/api/auth/login/', credentials);
  return response as LoginResponse;
}

export async function register(credentials: Register): Promise<User> {
  const response = await api.post('/api/auth/register/', credentials);
  return response as User;
}

export async function logout(): Promise<void> {
  await api.post('/api/auth/logout/');
}

export async function verifyToken(token: string): Promise<JWT> {
  const response = await api.post('/api/auth/token/verify/', { token });
  return response as JWT;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get('/api/auth/user/');
  return response as User;
}

export async function updateUser(userData: PatchedUser): Promise<User> {
  const response = await api.patch('/api/auth/user/', userData);
  return response as User;
}