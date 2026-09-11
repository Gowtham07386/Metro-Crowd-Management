import { AUTH_STORAGE_KEY } from '@/constants';
import { loginApi, socialLoginApi, registerApi, updateProfileApi as apiUpdateProfile, changePasswordApi as apiChangePassword } from '@/services/metroflowApi';

const USERS_KEY = 'metroflow_users_v2';

function readUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (raw) return JSON.parse(raw);
  const seeded = [
    {
      id: 'USR-DEMO',
      name: 'Demo User',
      email: 'demo@metroflow.app',
      password: 'MetroFlow@123',
      phone: '+91 90000 00000',
      profileImage: null,
      dateJoined: new Date('2026-01-15').toISOString(),
    },
  ];
  localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
  return seeded;
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toSession(user, token) {
  const { password, ...safeUser } = user;
  return { user: safeUser, token: token || `mock-jwt-${user.id}-${Date.now()}` };
}

/**
/ Authenticate user using backend FastAPI /api/auth/login, falling back to local demo storage if backend is unreachable.
*/
export async function login({ email, password, rememberMe }) {
  try {
    const data = await loginApi({ email, password });
    if (data && data.user && data.token) {
      const session = { user: data.user, token: data.token };
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return session;
    }
  } catch (err) {
    const errorMsg = err.response?.data?.detail || err.message;
    // If backend returned explicit 401 Unauthorized or 400 Bad Request error, throw it!
    if (err.response && (err.response.status === 401 || err.response.status === 400)) {
      throw new Error(errorMsg);
    }
    console.warn("Backend auth offline or error, trying demo local storage:", err.message);
  }

  // Fallback to local storage (for offline demo mode)
  await delay();
  const users = readUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!found || found.password !== password) {
    throw new Error('Invalid email or password.');
  }
  const session = toSession(found);
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  return session;
}

/**
/ Social authentication (Google / Microsoft) via backend /api/auth/social-login with offline fallback.
*/
export async function loginWithSocial({ provider, email, name, phone, profileImage, rememberMe = true }) {
  try {
    const data = await socialLoginApi({ provider, email, name, phone, profileImage, rememberMe });
    if (data && data.user && data.token) {
      const session = { user: data.user, token: data.token };
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return session;
    }
  } catch (err) {
    console.warn(`Backend social auth (${provider}) offline or error, falling back to demo storage:`, err.message);
  }

  await delay(400);
  const users = readUsers();
  let found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!found) {
    const displayName = name || email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    found = {
      id: `USR-${provider.toUpperCase()}-${Date.now()}`,
      name: displayName,
      email: email,
      password: `social-${provider}`,
      phone: phone || '',
      role: 'Passenger',
      status: 'Active',
      profileImage: profileImage || null,
      dateJoined: new Date().toISOString(),
    };
    users.push(found);
    writeUsers(users);
  } else if (phone && !found.phone) {
    found.phone = phone;
    writeUsers(users);
  }
  const session = toSession(found);
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  return session;
}

/**
/ Registers a new user via backend FastAPI /api/auth/register, falling back to local storage if backend is unreachable.
*/
export async function registerAccount({ name, phone, email, password, profileImage }) {
  try {
    const registeredUser = await registerApi({ name, phone, email, password, profileImage });
    if (registeredUser) {
      return registeredUser;
    }
  } catch (err) {
    const errorMsg = err.response?.data?.detail || err.message;
    if (err.response && (err.response.status === 400 || err.response.status === 422)) {
      throw new Error(errorMsg);
    }
    console.warn("Backend registration offline or error, falling back to local storage:", err.message);
  }

  // Fallback to local storage
  await delay();
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }
  const newUser = {
    id: `USR-${users.length + 1}-${Date.now()}`,
    name,
    phone: phone || '',
    email,
    password,
    profileImage: profileImage || null,
    dateJoined: new Date().toISOString(),
  };
  users.push(newUser);
  writeUsers(users);
  const { password: _pw, ...safeUser } = newUser;
  return safeUser;
}

export function getStoredSession() {
  const local = localStorage.getItem(AUTH_STORAGE_KEY);
  const session = local || sessionStorage.getItem(AUTH_STORAGE_KEY);
  return session ? JSON.parse(session) : null;
}

export function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

/** Updates user profile fields across session storage and backend API if available. */
export async function updateUserProfile(userId, patch) {
  try {
    const updatedUser = await apiUpdateProfile(userId, patch);
    if (updatedUser) {
      const session = getStoredSession();
      if (session) {
        const updatedSession = { ...session, user: { ...session.user, ...updatedUser } };
        const target = localStorage.getItem(AUTH_STORAGE_KEY) ? localStorage : sessionStorage;
        target.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedSession));
      }
      return updatedUser;
    }
  } catch (e) {
    console.warn("Backend profile update fallback:", e.message);
  }

  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...patch };
  writeUsers(users);

  const session = getStoredSession();
  if (session?.user?.id === userId) {
    const updatedSession = { ...session, user: { ...session.user, ...patch } };
    const target = localStorage.getItem(AUTH_STORAGE_KEY) ? localStorage : sessionStorage;
    target.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedSession));
  }

  const { password, ...safeUser } = users[idx];
  return safeUser;
}

/** Password change via backend FastAPI with local fallback. */
export async function changePassword(userId, { currentPassword, newPassword }) {
  try {
    const result = await apiChangePassword(userId, { currentPassword, newPassword });
    return result;
  } catch (err) {
    if (err.response?.data?.detail) {
      throw new Error(err.response.data.detail);
    }
  }

  await delay(500);
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('Account not found.');
  if (users[idx].password !== currentPassword) {
    throw new Error('Current password is incorrect.');
  }
  users[idx].password = newPassword;
  writeUsers(users);
  return { message: 'Password updated successfully.' };
}
