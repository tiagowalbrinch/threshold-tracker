import { apiRequest } from './client';

export interface ProfileResponse {
  user_id: string;
  display_name: string;
  email: string;
  default_sensitivity: string | null;
  default_fov: number | null;
  default_dpi: number | null;
  aimlabs_username: string | null;
}

export function getProfile() {
  return apiRequest<ProfileResponse>('/profile');
}

export function updateProfile(data: {
  display_name?: string | null;
  default_sensitivity?: string;
  default_fov?: number;
  default_dpi?: number;
  aimlabs_username?: string;
}) {
  return apiRequest<ProfileResponse>('/profile', { method: 'PATCH', body: data });
}
