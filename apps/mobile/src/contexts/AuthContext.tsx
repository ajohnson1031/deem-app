import { API_BASE_URL } from '@env';
import React, { createContext, useContext, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

import { useWallet } from '~/hooks';
import { AuthContextType, UserData } from '~/types';
import {
  deleteRefreshToken,
  deleteToken,
  deleteUser, // <-- add these
  emitter,
  getRefreshToken,
  getToken,
  getUser,
  saveRefreshToken,
  saveToken,
  saveUser,
} from '~/utils';
import { api } from '~/utils/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { loadWallet } = useWallet();

  const setAuthHeader = (token: string | null) => {
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete api.defaults.headers.common['Authorization'];
  };

  const loadWalletOnInit = async (token: string) => {
    try {
      setAuthHeader(token);
      await loadWallet();
    } catch (err) {
      console.warn('⚠️ Wallet failed to load during auth restore:', err);
    }
  };

  // Refresh access token using refresh token
  const refreshSession = async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token found');
      // Your backend should accept POST with { refreshToken }
      const res = await api.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
      const { token: newToken, refreshToken: newRefresh, user: refreshedUser } = res.data;
      setToken(newToken);
      setAuthHeader(newToken);
      await saveToken(newToken);

      // If you rotate refreshToken
      if (newRefresh) await saveRefreshToken(newRefresh);

      if (refreshedUser) {
        setUser(refreshedUser);
        await saveUser(refreshedUser);
      }
      return true;
    } catch (err) {
      await deleteToken();
      await deleteRefreshToken();
      await deleteUser();
      setToken(null);
      setUser(null);
      setAuthHeader(null);
      console.log('🔒 Session refresh failed:', err);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const localToken = await getToken();
        const localUser = await getUser();
        const localRefresh = await getRefreshToken();

        if (localToken && localUser) {
          setToken(localToken);
          setUser(localUser);
          setAuthHeader(localToken);
          await loadWalletOnInit(localToken);
        } else if (localRefresh) {
          // Try to refresh with refreshToken
          const res = await api.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: localRefresh,
          });
          const { token: newToken, refreshToken: newRefresh, user: refreshedUser } = res.data;
          setToken(newToken);
          setUser(refreshedUser);
          setAuthHeader(newToken);
          await saveToken(newToken);
          if (newRefresh) await saveRefreshToken(newRefresh);
          await saveUser(refreshedUser);
          await loadWalletOnInit(newToken);
        }
      } catch (err) {
        console.log('🔒 Session not restored:', err);
        await deleteToken();
        await deleteRefreshToken();
        await deleteUser();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      logout();
      Toast.show({
        type: 'error',
        text1: 'Session expired',
        text2: 'Please log in again.',
      });
    };

    emitter.on('logout', handleLogout);
    return () => emitter.off('logout', handleLogout);
  }, []);

  // ======== LOGIN
  const login = async (identifier: string, password: string) => {
    try {
      const res = await api.post(`${API_BASE_URL}/auth/login`, { identifier, password });
      const { token: accessToken, refreshToken, user, requires2FA, tempUserId } = res.data;

      if (requires2FA) {
        return { success: false, requires2FA: true, tempUserId };
      }

      setToken(accessToken);
      setUser(user);
      setAuthHeader(accessToken);
      await saveToken(accessToken);
      await saveUser(user);
      await saveRefreshToken(refreshToken);
      await loadWallet(password);

      return { success: true };
    } catch (err) {
      throw err;
    }
  };

  // ======== LOGOUT
  const logout = async () => {
    try {
      await api.post(`${API_BASE_URL}/auth/logout`);
    } catch (err) {
      console.warn('Logout request failed:', err);
    } finally {
      setToken(null);
      setUser(null);
      setAuthHeader(null);
      await deleteToken();
      await deleteUser();
      await deleteRefreshToken();

      setTimeout(() => {
        Toast.show({
          type: 'info',
          text1: 'Session Ended',
          text2: "You've been securely logged out.",
        });
      }, 750);
    }
  };

  // ======== 2FA VERIFY
  const verify2FA = async (tempUserId: string, token: string, password: string) => {
    try {
      const res = await api.post(`${API_BASE_URL}/auth/2fa/verify`, {
        userId: tempUserId,
        token,
      });

      const { user, accessToken, refreshToken } = res.data;

      setToken(accessToken);
      setUser(user);
      setAuthHeader(accessToken);
      await saveToken(accessToken);
      await saveUser(user);
      if (refreshToken) await saveRefreshToken(refreshToken); // some flows rotate
      await loadWallet(password);

      return { success: true };
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        isLoading,
        token,
        verify2FA,
        setToken,
        setAuthHeader,
        refreshSession,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
