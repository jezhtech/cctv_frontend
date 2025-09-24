export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export * from "./activityLog";
export * from "./attendance";
export * from "./user";
export * from "./face";
export * from "./camera";
export * from "./stream";
