export interface PlayAttempt {
  task_id: string;
  score: number;
  played_at: string;
}

export interface PagedResponse<T> {
  items: T[];
  total_count: number;
  page: number;
  page_size: number;
}
