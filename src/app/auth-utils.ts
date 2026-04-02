export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt?: string;
  accessToken?: string;
}

export interface AuthUser {
  email: string;
  password: string;
  fullName: string;
}

const AUTH_USER_KEY = 'auth-user';

// Save authenticated user with access token
export const setCurrentUser = (user: User, accessToken: string): void => {
  const authUser = {
    ...user,
    accessToken,
  };
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
};

// Get current authenticated user
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(AUTH_USER_KEY);
  return user ? JSON.parse(user) : null;
};

// Get access token
export const getAccessToken = (): string | null => {
  const user = getCurrentUser();
  return user?.accessToken || null;
};

// Logout user
export const logout = (): void => {
  localStorage.removeItem(AUTH_USER_KEY);
  // Clear all user-specific data
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('ojt-') || key.startsWith('calendar-events')) {
      localStorage.removeItem(key);
    }
  });
};

// Clear current user (alias for logout)
export const clearCurrentUser = (): void => {
  logout();
};

// Get user-specific storage key (for backward compatibility)
export const getUserStorageKey = (key: string): string => {
  const user = getCurrentUser();
  return user ? `${key}-${user.id}` : key;
};

// Legacy functions (kept for backward compatibility but not used with DB)
export const getAllUsers = (): AuthUser[] => {
  return [];
};

export const saveUser = (user: AuthUser): void => {
  // This is now handled by the backend
};

export const findUserByEmail = (email: string): AuthUser | undefined => {
  return undefined;
};

export const validateLogin = (email: string, password: string): boolean => {
  // This is now handled by the backend
  return false;
};