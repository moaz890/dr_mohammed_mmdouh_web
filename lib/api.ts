const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
};

export const setToken = (token: string) => localStorage.setItem('admin_token', token);
export const removeToken = () => localStorage.removeItem('admin_token');

// ── Base fetch wrapper ────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Booking {
  _id: string;
  patientName: string;
  phone: string;
  email?: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  bookingStatus: 'pending' | 'confirmed' | 'cancelled';
  amount: number;
  transactionId?: string;
  createdAt: string;
}

// ── Admin Auth ────────────────────────────────────────────────────────────────
export const adminLogin = (email: string, password: string) =>
  apiFetch<{ success: boolean; data: { token: string; admin: object } }>('/api/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

// ── Bookings ─────────────────────────────────────────────────────────────────
export const fetchAllBookings = (params?: {
  bookingStatus?: string;
  paymentStatus?: string;
  search?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.bookingStatus) query.set('bookingStatus', params.bookingStatus);
  if (params?.paymentStatus) query.set('paymentStatus', params.paymentStatus);
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return apiFetch<{ success: boolean; count: number; data: Booking[] }>(
    `/api/bookings/admin/all${qs ? `?${qs}` : ''}`
  );
};

export const fetchBookingById = (id: string) =>
  apiFetch<{ success: boolean; data: Booking }>(`/api/bookings/${id}`);

export const updateBooking = (
  id: string,
  payload: { bookingStatus?: string; paymentStatus?: string; notes?: string }
) =>
  apiFetch<{ success: boolean; data: Booking }>(`/api/bookings/admin/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

// ── Patient-facing ────────────────────────────────────────────────────────────
export interface CreateBookingPayload {
  patientName: string;
  phone: string;
  email?: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  amount: number;
}

export const createBooking = (payload: CreateBookingPayload) =>
  apiFetch<{ success: boolean; data: Booking }>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const createPaymentSession = (bookingId: string) =>
  apiFetch<{ success: boolean; data: { checkoutUrl: string; sessionId: string } }>(
    '/api/payments/create-session',
    { method: 'POST', body: JSON.stringify({ bookingId }) }
  );

