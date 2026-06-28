import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactElement,
  ReactNode
} from 'react';
import { IUser } from '../types/Index';
import { adaptUserFromApi } from '../adapters/UserAdapter';
import {
  apiPost,
  getStoredToken,
  setStoredToken
} from '../utils/ApiClient';

const USER_STORAGE_KEY = 'quiniela2026.user';

const restoreUser = (): IUser | null => {
  try {
    const raw: string | null = localStorage.getItem(USER_STORAGE_KEY);
    if (raw === null) return null;
    return adaptUserFromApi(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
};

interface IAuthResponse {
  token: string;
  user: unknown;
}

interface IAuthContextValue {
  user: IUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  logout: () => void;
  setSession: (token: string, user: IUser) => void;
}

const AuthContext = createContext<IAuthContextValue | null>(null);

interface IAuthProviderProps {
  children: ReactNode;
  initialUser?: IUser | null;
}

export const AuthProvider = ({
  children,
  initialUser
}: IAuthProviderProps): ReactElement => {
  const [user, setUser] = useState<IUser | null>(initialUser ?? restoreUser());
  const [token, setToken] = useState<string | null>(getStoredToken());

  const setSession = useCallback((nextToken: string, nextUser: IUser): void => {
    setStoredToken(nextToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<void> => {
      const response: IAuthResponse = await apiPost<IAuthResponse>(
        '/api/auth/login',
        { username, password }
      );
      const adaptedUser: IUser = adaptUserFromApi(response.user);
      setSession(response.token, adaptedUser);
    },
    [setSession]
  );

  const register = useCallback(
    async (
      username: string,
      password: string,
      displayName: string
    ): Promise<void> => {
      const response: IAuthResponse = await apiPost<IAuthResponse>(
        '/api/auth/register',
        { username, password, displayName }
      );
      const adaptedUser: IUser = adaptUserFromApi(response.user);
      setSession(response.token, adaptedUser);
    },
    [setSession]
  );

  const logout = useCallback((): void => {
    setStoredToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value: IAuthContextValue = useMemo(
    (): IAuthContextValue => ({
      user,
      token,
      login,
      register,
      logout,
      setSession
    }),
    [user, token, login, register, logout, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): IAuthContextValue => {
  const ctx: IAuthContextValue | null = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
