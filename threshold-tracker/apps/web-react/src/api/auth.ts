import { apiRequest } from './client';

interface AuthResponse {
  token: string;
  user_id: string;
  display_name: string;
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function register(display_name: string, email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { display_name, email, password },
  });
}
