import { API_BASE_URL } from '@env';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

import { useWallet } from '~/hooks'; // make sure this hook is working and imported
import { AuthContextType, UserData } from '~/types';
import { deleteToken, deleteUser, emitter, getToken, getUser, saveToken, saveUser } from '~/utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { loadWallet } = useWallet(); // ⬅️ brings in the wallet loader

  const setAuthHeader = (token: string | null) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const loadWalletOnInit = async (token: string) => {
    try {
      setAuthHeader(token);
      await loadWallet(); // assumes passwordless wallet load (via SecureStore)
    } catch (err) {
      console.warn('⚠️ Wallet failed to load during auth restore:', err);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const localToken = await getToken();
        const localUser = await getUser();

        if (localToken && localUser) {
          setToken(localToken);
          setUser(localUser);
          setAuthHeader(localToken);
          await loadWalletOnInit(localToken);
        } else {
          // Try refreshing from server as fallback
          const res = await axios.get(`${API_BASE_URL}/auth/refresh`, {
            withCredentials: true,
          });
          const { token: newToken } = res.data;
          setAuthHeader(newToken);

          const me = await axios.get(`${API_BASE_URL}/me`);
          setToken(newToken);
          setUser(me.data.user);

          await saveToken(newToken);
          await saveUser(me.data.user);
          await loadWalletOnInit(newToken);
        }
      } catch (err) {
        console.log('🔒 Session not restored:', err);
        await deleteToken();
        await deleteUser();
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

  const login = async (identifier: string, password: string) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { identifier, password },
        { withCredentials: true }
      );

      const { token: accessToken, user, requires2FA, tempUserId } = res.data;

      if (requires2FA) {
        // 2FA required; stop here and let UI handle modal
        return { success: false, requires2FA: true, tempUserId };
      }

      // Normal flow
      setToken(accessToken);
      setUser(user);
      setAuthHeader(accessToken);

      await saveToken(accessToken);
      await saveUser(user);
      await loadWallet(password);

      return { success: true };
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.warn('Logout request failed:', err);
    } finally {
      setToken(null);
      setUser(null);
      setAuthHeader(null);
      await deleteToken();
      await deleteUser();

      setTimeout(() => {
        Toast.show({
          type: 'info',
          text1: 'Session Ended',
          text2: "You've been securely logged out.",
        });
      }, 750);
    }
  };

  const verify2FA = async (tempUserId: string, token: string, password: string) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/2fa/verify`, {
        userId: tempUserId,
        token,
      });

      const { user, accessToken } = res.data;

      setToken(accessToken);
      setUser(user);
      setAuthHeader(accessToken);

      await saveToken(accessToken);
      await saveUser(user);
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
