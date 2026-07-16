import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = useCallback((email, password) => signInWithEmailAndPassword(auth, email, password), []);

  const register = useCallback((email, password) => createUserWithEmailAndPassword(auth, email, password), []);

  const resetPassword = useCallback((email) => sendPasswordResetEmail(auth, email), []);

  const logout = useCallback(() => signOut(auth), []);

  const value = useMemo(
    () => ({
      user,
      currentUser: user,
      loading,
      login,
      register,
      signup: register,
      resetPassword,
      logout,
    }),
    [loading, login, logout, register, resetPassword, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
