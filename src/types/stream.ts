export interface StreamStatus {
  is_running: boolean;
  camera_id: string;
  frame_count: number;
  fps: number;
  errors_count: number;
  start_time?: string;
  last_frame_time?: string;
  uptime_seconds: number;
  opencv_active: boolean;
  task_alive: boolean;
  camera_connected: boolean;
  stream_health: string;
  performance_metrics?: {
    avg_frame_time_ms: number;
    max_frame_time_ms: number;
    min_frame_time_ms: number;
    frame_time_history_count: number;
  };
  processor_type: string;
  latest_frame_available?: boolean;
  latest_frame_timestamp?: string;
  frame_buffer_size?: number;
}
