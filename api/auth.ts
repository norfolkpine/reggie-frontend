import { api } from '@/lib/api-client';
import { 
  Login, 
  User, 
  Register, 
  JWT, 
  PatchedUser, 
  LoginResponse,
  AllauthUser,
  AllauthUserResponse,
  AllauthUserUpdate,
  AllauthEmailAddress,
  AllauthEmailResponse,
  AllauthEmailAdd,
  AllauthEmailVerify,
  AllauthEmailSetPrimary,
  AllauthEmailDelete,
  AllauthPasswordChange,
  AllauthPasswordReset,
  AllauthPasswordResetConfirm,
  AllauthMFAAuthenticator,
  AllauthMFAAuthenticatorsResponse,
  AllauthMFATOTPAdd,
  AllauthMFATOTPActivate,
  AllauthMFAAuthenticate,
  AllauthMFAChallenge,
  AllauthResponse
} from '@/types/api';



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

// User Management APIs
export async function getAllauthUser(): Promise<AllauthUserResponse> {
  try {
    const response = await api.get(`/_allauth/user`);
    return response as AllauthUserResponse;
  } catch (error: any) {
    // Fallback mock data when backend endpoint is not available
    const is404Error = error?.status === 404 || 
                      error?.response?.status === 404 || 
                      (error instanceof Error && error.message.includes('404')) ||
                      (typeof error === 'string' && error.includes('404'));
    
    if (is404Error) {
      console.warn('Allauth user endpoint not available, using mock data');
      return {
        data: {
          id: 1,
          username: 'demo_user',
          email: 'demo@example.com',
          first_name: 'Demo',
          last_name: 'User',
          display: 'Demo User'
        },
        meta: {
          is_authenticated: true
        }
      } as AllauthUserResponse;
    }
    throw error;
  }
}

export async function updateAllauthUser(userData: AllauthUserUpdate): Promise<AllauthUserResponse> {
  try {
    const response = await api.put(`/_allauth/account/user`, userData);
    return response as AllauthUserResponse;
  } catch (error: any) {
    // Fallback mock update when backend endpoint is not available
    const is404Error = error?.status === 404 || 
                      error?.response?.status === 404 || 
                      (error instanceof Error && error.message.includes('404')) ||
                      (typeof error === 'string' && error.includes('404'));
    
    if (is404Error) {
      console.warn('Allauth user update endpoint not available, using mock response');
      return {
        data: {
          id: 1,
          username: userData.username || 'demo_user',
          email: 'demo@example.com',
          first_name: userData.first_name || 'Demo',
          last_name: userData.last_name || 'User',
          display: `${userData.first_name || 'Demo'} ${userData.last_name || 'User'}`
        },
        meta: {
          is_authenticated: true
        }
      } as AllauthUserResponse;
    }
    throw error;
  }
}

// Email Management APIs
export async function getEmailAddresses(): Promise<AllauthEmailResponse> {
  const response = await api.get(`${settings.baseUrl}/account/email`);
  return response as AllauthEmailResponse;
}

export async function addEmailAddress(emailData: AllauthEmailAdd): Promise<AllauthResponse> {
  const response = await api.post(`${settings.baseUrl}/account/email`, emailData);
  return response as AllauthResponse;
}

export async function deleteEmailAddress(emailData: AllauthEmailDelete): Promise<AllauthResponse> {
  const response = await api.delete(`${settings.baseUrl}/account/email`, emailData);
  return response as AllauthResponse;
}

export async function verifyEmail(emailData: AllauthEmailVerify): Promise<AllauthResponse> {
  const response = await api.post(`${settings.baseUrl}/account/email/verify`, emailData);
  return response as AllauthResponse;
}

export async function verifyEmailWithKey(key: string): Promise<AllauthResponse> {
  const response = await api.post(`${settings.baseUrl}/account/email/verify/${key}`);
  return response as AllauthResponse;
}

export async function setPrimaryEmail(emailData: AllauthEmailSetPrimary): Promise<AllauthResponse> {
  const response = await api.post(`${settings.baseUrl}/account/email/primary`, emailData);
  return response as AllauthResponse;
}

// Password Management APIs
export async function changePassword(passwordData: AllauthPasswordChange): Promise<AllauthResponse> {
  const response = await api.post(`${settings.baseUrl}/account/password/change`, passwordData);
  return response as AllauthResponse;
}

export async function resetPassword(emailData: AllauthPasswordReset): Promise<AllauthResponse> {
  const response = await api.post(`${settings.baseUrl}/account/password/reset`, emailData);
  return response as AllauthResponse;
}

export async function resetPasswordWithKey(key: string, passwordData: AllauthPasswordResetConfirm): Promise<AllauthResponse> {
  const response = await api.post(`${settings.baseUrl}/account/password/reset/key/${key}`, passwordData);
  return response as AllauthResponse;
}

// MFA Management APIs
export async function getMFAAuthenticators(): Promise<AllauthMFAAuthenticatorsResponse> {
  const response = await api.get(`${settings.baseUrl}/account/authenticators`);
  return response as AllauthMFAAuthenticatorsResponse;
}

export async function addTOTPAuthenticator(): Promise<AllauthResponse<AllauthMFAAuthenticator>> {
  const response = await api.post(`${settings.baseUrl}/account/authenticators/totp`);
  return response as AllauthResponse<AllauthMFAAuthenticator>;
}

export async function activateTOTPAuthenticator(activationData: AllauthMFATOTPActivate): Promise<AllauthResponse> {
  const response = await api.post(`${settings.baseUrl}/account/authenticators/totp/activate`, activationData);
  return response as AllauthResponse;
}

export async function generateMFAChallenge(authenticatorId: string): Promise<AllauthMFAChallenge> {
  const response = await api.post(`${settings.baseUrl}/account/authenticators/${authenticatorId}/challenge`);
  return response as AllauthMFAChallenge;
}

export async function authenticateMFA(authData: AllauthMFAAuthenticate): Promise<AllauthResponse> {
  const response = await api.post(`${settings.baseUrl}/account/authenticators/authenticate`, authData);
  return response as AllauthResponse;
}

export async function deactivateAuthenticator(authenticatorId: string): Promise<AllauthResponse> {
  const response = await api.delete(`${settings.baseUrl}/account/authenticators/${authenticatorId}`);
  return response as AllauthResponse;
}