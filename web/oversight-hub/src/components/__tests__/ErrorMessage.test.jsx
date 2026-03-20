import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorMessage from '../common/ErrorMessage';

describe('ErrorMessage Component', () => {
  it('should render the error message text', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
  });

  it('should have error-message class', () => {
    const { container } = render(<ErrorMessage message="Error" />);
    expect(container.querySelector('.error-message')).toBeInTheDocument();
  });
});
