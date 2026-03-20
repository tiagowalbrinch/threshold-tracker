export interface Score {
  id: string;
  task_id: string;
  value: number;
  is_pb?: boolean;
  sensitivity?: string;
  fov?: number;
  dpi?: number;
  notes?: string;
  created_date?: string;
}
