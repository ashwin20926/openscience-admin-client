// AuthContext.js
import{ createContext, useContext } from 'react';
import useAuth from './useAuth';

interface AuthContextType {
  user: any;
  loading: boolean;
  error: any;
  login: (email: any, password: any, rememberMe: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUserData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
