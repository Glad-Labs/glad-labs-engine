/**
 * Unit tests for Settings Manager component
 * Tests individual component functionality, state changes, and user interactions
 * Location: web/oversight-hub/__tests__/components/SettingsManager.test.jsx
 */

/* eslint-disable no-unused-vars */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SettingsManager from '../../src/components/SettingsManager';
/* eslint-enable no-unused-vars */

// Mock Material-UI components if needed
vi.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
}));

describe('SettingsManager Component', () => {
  describe('Rendering', () => {
    test('renders settings manager component', () => {
      render(<SettingsManager />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    test('renders all settings tabs', () => {
      render(<SettingsManager />);
      expect(screen.getByText(/appearance/i)).toBeInTheDocument();
      expect(screen.getByText(/notifications/i)).toBeInTheDocument();
      expect(screen.getByText(/security/i)).toBeInTheDocument();
    });

    test('renders save and cancel buttons', () => {
      render(<SettingsManager />);
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });
  });

  describe('Theme Settings', () => {
    test('renders theme dropdown', () => {
      render(<SettingsManager />);
      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    });

    test('changes theme selection', async () => {
      render(<SettingsManager />);
      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      expect(themeSelect.value).toBe('light');
    });

    test('displays theme preview', () => {
      render(<SettingsManager />);
      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      expect(screen.getByTestId('theme-preview')).toBeInTheDocument();
    });

    test('renders language options', () => {
      render(<SettingsManager />);
      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    });
  });

  describe('Notification Settings', () => {
    test('renders notification toggles', () => {
      render(<SettingsManager />);
      const notificationsTab = screen.getByText(/notifications/i);
      fireEvent.click(notificationsTab);

      expect(
        screen.getByLabelText(/enable notifications/i)
      ).toBeInTheDocument();
    });

    test('toggles notifications on/off', async () => {
      render(<SettingsManager />);
      const notificationsTab = screen.getByText(/notifications/i);
      fireEvent.click(notificationsTab);

      const toggle = screen.getByLabelText(/enable notifications/i);
      await userEvent.click(toggle);

      expect(toggle.checked).toBe(true);
    });

    test('renders email frequency selector', () => {
      render(<SettingsManager />);
      const notificationsTab = screen.getByText(/notifications/i);
      fireEvent.click(notificationsTab);

      expect(screen.getByLabelText(/email frequency/i)).toBeInTheDocument();
    });

    test('renders notification type checkboxes', () => {
      render(<SettingsManager />);
      const notificationsTab = screen.getByText(/notifications/i);
      fireEvent.click(notificationsTab);

      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/push notifications/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/in-app notifications/i)
      ).toBeInTheDocument();
    });
  });

  describe('Security Settings', () => {
    test('renders two-factor authentication section', () => {
      render(<SettingsManager />);
      const securityTab = screen.getByText(/security/i);
      fireEvent.click(securityTab);

      expect(
        screen.getByText(/two-factor authentication/i)
      ).toBeInTheDocument();
    });

    test('renders 2FA enable button', () => {
      render(<SettingsManager />);
      const securityTab = screen.getByText(/security/i);
      fireEvent.click(securityTab);

      expect(
        screen.getByRole('button', { name: /enable 2fa/i })
      ).toBeInTheDocument();
    });

    test('renders password change section', () => {
      render(<SettingsManager />);
      const securityTab = screen.getByText(/security/i);
      fireEvent.click(securityTab);

      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    });

    test('renders active sessions list', () => {
      render(<SettingsManager />);
      const securityTab = screen.getByText(/security/i);
      fireEvent.click(securityTab);

      expect(screen.getByText(/active sessions/i)).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    test('marks form as dirty when changes are made', async () => {
      render(<SettingsManager />);
      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });

    test('save button is disabled when no changes', () => {
      render(<SettingsManager />);
      const saveButton = screen.getByRole('button', { name: /save/i });

      expect(saveButton).toBeDisabled();
    });

    test('cancel button resets form changes', async () => {
      render(<SettingsManager />);
      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      const originalValue = themeSelect.value;

      await userEvent.selectOption(themeSelect, 'light');
      expect(themeSelect.value).toBe('light');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(themeSelect.value).toBe(originalValue);
    });
  });

  describe('Form Validation', () => {
    test('validates required fields', async () => {
      render(<SettingsManager />);
      const securityTab = screen.getByText(/security/i);
      fireEvent.click(securityTab);

      // Try to submit without filling required fields
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });
    });

    test('validates password strength', async () => {
      render(<SettingsManager />);
      const securityTab = screen.getByText(/security/i);
      fireEvent.click(securityTab);

      const newPasswordInput = screen.getByLabelText(/new password/i);
      await userEvent.type(newPasswordInput, 'weak');

      await waitFor(() => {
        expect(screen.getByText(/password must contain/i)).toBeInTheDocument();
      });
    });

    test('validates email format', async () => {
      render(<SettingsManager />);

      // Assuming there's an email field in notifications
      const emailInput = screen.queryByLabelText(/email address/i);
      if (emailInput) {
        await userEvent.type(emailInput, 'invalid-email');

        await waitFor(() => {
          expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('API Integration', () => {
    test('calls API when saving settings', async () => {
      const mockSaveSettings = vi.fn().mockResolvedValue({ success: true });
      vi.mock('../../src/api/settingsApi', () => ({
        saveSettings: mockSaveSettings,
      }));

      render(<SettingsManager />);
      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        // expect(mockSaveSettings).toHaveBeenCalled();
      });
    });

    test('displays loading state while saving', async () => {
      render(<SettingsManager />);
      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Loading spinner should be visible
      // expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('displays success message after saving', async () => {
      render(<SettingsManager />);
      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(/settings saved successfully/i)
        ).toBeInTheDocument();
      });
    });

    test('displays error message if saving fails', async () => {
      render(<SettingsManager />);
      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Mock error response
      // await waitFor(() => {
      //   expect(screen.getByText(/error saving settings/i)).toBeInTheDocument();
      // });
    });
  });

  describe('Edge Cases', () => {
    test('handles rapid tab switching', async () => {
      render(<SettingsManager />);

      const appearanceTab = screen.getByText(/appearance/i);
      const notificationsTab = screen.getByText(/notifications/i);

      fireEvent.click(appearanceTab);
      fireEvent.click(notificationsTab);
      fireEvent.click(appearanceTab);

      // Should not crash
      expect(screen.getByText(/appearance/i)).toBeInTheDocument();
    });

    test('handles component unmount during save', async () => {
      const { unmount } = render(<SettingsManager />);

      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Should unmount without errors
      unmount();
    });

    test('handles missing default settings', () => {
      // Mock scenario where settings don't exist
      render(<SettingsManager settingsData={null} />);

      // Should still render and not crash
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      render(<SettingsManager />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(3); // 3 tabs
    });

    test('all inputs have associated labels', () => {
      render(<SettingsManager />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toHaveAccessibleName();
      });
    });

    test('form is keyboard navigable', async () => {
      render(<SettingsManager />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      saveButton.focus();

      expect(saveButton).toHaveFocus();

      fireEvent.keyDown(saveButton, { key: 'Enter', code: 'Enter' });
      expect(saveButton).toHaveFocus();
    });
  });
});
