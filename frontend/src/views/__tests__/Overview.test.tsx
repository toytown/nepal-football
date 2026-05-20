import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

import Overview from '../Overview';

function renderWithProviders() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Overview', () => {
  it('computes counts and percentages from bootstrap fixture', async () => {
    renderWithProviders();
    // Tasks Completed = 1/3 from fixture
    await waitFor(() => expect(screen.getByText('1/3')).toBeInTheDocument());
    // Volunteer task progress = 33%
    expect(screen.getByText('33%')).toBeInTheDocument();
    // 1 specialist team
    expect(screen.getByText('Specialist Teams')).toBeInTheDocument();
  });
});
