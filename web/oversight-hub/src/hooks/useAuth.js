import logger from '@/lib/logger';
/**
 * useAuth Hook - Simple authentication interface using Zustand
 *
 * Provides a clean, context-free way to access auth state.
 * Wraps Zustand store to expose user, loading, error, and auth methods.
 *
 * Usage:
 * const { user, isAuthenticated, loading, error, logout } = useAuth();
 *
 * Benefits over AuthContext:
 * - No Provider dependency required
 * - Components can access auth state directly
 * - Single source of truth (Zustand store)
 * - Easier to test (can mock Zustand store)
 */

import { useCallback } from 'react';
import useStore from '../store/useStore';
import { logout as authServiceLogout } from '../services/authService';

export const useAuth = () => {
  // Get auth state from Zustand store
  const user = useStore((state) => state.user);
  const accessToken = useStore((state) => state.accessToken);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const authInitialized = useStore((state) => state.authInitialized);
  const setUser = useStore((state) => state.setUser);
  const storeLogout = useStore((state) => state.logout);
  const setIsAuthenticated = useStore((state) => state.setIsAuthenticated);
  const setAccessToken = useStore((state) => state.setAccessToken);
  const setAuthInitialized = useStore((state) => state.setAuthInitialized);

  // Route protection should wait until AuthContext has finished bootstrapping.
  const loading = !authInitialized;
  const error = null; // Error handling would go here if needed

  /**
   * Logout user - clear auth state from store and service
   */
  const logout = useCallback(async () => {
    try {
      // Clear from service (localStorage)
      await authServiceLogout();
    } catch (err) {
      logger.error('Logout error:', err);
    } finally {
      // Clear from store
      storeLogout();
    }
  }, [storeLogout]);

  /**
   * Update user data in store
   */
  const setAuthUser = useCallback(
    (userData) => {
      setUser(userData);
    },
    [setUser]
  );

  return {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    accessToken,

    // Actions
    logout,
    setUser: setAuthUser,
    setIsAuthenticated,
    setAccessToken,
    setAuthInitialized,
  };
};

export default useAuth;
