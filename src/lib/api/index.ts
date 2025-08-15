// Export base API client
export { apiClient } from "./client";

// Export API classes
export { userApi } from "./user";
export { cameraApi } from "./camera";
export { attendanceApi } from "./attendance";

// Export types
export type {
  Camera,
  CameraCreate,
  CameraUpdate,
  StreamStatus,
  PaginatedResponse as CameraPaginatedResponse
} from "./camera";

export type {
  User,
  UserCreate,
  UserUpdate,
  UserSearchParams,
  PaginatedResponse as UserPaginatedResponse
} from "./user";

export type {
  Attendance,
  AttendanceCreate,
  AttendanceUpdate,
  AttendanceSearchParams,
  AttendanceStats,
  PaginatedResponse as AttendancePaginatedResponse
} from "./attendance";

// Re-export common types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
