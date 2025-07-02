import { API_BASE_URL } from '@env';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

import { deleteToken, deleteUser, emitter, getToken, getUser, saveToken, saveUser } from '~/utils';

type User = {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
};

type AuthContextType = {
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  token: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAuthHeader = (token: string | null) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
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
        } else {
          // Try refreshing from server as fallback
          const res = await axios.get(`${API_BASE_URL}/auth/refresh`, {
            withCredentials: true,
          });
          const { token: newToken } = res.data;
          const me = await axios.get(`${API_BASE_URL}/me`);

          setToken(newToken);
          setUser(me.data.user);
          setAuthHeader(newToken);

          await saveToken(newToken);
          await saveUser(me.data.user);
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

    return () => {
      emitter.off('logout', handleLogout);
    };
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { identifier, password },
        { withCredentials: true }
      );

      const { token: accessToken, user } = res.data;
      setToken(accessToken);
      setUser(user);
      setAuthHeader(accessToken);

      await saveToken(accessToken);
      await saveUser(user);
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
      Toast.show({ type: 'info', text1: 'Logged out' });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
