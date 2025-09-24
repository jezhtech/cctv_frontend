import type { ActivityLog } from "@/types";
import { ApiClient } from "./client";

export class ActivityLogApi extends ApiClient {
  async getAllActivityLogs(): Promise<ActivityLog[]> {
    return this.get<ActivityLog[]>("/activity-logs/all");
  }
}

export const activityLogApi = new ActivityLogApi();
