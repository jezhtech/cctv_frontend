export interface ActivityLog {
  id: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
  created_at: string;
  action: string;
  details?: Record<string, any>;
}
