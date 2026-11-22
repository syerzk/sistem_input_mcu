import { MCURecord } from '../types';
import { API_BASE_URL } from '../config/api';
import { getAuthHeaders } from '../utils/adminAuth';

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

export interface DoctorItem {
  id: number;
  nama: string;
  spesialis: string;
  isActive: boolean;
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
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
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
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
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
 * Ambil semua records MCU dari backend Golang
 */
export async function fetchMcuRecordsGolang(): Promise<MCURecord[]> {
  try {
    const res = await fetch(`${GOLANG_API_BASE}/records`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
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
 * Simpan rekam medis MCU via backend Golang (Dilengkapi sanitasi umur agar aman dari Format JSON salah)
 */
export async function saveMcuRecordGolang(record: MCURecord): Promise<boolean> {
  try {
    const safePayload = {
      ...record,
      umur: Number(record.umur) || 0,
      testTahun: record.testTahun ? String(record.testTahun) : "2026",
    };

    const res = await fetch(`${GOLANG_API_BASE}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(safePayload),
    });
    const json = await res.json();
    return res.ok || json.success === true;
  } catch (err) {
    console.error('Gagal simpan ke backend Golang:', err);
    return false;
  }
}

/**
 * Hapus rekam medis MCU via backend Golang
 */
export async function deleteMcuRecordGolang(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${GOLANG_API_BASE}/records/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    const json: GolangResponse = await res.json();
    return res.ok && json.success === true;
  } catch (err) {
    console.error('Gagal hapus record dari backend Golang:', err);
    return false;
  }
}

// ==========================================
// MASTER DATA DOKTER (DIBUTUHKAN OLEH DoctorManagerPage)
// ==========================================

export async function fetchAllDoctorsGolang(): Promise<DoctorItem[]> {
  try {
    const res = await fetch(`${GOLANG_API_BASE}/doctors`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    const json: GolangResponse<DoctorItem[]> = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('Gagal mengambil data dokter dari backend:', err);
  }
  return [];
}

export async function createDoctorGolang(payload: { nama: string; spesialis: string; isActive: boolean }): Promise<{ success: boolean; error?: string; data?: DoctorItem }> {
  try {
    const res = await fetch(`${GOLANG_API_BASE}/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      return { success: false, error: text || `Gagal dari server (Status ${res.status})` };
    }

    if (!res.ok || !json.success) {
      return { success: false, error: json.error || json.message || 'Gagal menambah dokter' };
    }
    return { success: true, data: json.data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Koneksi gagal' };
  }
}

export async function updateDoctorGolang(id: number, payload: { nama: string; spesialis: string; isActive: boolean }): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${GOLANG_API_BASE}/doctors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });
    const json: GolangResponse = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Gagal memperbarui dokter' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Koneksi gagal' };
  }
}

export async function deleteDoctorGolang(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${GOLANG_API_BASE}/doctors/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    const json: GolangResponse = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Gagal menghapus dokter' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Koneksi gagal' };
  }
}