import { apiFetch, setToken, clearToken } from './client';

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture: string | null;
}

export async function loginWithGoogle(idToken: string): Promise<AuthUser> {
  const tokenResponse = await apiFetch<TokenResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  });
  setToken(tokenResponse.access_token);
  return getMe();
}

export async function getMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/auth/me');
}

export function logout(): void {
  clearToken();
}
