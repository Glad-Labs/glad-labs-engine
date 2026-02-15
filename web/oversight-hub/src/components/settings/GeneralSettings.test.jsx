import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GeneralSettings from './GeneralSettings';
import * as settingsService from '../../services/settingsService';

// Mock the settings service
jest.mock('../../services/settingsService');

describe('GeneralSettings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component with title', () => {
    settingsService.getSetting.mockResolvedValue({ value: '30' });
    settingsService.createOrUpdateSetting.mockResolvedValue({});

    render(<GeneralSettings />);
    expect(screen.getByText('Model Provider Preferences')).toBeInTheDocument();
  });

  test('loads settings on mount', async () => {
    settingsService.getSetting.mockResolvedValue({ value: '30' });
    settingsService.createOrUpdateSetting.mockResolvedValue({});

    render(<GeneralSettings />);

    await waitFor(() => {
      expect(settingsService.getSetting).toHaveBeenCalledWith(
        'primary_llm_provider'
      );
    });
  });

  test('displays loading spinner while loading', () => {
    settingsService.getSetting.mockImplementation(
      () =>
        new Promise(() => {
          // Never resolves to keep component in loading state
        })
    );

    render(<GeneralSettings />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('displays error message when loading fails', async () => {
    const error = new Error('Failed to load settings');
    settingsService.getSetting.mockRejectedValue(error);

    render(<GeneralSettings />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load settings/)).toBeInTheDocument();
    });
  });

  test('displays error message when saving fails', async () => {
    settingsService.getSetting.mockResolvedValue({ value: 'ollama' });
    settingsService.createOrUpdateSetting.mockRejectedValue(
      new Error('Failed to save settings')
    );

    render(<GeneralSettings />);

    await waitFor(() => {
      const saveButton = screen.getByText('Save Model Preferences');
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to save settings/)).toBeInTheDocument();
    });
  });

  test('displays success message after saving', async () => {
    settingsService.getSetting.mockResolvedValue({ value: 'ollama' });
    settingsService.createOrUpdateSetting.mockResolvedValue({});

    render(<GeneralSettings />);

    await waitFor(() => {
      const saveButton = screen.getByText('Save Model Preferences');
      expect(saveButton).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Model Preferences');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText('Settings saved successfully!')
      ).toBeInTheDocument();
    });
  });

  test('disables buttons while saving', async () => {
    settingsService.getSetting.mockResolvedValue({ value: 'ollama' });
    settingsService.createOrUpdateSetting.mockImplementation(
      () =>
        new Promise(() => {
          // Never resolves to keep component in saving state
        })
    );

    render(<GeneralSettings />);

    await waitFor(() => {
      const saveButton = screen.getByText('Save Model Preferences');
      expect(saveButton).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Model Preferences');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });
});
