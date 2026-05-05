import { useState, useEffect, useCallback } from 'react';
import { type AuthUser, getMe, loginWithGoogle, logout as apiLogout } from '../api/auth';
import { getToken } from '../api/client';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => void;
  signOut: () => void;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(!!getToken());

  // Try to restore session from existing token
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    getMe()
      .then(setUser)
      .catch(() => apiLogout())
      .finally(() => setLoading(false));
  }, []);

  // Initialize Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          setLoading(true);
          try {
            const authUser = await loginWithGoogle(response.credential);
            setUser(authUser);
          } catch (error) {
            console.error('Login failed:', error);
          } finally {
            setLoading(false);
          }
        },
      });
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  const handleSignIn = useCallback(() => {
    window.google?.accounts.id.prompt();
  }, []);

  const handleSignOut = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    signInWithGoogle: handleSignIn,
    signOut: handleSignOut,
  };
};
