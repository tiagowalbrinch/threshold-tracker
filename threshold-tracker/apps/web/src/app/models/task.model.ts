export interface Task {
  id: string;
  name: string;
  category: 'tracking' | 'flicking' | 'switching' | 'clicking' | 'other';
  threshold?: number;
  personal_best?: number;
  notes?: string;
  created_date?: string;
}
