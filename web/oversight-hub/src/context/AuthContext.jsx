import logger from '@/lib/logger';
/**
 * AuthContext - Global authentication state
 * Syncs with Zustand store to keep auth state consistent across entire app
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  logout as authLogout,
  getStoredUser,
  handleOAuthCallbackNew,
  validateAndGetCurrentUser,
} from '../services/authService';
import useStore from '../store/useStore';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get Zustand store functions
  const setStoreUser = useStore((state) => state.setUser);
  const setStoreIsAuthenticated = useStore((state) => state.setIsAuthenticated);
  const setStoreAuthInitialized = useStore((state) => state.setAuthInitialized);
  const storeLogout = useStore((state) => state.logout);

  // Initialize auth state ONCE on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        logger.log(
          '🔐 [AuthContext] Starting authentication initialization...'
        );
        const startTime = Date.now();

        setStoreAuthInitialized(false);

        // Optimistically clear stale Zustand-persisted auth state so ProtectedRoute
        // doesn't render protected pages using a cached isAuthenticated=true before
        // the async session check completes.
        setStoreIsAuthenticated(false);
        setIsAuthenticated(false);

        // Validate active cookie-based session first.
        const currentUser = await validateAndGetCurrentUser();
        if (currentUser) {
          setStoreUser(currentUser);
          setStoreIsAuthenticated(true);
          setIsAuthenticated(true);
          setUser(currentUser);
          setError(null);
          setLoading(false);
          setStoreAuthInitialized(true);
          const elapsed = Date.now() - startTime;
          logger.log(`✅ [AuthContext] Session restored (${elapsed}ms)`);
          return;
        }

        // Fall back to cached user profile for UI continuity when session lookup fails.
        const storedUser = getStoredUser();
        if (storedUser) {
          setStoreUser(storedUser);
          setStoreIsAuthenticated(false);
          setIsAuthenticated(false);
          setUser(storedUser);
        } else {
          setStoreIsAuthenticated(false);
          setIsAuthenticated(false);
          setUser(null);
        }
        setError(null);
        setLoading(false);
        setStoreAuthInitialized(true);
        const elapsed = Date.now() - startTime;
        logger.log(`✅ [AuthContext] Initialization complete (${elapsed}ms)`);
      } catch (err) {
        logger.error('❌ [AuthContext] Initialization error:', err);
        setError(err.message);
        setStoreIsAuthenticated(false);
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        setStoreAuthInitialized(true);
      }
    };

    initializeAuth();
  }, [setStoreUser, setStoreIsAuthenticated, setStoreAuthInitialized]);

  // Logout handler - sync with both AuthContext and Zustand
  const logout = useCallback(async () => {
    try {
      logger.log('🚪 [AuthContext] Logging out...');
      await authLogout();
      setUser(null);
      setIsAuthenticated(false);
      storeLogout(); // Clear Zustand store
      logger.log('✅ [AuthContext] Logout complete');
    } catch (err) {
      logger.error('❌ [AuthContext] Logout error:', err);
      setError(err.message);
    }
  }, [storeLogout]);

  // Set user after login - sync with both context and Zustand
  const setAuthUser = useCallback(
    (userData) => {
      logger.log('👤 [AuthContext] Setting user:', userData?.login);
      setUser(userData);
      setStoreUser(userData);
      setStoreIsAuthenticated(!!userData);
      setIsAuthenticated(!!userData);
    },
    [setStoreUser, setStoreIsAuthenticated]
  );

  // OAuth callback handler
  const handleOAuthCallback = useCallback(
    async (provider, code, state) => {
      try {
        logger.log(`🔐 [AuthContext] Processing ${provider} OAuth callback...`);
        setLoading(true);
        const result = await handleOAuthCallbackNew(provider, code, state);

        if (result.user) {
          logger.log(`✅ [AuthContext] OAuth login successful for ${provider}`);
          setAuthUser(result.user);
          setError(null);
          return result.user;
        } else {
          throw new Error(`No user data returned from ${provider} OAuth`);
        }
      } catch (err) {
        logger.error('❌ [AuthContext] OAuth callback error:', err);
        setError(err.message);
        setLoading(false);
        throw err;
      }
    },
    [setAuthUser]
  );

  // Validate current user token
  const validateCurrentUser = useCallback(async () => {
    try {
      logger.log('🔐 [AuthContext] Validating current user...');
      const user = await validateAndGetCurrentUser();
      if (user) {
        setAuthUser(user);
        setError(null);
        return user;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        storeLogout();
        return null;
      }
    } catch (err) {
      logger.error('❌ [AuthContext] Validation error:', err);
      setError(err.message);
      return null;
    }
  }, [setAuthUser, storeLogout]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    logout,
    setAuthUser,
    handleOAuthCallback,
    validateCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
