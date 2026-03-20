/**
 * AppRoutes.jsx tests
 *
 * Covers:
 * - Unauthenticated user visiting a protected route is redirected to /login
 * - Loading state shows "Loading..." during auth check
 * - Authenticated user visiting /login is redirected to /
 * - Each protected route renders its target component (smoke tests)
 * - Unknown path redirects to /
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AppRoutes from '../AppRoutes';

// ── mock useAuth ──────────────────────────────────────────────────────────────
const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({
  default: mockUseAuth,
}));

// ── stub all heavy page/component imports to avoid their API calls ────────────
vi.mock('../index', () => ({
  Settings: () => <div data-testid="settings-page">Settings</div>,
  TaskManagement: () => (
    <div data-testid="task-management-page">TaskManagement</div>
  ),
  CostMetricsDashboard: () => (
    <div data-testid="cost-metrics-page">CostMetrics</div>
  ),
}));

vi.mock('../../components/pages/ExecutiveDashboard', () => ({
  default: () => (
    <div data-testid="executive-dashboard">ExecutiveDashboard</div>
  ),
}));

vi.mock('../../components/pages/UnifiedServicesPanel', () => ({
  default: () => <div data-testid="unified-services">UnifiedServices</div>,
}));

vi.mock('../../pages/BlogWorkflowPage', () => ({
  default: () => <div data-testid="blog-workflow-page">BlogWorkflow</div>,
}));

vi.mock('../AIStudio', () => ({
  default: () => <div data-testid="ai-studio-page">AIStudio</div>,
}));

vi.mock('../Content', () => ({
  default: () => <div data-testid="content-page">Content</div>,
}));

vi.mock('../PerformanceDashboard', () => ({
  default: () => (
    <div data-testid="performance-dashboard-page">PerformanceDashboard</div>
  ),
}));

vi.mock('../../pages/Login', () => ({
  default: () => <div data-testid="login-page">Sign in with GitHub</div>,
}));

vi.mock('../../pages/AuthCallback', () => ({
  default: () => <div data-testid="auth-callback-page">AuthCallback</div>,
}));

vi.mock('../../components/tasks/ApprovalQueue', () => ({
  default: () => <div data-testid="approval-queue-page">ApprovalQueue</div>,
}));

vi.mock('../../components/LayoutWrapper', () => ({
  default: ({ children }) => <div data-testid="layout-wrapper">{children}</div>,
}));

vi.mock('../../components/ErrorBoundary', () => ({
  default: ({ children }) => <>{children}</>,
}));

// ── helpers ───────────────────────────────────────────────────────────────────
function renderAt(
  path,
  authState = { isAuthenticated: false, loading: false, user: null }
) {
  mockUseAuth.mockReturnValue(authState);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

const AUTHENTICATED = {
  isAuthenticated: true,
  loading: false,
  user: { role: 'admin' },
};
const UNAUTHENTICATED = { isAuthenticated: false, loading: false, user: null };
const LOADING = { isAuthenticated: false, loading: true, user: null };

// ── tests ─────────────────────────────────────────────────────────────────────
describe('AppRoutes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('authentication guard', () => {
    it('redirects unauthenticated user from /tasks to /login', () => {
      renderAt('/tasks', UNAUTHENTICATED);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('redirects unauthenticated user from / to /login', () => {
      renderAt('/', UNAUTHENTICATED);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('shows loading indicator while auth state is loading', () => {
      renderAt('/tasks', LOADING);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('public routes', () => {
    it('renders Login page at /login', () => {
      renderAt('/login', UNAUTHENTICATED);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('renders AuthCallback at /auth/callback', () => {
      renderAt('/auth/callback', UNAUTHENTICATED);
      expect(screen.getByTestId('auth-callback-page')).toBeInTheDocument();
    });
  });

  describe('protected routes (authenticated)', () => {
    it('renders ExecutiveDashboard at /', () => {
      renderAt('/', AUTHENTICATED);
      expect(screen.getByTestId('executive-dashboard')).toBeInTheDocument();
    });

    it('renders TaskManagement at /tasks', () => {
      renderAt('/tasks', AUTHENTICATED);
      expect(screen.getByTestId('task-management-page')).toBeInTheDocument();
    });

    it('renders Content at /content', () => {
      renderAt('/content', AUTHENTICATED);
      expect(screen.getByTestId('content-page')).toBeInTheDocument();
    });

    it('renders ApprovalQueue at /approvals', () => {
      renderAt('/approvals', AUTHENTICATED);
      expect(screen.getByTestId('approval-queue-page')).toBeInTheDocument();
    });

    it('renders AIStudio at /ai', () => {
      renderAt('/ai', AUTHENTICATED);
      expect(screen.getByTestId('ai-studio-page')).toBeInTheDocument();
    });

    it('renders Settings at /settings', () => {
      renderAt('/settings', AUTHENTICATED);
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });

    it('renders CostMetricsDashboard at /costs', () => {
      renderAt('/costs', AUTHENTICATED);
      expect(screen.getByTestId('cost-metrics-page')).toBeInTheDocument();
    });

    it('renders PerformanceDashboard at /performance', () => {
      renderAt('/performance', AUTHENTICATED);
      expect(
        screen.getByTestId('performance-dashboard-page')
      ).toBeInTheDocument();
    });

    it('renders BlogWorkflowPage at /workflows', () => {
      renderAt('/workflows', AUTHENTICATED);
      expect(screen.getByTestId('blog-workflow-page')).toBeInTheDocument();
    });

    it('renders UnifiedServicesPanel at /services', () => {
      renderAt('/services', AUTHENTICATED);
      expect(screen.getByTestId('unified-services')).toBeInTheDocument();
    });
  });

  describe('unknown routes', () => {
    it('redirects unknown path to / (which renders login when unauthenticated)', () => {
      renderAt('/this-does-not-exist', UNAUTHENTICATED);
      // Redirects to / which ProtectedRoute redirects to /login
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('redirects unknown path to / (which renders dashboard when authenticated)', () => {
      renderAt('/this-does-not-exist', AUTHENTICATED);
      expect(screen.getByTestId('executive-dashboard')).toBeInTheDocument();
    });
  });
});
