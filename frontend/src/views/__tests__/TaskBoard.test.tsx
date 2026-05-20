import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';

import TaskBoard from '../TaskBoard';
import { server } from '../../test/msw-server';

function renderWithProviders() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <TaskBoard />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TaskBoard', () => {
  it('toggles task on click and rolls back when API returns 503', async () => {
    server.use(
      http.patch('/api/tasks/:id', () =>
        HttpResponse.json(
          { error: { code: 'SERVICE_UNAVAILABLE', message: 'down' } },
          { status: 503 },
        ),
      ),
    );

    renderWithProviders();
    await waitFor(() => expect(screen.getByText('Hanging Banners')).toBeInTheDocument());

    const item = screen.getByText('Hanging Banners').closest('button')!;
    await userEvent.click(item);

    // After failure the optimistic update is rolled back; the task should remain not-done.
    await waitFor(() => {
      const button = screen.getByText('Hanging Banners').closest('button')!;
      expect(button.className).not.toContain('done');
    });
  });
});
