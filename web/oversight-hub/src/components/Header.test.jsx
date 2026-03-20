import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import Header from './Header';

test('renders header and handles button clicks', () => {
  const handleNewTask = vi.fn();
  const handleIntervene = vi.fn();

  render(<Header onNewTask={handleNewTask} onIntervene={handleIntervene} />);

  // Check that the title is rendered
  expect(screen.getByText(/Content Agent Oversight Hub/i)).toBeInTheDocument();

  // Simulate a click on the "Create New Task" button
  fireEvent.click(screen.getByText(/Create New Task/i));
  expect(handleNewTask).toHaveBeenCalledTimes(1);

  // Simulate a click on the "Pause Agent" button
  fireEvent.click(screen.getByText(/Pause Agent/i));
  expect(handleIntervene).toHaveBeenCalledTimes(1);
});
