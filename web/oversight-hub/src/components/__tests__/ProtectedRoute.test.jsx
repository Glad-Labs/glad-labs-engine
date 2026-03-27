import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock useAuth so we can control auth state per test
const mockUseAuth = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  default: () => mockUseAuth(),
}));

import ProtectedRoute from '../ProtectedRoute';

const renderWithRouter = (ui, { initialEntries = ['/'] } = {}) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('shows loading indicator while auth is resolving', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        isAuthenticated: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('unauthenticated state', () => {
    it('redirects to /login when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isAuthenticated: false,
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('authenticated state', () => {
    it('renders children when user is authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'editor' },
        loading: false,
        isAuthenticated: true,
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('renders children when requiredRole matches user role', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'admin' },
        loading: false,
        isAuthenticated: true,
      });

      renderWithRouter(
        <ProtectedRoute requiredRole="admin">
          <div>Admin Area</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Admin Area')).toBeInTheDocument();
    });

    it('shows access denied when requiredRole does not match user role', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'viewer' },
        loading: false,
        isAuthenticated: true,
      });

      renderWithRouter(
        <ProtectedRoute requiredRole="admin">
          <div>Admin Only</div>
        </ProtectedRoute>
      );

      expect(screen.getByText(/Access Denied/i)).toBeInTheDocument();
      expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
    });

    it('renders children when no requiredRole is specified', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'viewer' },
        loading: false,
        isAuthenticated: true,
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>Any Authenticated User</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Any Authenticated User')).toBeInTheDocument();
    });
  });

  describe('access denied', () => {
    it('shows Insufficient Permissions in access denied message', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'editor' },
        loading: false,
        isAuthenticated: true,
      });

      renderWithRouter(
        <ProtectedRoute requiredRole="admin">
          <div>Admin Only</div>
        </ProtectedRoute>
      );

      expect(screen.getByText(/Insufficient Permissions/i)).toBeInTheDocument();
    });

    it('grants access when user role matches editor requiredRole', () => {
      mockUseAuth.mockReturnValue({
        user: { role: 'editor' },
        loading: false,
        isAuthenticated: true,
      });

      renderWithRouter(
        <ProtectedRoute requiredRole="editor">
          <div>Editor Area</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Editor Area')).toBeInTheDocument();
    });
  });
});
