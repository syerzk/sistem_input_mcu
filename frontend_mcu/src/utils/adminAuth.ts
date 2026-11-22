import { verifyAdminPinMySql, changeAdminPinMySql } from '../services/Service';
import { AuthSession, UserRole } from '../types';

export const STORAGE_KEY_PIN = 'pusri_admin_pin';
export const STORAGE_KEY_SESSION = 'pusri_admin_auth';
export const STORAGE_KEY_AUTH_SESSION = 'pusri_mcu_auth_session';
export const DEFAULT_ADMIN_PIN = '';

// --- MANAJEMEN SESI RBAC (TOKEN JWT + ROLE) ---

export function getAuthSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_AUTH_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (parsed && parsed.token && parsed.role) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setAuthSession(session: AuthSession | null): void {
  try {
    if (session) {
      sessionStorage.setItem(STORAGE_KEY_AUTH_SESSION, JSON.stringify(session));
      if (session.role === 'admin') {
        sessionStorage.setItem(STORAGE_KEY_SESSION, 'true');
      } else {
        sessionStorage.removeItem(STORAGE_KEY_SESSION);
      }
    } else {
      sessionStorage.removeItem(STORAGE_KEY_AUTH_SESSION);
      sessionStorage.removeItem(STORAGE_KEY_SESSION);
    }
  } catch (e) {
    console.error('Failed to save auth session', e);
  }
}

export function clearAuthSession(): void {
  setAuthSession(null);
}

export function getAuthToken(): string | null {
  // 1. Cek dari session storage dulu
  const sessionToken = getAuthSession()?.token;
  if (sessionToken) return sessionToken;

  // 2. WAJIB fallback ke localStorage karena Login.tsx menyimpan token di situ
  try {
    const localToken = localStorage.getItem('pusri_mcu_token');
    if (localToken) return localToken;
  } catch {}

  return null;
}

export function getUserRole(): UserRole | null {
  const session = getAuthSession();
  if (session?.role) return session.role;
  if (isAdminSessionActive()) return 'admin';
  return null;
}

export function isAdminRole(): boolean {
  return getUserRole() === 'admin';
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// --- KOMPATIBILITAS FUNGSI PIN LAMA (TRANSISI KE LANGKAH 3) ---

function getLocalAdminPin(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PIN);
    if (!saved || !saved.trim() || saved.trim() === 'admin123') {
      localStorage.removeItem(STORAGE_KEY_PIN);
      return '';
    }
    return saved.trim();
  } catch {
    return '';
  }
}

let activeAdminPin: string = getLocalAdminPin();
const pinChangeListeners: Array<(pin: string) => void> = [];

export function subscribeToPinChanges(listener: (pin: string) => void): () => void {
  pinChangeListeners.push(listener);
  return () => {
    const idx = pinChangeListeners.indexOf(listener);
    if (idx !== -1) pinChangeListeners.splice(idx, 1);
  };
}

export function getAdminPin(): string {
  const local = getLocalAdminPin();
  activeAdminPin = local || DEFAULT_ADMIN_PIN;
  return activeAdminPin;
}

export function isCustomPinSet(): boolean {
  const current = getAdminPin();
  return Boolean(current && current !== DEFAULT_ADMIN_PIN);
}

export async function setAdminPin(newPin: string): Promise<void> {
  const cleanPin = newPin.trim();
  if (!cleanPin) throw new Error('PIN tidak boleh kosong');
  activeAdminPin = cleanPin;
  try {
    localStorage.setItem(STORAGE_KEY_PIN, cleanPin);
  } catch (e) {
    console.error('Failed to save admin PIN locally', e);
  }
  try {
    await changeAdminPinMySql(cleanPin);
  } catch (e) {
    console.warn('Could not update pin in MySQL:', e);
  }
  pinChangeListeners.forEach((listener) => {
    try {
      listener(cleanPin);
    } catch (err) {
      console.error(err);
    }
  });
}

export async function resetAdminPinToDefault(): Promise<void> {
  activeAdminPin = '';
  try {
    localStorage.removeItem(STORAGE_KEY_PIN);
  } catch (e) {
    console.error('Failed to reset admin PIN locally', e);
  }
  pinChangeListeners.forEach((listener) => {
    try {
      listener('');
    } catch (err) {
      console.error(err);
    }
  });
}

export function verifyAdminPin(inputPin: string): boolean {
  const cleanInput = inputPin.trim();
  if (!cleanInput || cleanInput === 'admin123') return false;
  const currentPin = getAdminPin();
  if (currentPin && currentPin !== 'admin123' && cleanInput === currentPin) return true;
  return false;
}

export async function verifyAdminPinAsync(inputPin: string): Promise<boolean> {
  const cleanInput = inputPin.trim();
  if (!cleanInput) return false;
  if (verifyAdminPin(cleanInput)) return true;
  try {
    const isMySqlValid = await verifyAdminPinMySql(cleanInput);
    if (isMySqlValid) {
      activeAdminPin = cleanInput;
      try {
        localStorage.setItem(STORAGE_KEY_PIN, cleanInput);
      } catch {}
      return true;
    }
  } catch (err) {
    console.warn('MySQL pin verification check failed:', err);
  }
  return false;
}

export function isAdminSessionActive(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY_SESSION) === 'true';
  } catch {
    return false;
  }
}

export function setAdminSession(active: boolean): void {
  try {
    if (active) {
      sessionStorage.setItem(STORAGE_KEY_SESSION, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEY_SESSION);
    }
  } catch (e) {
    console.error('Failed to update admin session', e);
  }
}