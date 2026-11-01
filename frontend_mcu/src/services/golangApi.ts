import { MCURecord } from '../types';
import { API_BASE_URL } from '../config/api';

/**
 * Service Client untuk berkomunikasi dengan Backend Golang (Port 8080)
 */
const GOLANG_API_BASE = `${API_BASE_URL}/api`;

export interface GolangResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export async function checkGolangBackendHealth(): Promise<{ online: boolean; message?: string }> {
  try {
    const res = await fetch(`${GOLANG_API_BASE}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return { online: false };
    const json: GolangResponse = await res.json();
    return { online: json.success, message: json.message };
  } catch (e) {
    return { online: false };
  }
}

/**
 * Verifikasi PIN Admin melalui Backend Golang
 */
export async function verifyAdminPinGolang(pin: string): Promise<boolean> {
  try {
    const res = await fetch(`${GOLANG_API_BASE}/auth/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const json: GolangResponse = await res.json();
    return json.success === true;
  } catch (err) {
    console.warn('Gagal menghubungi backend Golang untuk verifikasi PIN:', err);
    return false;
  }
}

/**
 * Ubah PIN Admin melalui Backend Golang
 */
export async function changeAdminPinGolang(oldPin: string, newPin: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${GOLANG_API_BASE}/auth/change-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPin, newPin }),
    });
    const json: GolangResponse = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Gagal mengubah PIN via Golang' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Koneksi ke backend Golang gagal' };
  }
}

/**
 * Ambil semua records MCU dari backend Golang (Aman dengan Try-Catch)
 */
export async function fetchMcuRecordsGolang(): Promise<MCURecord[]> {
  try {
    const res = await fetch(`${GOLANG_API_BASE}/records`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return [];
    const json: GolangResponse<MCURecord[]> = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return [];
  } catch (err) {
    console.error('Gagal fetch records dari backend Golang:', err);
    return [];
  }
}

/**
 * Simpan rekam medis MCU via backend Golang
 */
export async function saveMcuRecordGolang(record: MCURecord): Promise<boolean> {
  try {
    const res = await fetch(`${GOLANG_API_BASE}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    const json = await res.json();
    return res.ok || json.success === true;
  } catch (err) {
    console.error('Gagal simpan ke backend Golang:', err);
    return false;
  }
}

/**
 * Hapus rekam medis MCU via backend Golang (Aman dengan Try-Catch)
 */
export async function deleteMcuRecordGolang(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${GOLANG_API_BASE}/records/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const json: GolangResponse = await res.json();
    return res.ok && json.success === true;
  } catch (err) {
    console.error('Gagal hapus record dari backend Golang:', err);
    return false;
  }
}