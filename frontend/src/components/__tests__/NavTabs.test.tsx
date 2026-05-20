import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import NavTabs from '../NavTabs';

describe('NavTabs', () => {
  it('marks the active tab with the active class', () => {
    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <NavTabs />
      </MemoryRouter>,
    );
    const taskTab = screen.getByText(/Task Board/);
    expect(taskTab.className).toContain('active');
    const overview = screen.getByText(/Overview/);
    expect(overview.className).not.toContain('active');
  });

  it('renders all five tabs', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <NavTabs />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Overview/)).toBeInTheDocument();
    expect(screen.getByText(/Task Board/)).toBeInTheDocument();
    expect(screen.getByText(/Teams/)).toBeInTheDocument();
    expect(screen.getByText(/Prep Day/)).toBeInTheDocument();
    expect(screen.getByText(/Timeline/)).toBeInTheDocument();
  });
});
