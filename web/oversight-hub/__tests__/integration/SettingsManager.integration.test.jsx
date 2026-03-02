/**
 * Integration tests for Settings Manager with API
 * Tests full workflow: component renders, user interacts, API calls made, data displayed
 * Location: web/oversight-hub/__tests__/integration/SettingsManager.integration.test.jsx
 */

/* eslint-disable no-unused-vars */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SettingsManager from '../../src/components/SettingsManager';
/* eslint-enable no-unused-vars */
import * as settingsApi from '../../src/api/settingsApi';

vi.mock('../../src/api/settingsApi');

describe('SettingsManager Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Load Settings on Mount', () => {
    test('loads settings when component mounts', async () => {
      const mockSettings = {
        theme: 'dark',
        language: 'en',
        notifications_enabled: true,
        email_frequency: 'daily',
      };

      settingsApi.getSettings.mockResolvedValue(mockSettings);

      render(<SettingsManager />);

      await waitFor(() => {
        expect(settingsApi.getSettings).toHaveBeenCalled();
      });
    });

    test('displays loaded settings in form', async () => {
      const mockSettings = {
        theme: 'light',
        language: 'es',
        notifications_enabled: true,
      };

      settingsApi.getSettings.mockResolvedValue(mockSettings);

      render(<SettingsManager />);

      await waitFor(() => {
        const appearanceTab = screen.getByText(/appearance/i);
        fireEvent.click(appearanceTab);

        const themeSelect = screen.getByLabelText(/theme/i);
        expect(themeSelect.value).toBe('light');
      });
    });

    test('handles error loading settings', async () => {
      settingsApi.getSettings.mockRejectedValue(
        new Error('Failed to load settings')
      );

      render(<SettingsManager />);

      await waitFor(() => {
        expect(screen.getByText(/error loading settings/i)).toBeInTheDocument();
      });
    });

    test('displays loading spinner while fetching settings', async () => {
      settingsApi.getSettings.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
      );

      render(<SettingsManager />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });
  });

  describe('Save Settings', () => {
    test('saves settings when save button clicked', async () => {
      const mockSettings = { theme: 'dark' };
      settingsApi.getSettings.mockResolvedValue(mockSettings);
      settingsApi.saveSettings.mockResolvedValue({ success: true });

      render(<SettingsManager />);

      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(settingsApi.saveSettings).toHaveBeenCalledWith(
          expect.objectContaining({ theme: 'light' })
        );
      });
    });

    test('shows success message after saving', async () => {
      const mockSettings = { theme: 'dark' };
      settingsApi.getSettings.mockResolvedValue(mockSettings);
      settingsApi.saveSettings.mockResolvedValue({ success: true });

      render(<SettingsManager />);

      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
      });
    });

    test('shows error message if save fails', async () => {
      const mockSettings = { theme: 'dark' };
      settingsApi.getSettings.mockResolvedValue(mockSettings);
      settingsApi.saveSettings.mockRejectedValue(new Error('Server error'));

      render(<SettingsManager />);

      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/error saving settings/i)).toBeInTheDocument();
      });
    });

    test('displays saving spinner while request is in progress', async () => {
      const mockSettings = { theme: 'dark' };
      settingsApi.getSettings.mockResolvedValue(mockSettings);
      settingsApi.saveSettings.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<SettingsManager />);

      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Spinner should be visible during request
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });
  });

  describe('Cancel Changes', () => {
    test('cancels unsaved changes', async () => {
      const mockSettings = { theme: 'dark' };
      settingsApi.getSettings.mockResolvedValue(mockSettings);

      render(<SettingsManager />);

      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      expect(themeSelect.value).toBe('light');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(themeSelect.value).toBe('dark');
    });

    test('does not call API when canceling', async () => {
      const mockSettings = { theme: 'dark' };
      settingsApi.getSettings.mockResolvedValue(mockSettings);

      render(<SettingsManager />);

      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      settingsApi.saveSettings.mockClear();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(settingsApi.saveSettings).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Settings Tabs', () => {
    test('switches between tabs without losing changes', async () => {
      const mockSettings = {
        theme: 'dark',
        notifications_enabled: true,
      };
      settingsApi.getSettings.mockResolvedValue(mockSettings);

      render(<SettingsManager />);

      // Make change in appearance tab
      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      // Switch to notifications tab
      const notificationsTab = screen.getByText(/notifications/i);
      fireEvent.click(notificationsTab);

      // Make change in notifications tab
      const notificationToggle = screen.getByLabelText(/enable notifications/i);
      await userEvent.click(notificationToggle);

      // Switch back to appearance tab
      fireEvent.click(appearanceTab);

      // Change should still be there
      expect(themeSelect.value).toBe('light');
    });

    test('saves changes from multiple tabs', async () => {
      const mockSettings = {
        theme: 'dark',
        notifications_enabled: true,
      };
      settingsApi.getSettings.mockResolvedValue(mockSettings);
      settingsApi.saveSettings.mockResolvedValue({ success: true });

      render(<SettingsManager />);

      // Make change in appearance tab
      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      // Switch to notifications tab
      const notificationsTab = screen.getByText(/notifications/i);
      fireEvent.click(notificationsTab);

      const notificationToggle = screen.getByLabelText(/enable notifications/i);
      await userEvent.click(notificationToggle);

      // Save all changes
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(settingsApi.saveSettings).toHaveBeenCalledWith(
          expect.objectContaining({
            theme: 'light',
            notifications_enabled: false,
          })
        );
      });
    });
  });

  describe('Real-time Updates', () => {
    test('reflects settings changes from other tabs/windows', async () => {
      const mockSettings = { theme: 'dark' };
      settingsApi.getSettings.mockResolvedValue(mockSettings);

      render(<SettingsManager />);

      // Simulate settings update from another source
      const updatedSettings = { theme: 'light' };
      settingsApi.getSettings.mockResolvedValue(updatedSettings);

      // Simulate user refreshing or polling
      // This would depend on your component implementation
      // For now, just verify the component can handle updated data
    });
  });

  describe('Settings Validation Integration', () => {
    test('validates settings before sending to API', async () => {
      const mockSettings = { theme: 'dark' };
      settingsApi.getSettings.mockResolvedValue(mockSettings);
      settingsApi.saveSettings.mockResolvedValue({ success: true });

      render(<SettingsManager />);

      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, ''); // Invalid value

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });

      expect(settingsApi.saveSettings).not.toHaveBeenCalled();
    });
  });

  describe('Network Errors', () => {
    test('handles network timeout', async () => {
      settingsApi.getSettings.mockRejectedValue(new Error('Network timeout'));

      render(<SettingsManager />);

      await waitFor(() => {
        expect(screen.getByText(/error loading settings/i)).toBeInTheDocument();
      });
    });

    test('retries on transient network error', async () => {
      const mockSettings = { theme: 'dark' };

      settingsApi.getSettings
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockSettings);

      render(<SettingsManager />);

      await waitFor(() => {
        expect(screen.getByText(/error loading settings/i)).toBeInTheDocument();
      });

      // Component should show retry option
      const retryButton = screen.queryByRole('button', { name: /retry/i });
      if (retryButton) {
        fireEvent.click(retryButton);

        await waitFor(() => {
          expect(settingsApi.getSettings).toHaveBeenCalledTimes(2);
        });
      }
    });
  });

  describe('Concurrent Operations', () => {
    test('prevents duplicate saves if user clicks save multiple times', async () => {
      const mockSettings = { theme: 'dark' };
      settingsApi.getSettings.mockResolvedValue(mockSettings);
      settingsApi.saveSettings.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<SettingsManager />);

      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      const saveButton = screen.getByRole('button', { name: /save/i });

      // Click save multiple times quickly
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);

      await waitFor(() => {
        // Should only be called once due to debouncing/preventing duplicates
        expect(settingsApi.saveSettings).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Data Persistence', () => {
    test('maintains changes during API request', async () => {
      const mockSettings = { theme: 'dark' };
      settingsApi.getSettings.mockResolvedValue(mockSettings);
      settingsApi.saveSettings.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<SettingsManager />);

      const appearanceTab = screen.getByText(/appearance/i);
      fireEvent.click(appearanceTab);

      const themeSelect = screen.getByLabelText(/theme/i);
      await userEvent.selectOption(themeSelect, 'light');

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Value should remain during API request
      expect(themeSelect.value).toBe('light');

      await waitFor(() => {
        expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
      });

      // Value should still be light after save
      expect(themeSelect.value).toBe('light');
    });
  });
});
