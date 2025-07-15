import { UserData } from '~/types/user';

type LoginResponse = {
  success: boolean;
  requires2FA?: boolean;
  tempUserId?: string;
};

type AuthContextType = {
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
  login: (identifier: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  verify2FA: (tempUserId: string, token: string, password: string) => Promise<{ success: boolean }>;
  isLoading: boolean;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setAuthHeader: (token: string | null) => void;
};

export type { AuthContextType, LoginResponse };
