import type { User } from "./user";
import type { Camera } from "./camera";

export interface AttendanceFilters {
  userId?: string;
  cameraId?: string;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  minConfidence?: number;
  maxConfidence?: number;
}

export interface AttendanceReport {
  totalRecords: number;
  uniqueUsers: number;
  uniqueCameras: number;
  averageConfidence: number;
  byDate: Record<string, number>;
  byLocation: Record<string, number>;
  byCamera: Record<string, number>;
  topUsers: Array<{
    userId: string;
    userName: string;
    checkIns: number;
    totalHours: number;
  }>;
}

export interface AttendanceSummary {
  userId: string;
  userName: string;
  totalCheckIns: number;
  totalHours: number;
  averageCheckInTime: string;
  averageCheckOutTime: string;
  attendanceRate: number;
  lastCheckIn?: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  camera_id: string;
  check_in_time: string;
  check_out_time?: string;
  confidence_score: number;
  location?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  camera?: Camera;
}

export interface AttendanceCreate {
  user_id: string;
  camera_id: string;
  confidence_score: number;
  location?: string;
}

export interface AttendanceUpdate {
  check_out_time?: string;
  confidence_score?: number;
  location?: string;
}

export interface AttendanceSearchParams {
  skip?: number;
  limit?: number;
  user_id?: string;
  camera_id?: string;
  date_from?: string;
  date_to?: string;
  location?: string;
  min_confidence?: number;
}

export interface AttendanceStats {
  total_records: number;
  today_records: number;
  this_week_records: number;
  this_month_records: number;
  by_location: Record<string, number>;
  by_camera: Record<string, number>;
  average_confidence: number;
}
