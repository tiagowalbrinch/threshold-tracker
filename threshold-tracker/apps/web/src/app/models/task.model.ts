export interface Task {
  id: number;
  name: string;
  type: 'Clicking' | 'Flicking' | 'Tracking' | 'Switching' | 'Other';
  threshold: number | null;
  pb: number;
  attempts: number;
}