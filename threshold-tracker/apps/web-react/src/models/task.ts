export interface UserTaskStat {
  aimlabs_task_id: string;
  task_name: string;
  category: string;
  personal_best?: number;
  play_count: number;
  avg_score?: number;
  last_played_at?: string;
  threshold_value?: number;
  synced_at: string;
  last5_avg?: number;
  autosync_enabled?: boolean;
  last_calculated_at?: string;
  suggested_threshold?: number;
}

export interface TaskCatalogItem {
  aimlabs_task_id: string;
  task_name: string;
  category: string;
  best_player_nick?: string;
  avg_score?: number;
  best_score?: number;
  player_count: number;
  total_plays: number;
  last_played_at?: string;
}

export interface CatalogParams {
  name?: string;
  category?: string;
  order_by?: string;
  page?: number;
  page_size?: number;
}

export interface MyTasksParams {
  name?: string;
  category?: string;
  order_by?: string;
  played_from?: string;
  played_to?: string;
}

export interface LeaderboardEntry {
  display_name: string;
  personal_best: number;
  play_count: number;
  synced_at: string;
  last_threshold?: number;
  trend_delta?: number;
}
