import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c77f18a2`;

// Get access token from localStorage
function getAccessToken(): string | null {
  const authData = localStorage.getItem('auth-user');
  if (authData) {
    const parsed = JSON.parse(authData);
    return parsed.accessToken || null;
  }
  return null;
}

// Generic API call helper
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const accessToken = getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken || publicAnonKey}`,
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const responseData = await response.json();

    if (!response.ok) {
      return { data: null, error: responseData.error || 'Request failed' };
    }

    return { data: responseData, error: null };
  } catch (error) {
    console.error('API call error:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Network error' };
  }
}

// ============================================
// AUTH API
// ============================================

export async function signup(email: string, password: string, fullName: string) {
  return apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, fullName }),
  });
}

export async function login(email: string, password: string) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ============================================
// SETUP API
// ============================================

export async function getSetup() {
  return apiCall('/setup', { method: 'GET' });
}

export async function saveSetup(setup: {
  totalRequiredHours: number;
  previousHours: number;
  workingDays: number[];
  startDate: string;
}) {
  return apiCall('/setup', {
    method: 'POST',
    body: JSON.stringify(setup),
  });
}

export async function deleteSetup() {
  return apiCall('/setup', { method: 'DELETE' });
}

// ============================================
// TIME LOGS API
// ============================================

export async function getLogs() {
  return apiCall('/logs', { method: 'GET' });
}

export async function createLog(log: {
  date: string;
  isPresent: boolean;
  timeIn?: string;
  timeOut?: string;
  hoursWorked?: number;
  accomplishment?: string;
  photoUrl?: string;
}) {
  return apiCall('/logs', {
    method: 'POST',
    body: JSON.stringify(log),
  });
}

export async function deleteLog(logId: string) {
  return apiCall(`/logs/${logId}`, { method: 'DELETE' });
}

// ============================================
// EVENTS API
// ============================================

export async function getEvents() {
  return apiCall('/events', { method: 'GET' });
}

export async function createEvent(event: {
  title: string;
  date: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  type?: 'important' | 'meeting' | 'deadline' | 'reminder';
  completed?: boolean;
}) {
  return apiCall('/events', {
    method: 'POST',
    body: JSON.stringify(event),
  });
}

export async function updateEvent(
  eventId: string,
  event: {
    title?: string;
    date?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    type?: 'important' | 'meeting' | 'deadline' | 'reminder';
    completed?: boolean;
  }
) {
  return apiCall(`/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(event),
  });
}

export async function deleteEvent(eventId: string) {
  return apiCall(`/events/${eventId}`, { method: 'DELETE' });
}

// ============================================
// STATS API
// ============================================

export async function getStats() {
  return apiCall('/stats', { method: 'GET' });
}
