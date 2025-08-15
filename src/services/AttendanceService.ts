import { attendanceApi, type Attendance, type AttendanceCreate, type AttendanceUpdate, type AttendanceSearchParams, type AttendanceStats } from "@/lib/api/attendance";
import { userService } from "./UserService";
import { cameraService } from "./CameraService";

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

export class AttendanceService {
  // Get all attendance records with filtering
  async getAllAttendance(filters?: AttendanceFilters): Promise<Attendance[]> {
    try {
      const response = await attendanceApi.getAttendances({ limit: 1000 });
      let records = response.data;

      // Apply filters
      if (filters?.userId) {
        records = records.filter(record => record.user_id === filters.userId);
      }

      if (filters?.cameraId) {
        records = records.filter(record => record.camera_id === filters.cameraId);
      }

      if (filters?.dateFrom) {
        records = records.filter(record => 
          new Date(record.created_at) >= new Date(filters.dateFrom!)
        );
      }

      if (filters?.dateTo) {
        records = records.filter(record => 
          new Date(record.created_at) <= new Date(filters.dateTo!)
        );
      }

      if (filters?.location) {
        records = records.filter(record => 
          record.location?.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters?.minConfidence) {
        records = records.filter(record => 
          record.confidence_score >= filters.minConfidence!
        );
      }

      if (filters?.maxConfidence) {
        records = records.filter(record => 
          record.confidence_score <= filters.maxConfidence!
        );
      }

      return records;
    } catch (error) {
      console.error("Failed to fetch attendance records:", error);
      throw error;
    }
  }

  // Get attendance by ID
  async getAttendanceById(id: string): Promise<Attendance> {
    try {
      return await attendanceApi.getAttendance(id);
    } catch (error) {
      console.error(`Failed to fetch attendance record ${id}:`, error);
      throw error;
    }
  }

  // Create new attendance record
  async createAttendance(attendanceData: AttendanceCreate): Promise<Attendance> {
    try {
      // Validate attendance data
      this.validateAttendanceData(attendanceData);
      
      // Check if user exists and is active
      const user = await userService.getUserById(attendanceData.user_id);
      if (!user.is_active) {
        throw new Error("Cannot create attendance for inactive user");
      }

      // Check if camera exists and is active
      const camera = await cameraService.getCameraById(attendanceData.camera_id);
      if (!camera.is_active) {
        throw new Error("Cannot create attendance for inactive camera");
      }

      return await attendanceApi.createAttendance(attendanceData);
    } catch (error) {
      console.error("Failed to create attendance record:", error);
      throw error;
    }
  }

  // Update attendance record
  async updateAttendance(id: string, updateData: AttendanceUpdate): Promise<Attendance> {
    try {
      // Validate update data
      if (updateData.confidence_score !== undefined) {
        if (updateData.confidence_score < 0 || updateData.confidence_score > 1) {
          throw new Error("Confidence score must be between 0 and 1");
        }
      }

      return await attendanceApi.updateAttendance(id, updateData);
    } catch (error) {
      console.error(`Failed to update attendance record ${id}:`, error);
      throw error;
    }
  }

  // Delete attendance record
  async deleteAttendance(id: string): Promise<void> {
    try {
      await attendanceApi.deleteAttendance(id);
    } catch (error) {
      console.error(`Failed to delete attendance record ${id}:`, error);
      throw error;
    }
  }

  // Get user attendance
  async getUserAttendance(userId: string, filters?: Omit<AttendanceFilters, 'userId'>): Promise<Attendance[]> {
    try {
      return await attendanceApi.getUserAttendance(userId, filters);
    } catch (error) {
      console.error(`Failed to get attendance for user ${userId}:`, error);
      throw error;
    }
  }

  // Get camera attendance
  async getCameraAttendance(cameraId: string, filters?: Omit<AttendanceFilters, 'cameraId'>): Promise<Attendance[]> {
    try {
      return await attendanceApi.getCameraAttendance(cameraId, filters);
    } catch (error) {
      console.error(`Failed to get attendance for camera ${cameraId}:`, error);
      throw error;
    }
  }

  // Get today's attendance
  async getTodayAttendance(): Promise<Attendance[]> {
    try {
      return await attendanceApi.getTodayAttendance();
    } catch (error) {
      console.error("Failed to get today's attendance:", error);
      throw error;
    }
  }

  // Get this week's attendance
  async getThisWeekAttendance(): Promise<Attendance[]> {
    try {
      return await attendanceApi.getThisWeekAttendance();
    } catch (error) {
      console.error("Failed to get this week's attendance:", error);
      throw error;
    }
  }

  // Get this month's attendance
  async getThisMonthAttendance(): Promise<Attendance[]> {
    try {
      return await attendanceApi.getThisMonthAttendance();
    } catch (error) {
      console.error("Failed to get this month's attendance:", error);
      throw error;
    }
  }

  // Get attendance statistics
  async getAttendanceStats(): Promise<AttendanceStats> {
    try {
      return await attendanceApi.getAttendanceStats();
    } catch (error) {
      console.error("Failed to get attendance statistics:", error);
      throw error;
    }
  }

  // Export attendance data
  async exportAttendance(format: "csv" | "excel" | "json", filters?: AttendanceFilters): Promise<Blob> {
    try {
      return await attendanceApi.exportAttendance(format, filters);
    } catch (error) {
      console.error("Failed to export attendance data:", error);
      throw error;
    }
  }

  // Bulk delete attendance records
  async bulkDeleteAttendance(attendanceIds: string[]): Promise<void> {
    try {
      if (attendanceIds.length === 0) {
        throw new Error("No attendance IDs provided");
      }

      await attendanceApi.bulkDeleteAttendance(attendanceIds);
    } catch (error) {
      console.error("Failed to bulk delete attendance records:", error);
      throw error;
    }
  }

  // Get attendance summary by user
  async getAttendanceSummaryByUser(userId: string, dateFrom?: string, dateTo?: string): Promise<AttendanceSummary> {
    try {
      const summary = await attendanceApi.getAttendanceSummaryByUser(userId, dateFrom, dateTo);
      const user = await userService.getUserById(userId);
      
      return {
        ...summary,
        userName: userService.getUserFullName(user)
      };
    } catch (error) {
      console.error(`Failed to get attendance summary for user ${userId}:`, error);
      throw error;
    }
  }

  // Get attendance report
  async getAttendanceReport(filters?: AttendanceFilters): Promise<AttendanceReport> {
    try {
      const records = await this.getAllAttendance(filters);
      const stats = await this.getAttendanceStats();
      
      // Calculate unique counts
      const uniqueUsers = new Set(records.map(r => r.user_id)).size;
      const uniqueCameras = new Set(records.map(r => r.camera_id)).size;
      
      // Calculate average confidence
      const totalConfidence = records.reduce((sum, r) => sum + r.confidence_score, 0);
      const averageConfidence = records.length > 0 ? totalConfidence / records.length : 0;
      
      // Group by date
      const byDate: Record<string, number> = {};
      records.forEach(record => {
        const date = new Date(record.created_at).toISOString().split('T')[0];
        byDate[date] = (byDate[date] || 0) + 1;
      });
      
      // Group by location
      const byLocation: Record<string, number> = {};
      records.forEach(record => {
        const location = record.location || 'Unknown';
        byLocation[location] = (byLocation[location] || 0) + 1;
      });
      
      // Group by camera
      const byCamera: Record<string, number> = {};
      records.forEach(record => {
        const cameraName = record.camera?.name || 'Unknown Camera';
        byCamera[cameraName] = (byCamera[cameraName] || 0) + 1;
      });
      
      // Get top users
      const userCheckIns: Record<string, { count: number; hours: number }> = {};
      records.forEach(record => {
        if (!userCheckIns[record.user_id]) {
          userCheckIns[record.user_id] = { count: 0, hours: 0 };
        }
        userCheckIns[record.user_id].count++;
        
        // Calculate hours if check-out time exists
        if (record.check_out_time) {
          const checkIn = new Date(record.check_in_time);
          const checkOut = new Date(record.check_out_time);
          const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
          userCheckIns[record.user_id].hours += hours;
        }
      });
      
      const topUsers = await Promise.all(
        Object.entries(userCheckIns)
          .sort(([, a], [, b]) => b.count - a.count)
          .slice(0, 10)
          .map(async ([userId, stats]) => {
            const user = await userService.getUserById(userId);
            return {
              userId,
              userName: userService.getUserFullName(user),
              checkIns: stats.count,
              totalHours: Math.round(stats.hours * 100) / 100
            };
          })
      );
      
      return {
        totalRecords: records.length,
        uniqueUsers,
        uniqueCameras,
        averageConfidence: Math.round(averageConfidence * 100) / 100,
        byDate,
        byLocation,
        byCamera,
        topUsers
      };
    } catch (error) {
      console.error("Failed to generate attendance report:", error);
      throw error;
    }
  }

  // Validate attendance data
  private validateAttendanceData(data: AttendanceCreate): void {
    if (!data.user_id || data.user_id.trim().length === 0) {
      throw new Error("User ID is required");
    }

    if (!data.camera_id || data.camera_id.trim().length === 0) {
      throw new Error("Camera ID is required");
    }

    if (data.confidence_score < 0 || data.confidence_score > 1) {
      throw new Error("Confidence score must be between 0 and 1");
    }
  }

  // Calculate attendance rate for a user
  async calculateAttendanceRate(userId: string, dateFrom?: string, dateTo?: string): Promise<number> {
    try {
      const summary = await this.getAttendanceSummaryByUser(userId, dateFrom, dateTo);
      return summary.attendanceRate;
    } catch (error) {
      console.error(`Failed to calculate attendance rate for user ${userId}:`, error);
      return 0;
    }
  }

  // Get recent attendance for dashboard
  async getRecentAttendance(limit: number = 10): Promise<Attendance[]> {
    try {
      const records = await this.getAllAttendance();
      return records
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error("Failed to get recent attendance:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const attendanceService = new AttendanceService();

