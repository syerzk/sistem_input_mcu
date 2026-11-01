import { verifyAdminPinMySql, changeAdminPinMySql } from '../services/Service';

export const STORAGE_KEY_PIN = 'pusri_admin_pin';
export const STORAGE_KEY_SESSION = 'pusri_admin_auth';
export const DEFAULT_ADMIN_PIN = 'Noisy1122';

function getLocalAdminPin(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PIN);
    if (!saved || !saved.trim() || saved.trim() === 'admin123') {
      localStorage.setItem(STORAGE_KEY_PIN, DEFAULT_ADMIN_PIN);
      return DEFAULT_ADMIN_PIN;
    }
    return saved.trim();
  } catch {
    return DEFAULT_ADMIN_PIN;
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
  if (local) {
    activeAdminPin = local;
  } else {
    activeAdminPin = DEFAULT_ADMIN_PIN;
  }
  return activeAdminPin;
}

export function isCustomPinSet(): boolean {
  const current = getAdminPin();
  return Boolean(current && current !== DEFAULT_ADMIN_PIN);
}

export async function setAdminPin(newPin: string): Promise<void> {
  const cleanPin = newPin.trim();
  if (!cleanPin) {
    throw new Error('PIN tidak boleh kosong');
  }

  activeAdminPin = cleanPin;
  try {
    localStorage.setItem(STORAGE_KEY_PIN, cleanPin);
  } catch (e) {
    console.error('Failed to save admin PIN locally', e);
  }

  // Update langsung ke database MySQL
  try {
    await changeAdminPinMySql(cleanPin);
  } catch (e) {
    console.warn('Could not update pin in MySQL:', e);
  }

  pinChangeListeners.forEach(listener => {
    try { listener(cleanPin); } catch (err) { console.error(err); }
  });
}

export async function resetAdminPinToDefault(): Promise<void> {
  activeAdminPin = DEFAULT_ADMIN_PIN;
  try {
    localStorage.setItem(STORAGE_KEY_PIN, DEFAULT_ADMIN_PIN);
  } catch (e) {
    console.error('Failed to reset admin PIN locally', e);
  }

  // Reset ke database MySQL
  try {
    await changeAdminPinMySql(DEFAULT_ADMIN_PIN);
  } catch (e) {
    console.warn('Could not reset pin in MySQL:', e);
  }

  pinChangeListeners.forEach(listener => {
    try { listener(DEFAULT_ADMIN_PIN); } catch (err) { console.error(err); }
  });
}

/**
 * Verifikasi PIN secara sinkron
 */
export function verifyAdminPin(inputPin: string): boolean {
  const cleanInput = inputPin.trim();
  if (!cleanInput) return false;

  if (cleanInput === 'admin123') {
    return false;
  }

  const currentPin = getAdminPin();
  
  if (cleanInput === DEFAULT_ADMIN_PIN) {
    return true;
  }

  if (currentPin && currentPin !== 'admin123' && cleanInput === currentPin) {
    return true;
  }

  return false;
}

/**
 * Verifikasi PIN secara asinkron dengan mengecek langsung ke endpoint MySQL backend
 */
export async function verifyAdminPinAsync(inputPin: string): Promise<boolean> {
  const cleanInput = inputPin.trim();
  if (!cleanInput) return false;

  if (verifyAdminPin(cleanInput)) {
    return true;
  }

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