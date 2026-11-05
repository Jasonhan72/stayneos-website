import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { UserProvider, useUser } from '@/lib/context/UserContext';

const mockWarning = jest.fn();
jest.mock('@/components/ui', () => ({ useToastHelpers: () => ({ warning: mockWarning }) }));
function Profile() {
  const { user, isLoading, refreshUser } = useUser();
  return <><span>{isLoading ? 'loading' : user?.email || 'anonymous'}</span><button onClick={() => void refreshUser()}>Refresh session</button></>;
}
const originalFetch = global.fetch;
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('stayneos_user_data', JSON.stringify({ id: 'owner', name: 'Cached Name', role: 'ADMIN' }));
});
afterEach(() => { global.fetch = originalFetch; });
test('reload restores email and identity from the server without putting email in storage', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ user: { id: 'owner', email: 'owner@example.test', name: 'Owner', role: 'GUEST' } }) });
  render(<UserProvider><Profile /></UserProvider>);
  expect(await screen.findByText('owner@example.test')).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('/api/auth/session', expect.objectContaining({ cache: 'no-store' }));
  expect(JSON.parse(localStorage.getItem('stayneos_user_data')!).email).toBeUndefined();
  expect(JSON.parse(localStorage.getItem('stayneos_user_data')!).role).toBe('GUEST');
});
test('cached identity cannot survive a revoked server session', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ user: null }) });
  render(<UserProvider><Profile /></UserProvider>);
  expect(await screen.findByText('anonymous')).toBeInTheDocument();
  expect(localStorage.getItem('stayneos_user_data')).toBeNull();
});
test('cross-tab changes revalidate the session instead of trusting cached identities', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ user: { id: 'owner', email: 'owner@example.test' } }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ user: null }) });
  render(<UserProvider><Profile /></UserProvider>);
  await screen.findByText('owner@example.test');
  act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'stayneos_user_data', newValue: '{"id":"another-user"}' })));
  await waitFor(() => expect(screen.getByText('anonymous')).toBeInTheDocument());
});

test('session refresh clears identity after the server session expires', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ user: { id: 'owner', email: 'owner@example.test' } }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ user: null }) });
  render(<UserProvider><Profile /></UserProvider>);
  await screen.findByText('owner@example.test');
  fireEvent.click(screen.getByText('Refresh session'));
  expect(await screen.findByText('anonymous')).toBeInTheDocument();
});
