export interface Camera {
  id: string;
  name: string;
  ip_address: string;
  port: number;
  path?: string;
  location: string;
  is_active: boolean;
  frame_rate: number;
  username?: string;
  password?: string;
  created_at: string;
  updated_at: string;
}

export interface CameraCreate {
  name: string;
  ip_address: string;
  port: number;
  path?: string;
  location: string;
  frame_rate: number;
  username?: string;
  password?: string;
}

export interface CameraUpdate {
  name?: string;
  ip_address?: string;
  port?: number;
  path?: string;
  location?: string;
  frame_rate?: number;
  username?: string;
  password?: string;
  is_active?: boolean;
  timeout?: number;
}

export interface CameraFilters {
  location?: string;
  isActive?: boolean;
  frameRate?: number;
}

export interface CameraStats {
  total: number;
  active: number;
  inactive: number;
  byLocation: Record<string, number>;
  averageFrameRate: number;
}
