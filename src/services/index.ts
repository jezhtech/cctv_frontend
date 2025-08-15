// Export all services
export { cameraService } from "./CameraService";
export { userService } from "./UserService";
export { attendanceService } from "./AttendanceService";
export { streamingService } from "./StreamingService";

// Export service types
export type {
    AttendanceFilters,
    AttendanceReport,
    AttendanceSummary,
} from "./AttendanceService";
export type { CameraFilters, CameraStats } from "./CameraService";
export type { UserFilters, UserStats, UserSearchResult } from "./UserService";
