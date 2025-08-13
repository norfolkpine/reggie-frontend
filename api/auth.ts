import { api } from '@/lib/api-client';
import { Login, User, Register, JWT, PatchedUser, LoginResponse } from '@/types/api';



export const Client = Object.freeze({
  APP: 'app',
  BROWSER: 'browser'
})

export const settings = {
  client: Client.BROWSER,
  baseUrl: `/_allauth/${Client.BROWSER}/v1`,
  withCredentials: false
}

export async function login(credentials: Login): Promise<LoginResponse> {
  const response = await api.post(`${settings.baseUrl}/auth/login`, credentials);
  return response as LoginResponse;
}

export async function register(credentials: Register): Promise<User> {
  const response = await api.post(`${settings.baseUrl}/auth/signup`, credentials);
  return response as User;
}

export async function logout(): Promise<void> {
  await api.delete(`${settings.baseUrl}/auth/session`);
}

export async function verifySession(): Promise<LoginResponse> {
  const response = await api.get(`${settings.baseUrl}/auth/session`);
  return response as LoginResponse;
}

export async function getCurrentUser(): Promise<LoginResponse> {
  const response = await api.get(`${settings.baseUrl}/account/authenticators`);

  return response as LoginResponse;
}

export async function updateUser(userData: PatchedUser): Promise<User> {
  const response = await api.patch('/api/auth/user/', userData);
  return response as User;
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post(`${settings.baseUrl}/auth/password/request`, { email });
}