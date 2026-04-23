import { API_ENDPOINTS } from '../lib/config';

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  data?: {
    adminToken: string;
    admin: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

export async function adminLogin(data: AdminLoginData): Promise<AdminLoginResponse> {
  const response = await fetch(API_ENDPOINTS.auth.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

export function setAdminToken(token: string): void {
  localStorage.setItem('ilesure_admin_token', token);
}

export function getAdminToken(): string | null {
  return localStorage.getItem('ilesure_admin_token');
}

export function removeAdminToken(): void {
  localStorage.removeItem('ilesure_admin_token');
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminToken();
}