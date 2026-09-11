import { createContext, useCallback, useEffect, useState } from 'react';
import * as authService from '@/services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const session = authService.getStoredSession();
    if (session?.user) setUser(session.user);
    setIsInitializing(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const session = await authService.login(credentials);
    setUser(session.user);
    return session;
  }, []);

  const loginWithSocial = useCallback(async (payload) => {
    const session = await authService.loginWithSocial(payload);
    setUser(session.user);
    return session;
  }, []);

  /**
   * Creates a new account but does NOT sign the user in — per the "Create
   * Account" popup flow, control returns to the Login popup afterwards.
   */
  const registerAccount = useCallback(async (details) => {
    return authService.registerAccount(details);
  }, []);

  const logout = useCallback(() => {
    authService.clearSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    (patch) => {
      if (!user) return null;
      const updated = authService.updateUserProfile(user.id, patch);
      if (updated) setUser(updated);
      return updated;
    },
    [user]
  );

  const changePassword = useCallback(
    (payload) => {
      if (!user) throw new Error('Not signed in.');
      return authService.changePassword(user.id, payload);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isInitializing,
        login,
        loginWithSocial,
        registerAccount,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
