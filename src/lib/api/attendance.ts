import { ApiClient } from "./client";
import type { User } from "./user";
import type { Camera } from "./camera";

// Types
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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export class AttendanceApi extends ApiClient {
  // Get all attendance records with pagination and search
  async getAttendances(
    params?: AttendanceSearchParams
  ): Promise<PaginatedResponse<Attendance>> {
    return this.get<PaginatedResponse<Attendance>>("/users/attendance", params);
  }

  // Get a single attendance record by ID
  async getAttendance(id: string): Promise<Attendance> {
    return this.get<Attendance>(`/users/attendance/${id}`);
  }

  // Create a new attendance record
  async createAttendance(data: AttendanceCreate): Promise<Attendance> {
    return this.post<Attendance>("/users/attendance", data);
  }

  // Update an existing attendance record
  async updateAttendance(
    id: string,
    data: AttendanceUpdate
  ): Promise<Attendance> {
    return this.put<Attendance>(`/users/attendance/${id}`, data);
  }

  // Delete an attendance record
  async deleteAttendance(id: string): Promise<void> {
    return this.delete<void>(`/users/attendance/${id}`);
  }

  // Get attendance records for a specific user
  async getUserAttendance(
    userId: string,
    params?: Omit<AttendanceSearchParams, "user_id">
  ): Promise<Attendance[]> {
    return this.get<Attendance[]>("/users/attendance", {
      ...params,
      user_id: userId,
    });
  }

  // Get attendance records for a specific camera
  async getCameraAttendance(
    cameraId: string,
    params?: Omit<AttendanceSearchParams, "camera_id">
  ): Promise<Attendance[]> {
    return this.get<Attendance[]>("/users/attendance", {
      ...params,
      camera_id: cameraId,
    });
  }

  // Get attendance records for a specific date range
  async getAttendanceByDateRange(
    dateFrom: string,
    dateTo: string,
    params?: Omit<AttendanceSearchParams, "date_from" | "date_to">
  ): Promise<Attendance[]> {
    return this.get<Attendance[]>("/users/attendance", {
      ...params,
      date_from: dateFrom,
      date_to: dateTo,
    });
  }

  // Get today's attendance records
  async getTodayAttendance(): Promise<Attendance[]> {
    const today = new Date().toISOString().split("T")[0];
    return this.getAttendanceByDateRange(today, today);
  }

  // Get this week's attendance records
  async getThisWeekAttendance(): Promise<Attendance[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return this.getAttendanceByDateRange(
      startOfWeek.toISOString(),
      endOfWeek.toISOString()
    );
  }

  // Get this month's attendance records
  async getThisMonthAttendance(): Promise<Attendance[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return this.getAttendanceByDateRange(
      startOfMonth.toISOString(),
      endOfMonth.toISOString()
    );
  }

  // Get attendance statistics
  async getAttendanceStats(): Promise<AttendanceStats> {
    return this.get<AttendanceStats>("/users/attendance/stats");
  }

  // Export attendance data
  async exportAttendance(
    format: "csv" | "excel" | "json",
    params?: AttendanceSearchParams
  ): Promise<Blob> {
    const response = await this.request({
      method: "GET",
      url: "/users/attendance/export",
      params: { ...params, format },
      responseType: "blob",
    });
    return response;
  }

  // Bulk delete attendance records
  async bulkDeleteAttendance(
    attendanceIds: string[]
  ): Promise<{ message: string; deleted_count: number }> {
    return this.delete<{ message: string; deleted_count: number }>(
      "/users/attendance/bulk-delete",
      { data: { attendance_ids: attendanceIds } }
    );
  }

  // Get attendance summary by user
  async getAttendanceSummaryByUser(
    userId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<{
    user_id: string;
    total_checkins: number;
    total_hours: number;
    average_checkin_time: string;
    average_checkout_time: string;
    attendance_rate: number;
  }> {
    return this.get<{
      user_id: string;
      total_checkins: number;
      total_hours: number;
      average_checkin_time: string;
      average_checkout_time: string;
      attendance_rate: number;
    }>("/users/attendance/summary", {
      user_id: userId,
      date_from: dateFrom,
      date_to: dateTo,
    });
  }
}

// Export singleton instance
export const attendanceApi = new AttendanceApi();

