export interface Task {
  id: string;
  name: string;
  category: 'tracking' | 'flicking' | 'switching' | 'clicking' | 'other';
  threshold?: number;
  personal_best?: number;
  notes?: string;
  created_date?: string;
  created_by_user_id?: string;
}

export interface PagedResponse<T> {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
  has_next_page: boolean;
}
