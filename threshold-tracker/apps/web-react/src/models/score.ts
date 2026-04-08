export interface PlayAttempt {
  task_id: string;
  score: number;
  played_at: string;
  threshold_at_play?: number;
  above_threshold?: boolean;
}

export interface PagedResponse<T> {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
}
