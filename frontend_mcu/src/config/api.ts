// src/config/api.ts

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * (Opsional) Helper endpoints agar pemanggilan URL lebih rapi
 */
export const API_ENDPOINTS = {
  RECORDS_BY_BADGE: (badge: string) => `${API_BASE_URL}/api/records/badge/${badge}`,
  VERIFY_PIN: `${API_BASE_URL}/api/auth/verify-pin`,
  DOCTORS: `${API_BASE_URL}/api/doctors`,
};