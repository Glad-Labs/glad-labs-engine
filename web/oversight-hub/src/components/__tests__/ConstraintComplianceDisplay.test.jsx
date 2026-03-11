import React from 'react';
import { render, screen } from '@testing-library/react';
import ConstraintComplianceDisplay from '../tasks/ConstraintComplianceDisplay';

describe('ConstraintComplianceDisplay Component', () => {
  it('should return null when compliance is null', () => {
    const { container } = render(<ConstraintComplianceDisplay />);
    expect(container.firstChild).toBeNull();
  });

  it('should render compliance card with header', () => {
    render(
      <ConstraintComplianceDisplay
        compliance={{
          word_count_actual: 500,
          word_count_target: 500,
          word_count_percentage: 0,
          word_count_within_tolerance: true,
          writing_style: 'Professional',
          strict_mode_enforced: false,
        }}
      />
    );
    expect(screen.getByText('Constraint Compliance')).toBeInTheDocument();
  });

  it('should display word count actual and target', () => {
    render(
      <ConstraintComplianceDisplay
        compliance={{
          word_count_actual: 480,
          word_count_target: 500,
          word_count_percentage: -4,
          word_count_within_tolerance: true,
          writing_style: 'Professional',
          strict_mode_enforced: false,
        }}
      />
    );
    expect(screen.getByText(/480.*\/.*500 words/)).toBeInTheDocument();
  });

  it('should show Within Tolerance chip when compliant', () => {
    render(
      <ConstraintComplianceDisplay
        compliance={{
          word_count_actual: 500,
          word_count_target: 500,
          word_count_percentage: 0,
          word_count_within_tolerance: true,
          writing_style: 'Casual',
          strict_mode_enforced: false,
        }}
      />
    );
    expect(screen.getByText(/Within Tolerance/)).toBeInTheDocument();
  });

  it('should show Out of Tolerance chip when not compliant', () => {
    render(
      <ConstraintComplianceDisplay
        compliance={{
          word_count_actual: 200,
          word_count_target: 500,
          word_count_percentage: -60,
          word_count_within_tolerance: false,
          writing_style: 'Casual',
          strict_mode_enforced: false,
        }}
      />
    );
    expect(screen.getByText(/Out of Tolerance/)).toBeInTheDocument();
  });

  it('should display writing style', () => {
    render(
      <ConstraintComplianceDisplay
        compliance={{
          word_count_actual: 500,
          word_count_target: 500,
          word_count_percentage: 0,
          word_count_within_tolerance: true,
          writing_style: 'Academic',
          strict_mode_enforced: false,
        }}
      />
    );
    expect(screen.getByText('Academic')).toBeInTheDocument();
  });

  it('should show strict mode Enabled when enforced', () => {
    render(
      <ConstraintComplianceDisplay
        compliance={{
          word_count_actual: 500,
          word_count_target: 500,
          word_count_percentage: 0,
          word_count_within_tolerance: true,
          writing_style: 'Professional',
          strict_mode_enforced: true,
        }}
      />
    );
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('should show strict mode Disabled when not enforced', () => {
    render(
      <ConstraintComplianceDisplay
        compliance={{
          word_count_actual: 500,
          word_count_target: 500,
          word_count_percentage: 0,
          word_count_within_tolerance: true,
          writing_style: 'Professional',
          strict_mode_enforced: false,
        }}
      />
    );
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('should display violation message when present', () => {
    render(
      <ConstraintComplianceDisplay
        compliance={{
          word_count_actual: 200,
          word_count_target: 500,
          word_count_percentage: -60,
          word_count_within_tolerance: false,
          writing_style: 'Professional',
          strict_mode_enforced: true,
          violation_message: 'Word count too low',
        }}
      />
    );
    expect(screen.getByText('Word count too low')).toBeInTheDocument();
  });

  it('should display phase breakdown table when provided', () => {
    render(
      <ConstraintComplianceDisplay
        compliance={{
          word_count_actual: 500,
          word_count_target: 500,
          word_count_percentage: 0,
          word_count_within_tolerance: true,
          writing_style: 'Professional',
          strict_mode_enforced: false,
        }}
        phaseBreakdown={[
          {
            phase_name: 'introduction',
            word_count_actual: 100,
            word_count_target: 100,
            word_count_percentage: 0,
            word_count_within_tolerance: true,
          },
          {
            phase_name: 'conclusion',
            word_count_actual: 80,
            word_count_target: 100,
            word_count_percentage: -20,
            word_count_within_tolerance: false,
          },
        ]}
      />
    );
    expect(screen.getByText(/Per-Phase Breakdown/)).toBeInTheDocument();
    // Use getAllByRole to find table rows which contain phase names
    expect(screen.getByText('introduction')).toBeInTheDocument();
    expect(screen.getByText('conclusion')).toBeInTheDocument();
    // Check actual/target values rendered
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should not show phase breakdown when not provided', () => {
    render(
      <ConstraintComplianceDisplay
        compliance={{
          word_count_actual: 500,
          word_count_target: 500,
          word_count_percentage: 0,
          word_count_within_tolerance: true,
          writing_style: 'Professional',
          strict_mode_enforced: false,
        }}
      />
    );
    expect(
      screen.queryByText(/Per-Phase Breakdown/)
    ).not.toBeInTheDocument();
  });

  it('should display positive percentage with + sign', () => {
    render(
      <ConstraintComplianceDisplay
        compliance={{
          word_count_actual: 550,
          word_count_target: 500,
          word_count_percentage: 10,
          word_count_within_tolerance: true,
          writing_style: 'Professional',
          strict_mode_enforced: false,
        }}
      />
    );
    expect(screen.getByText('+10.0%')).toBeInTheDocument();
  });
});
