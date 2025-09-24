import { activityLogApi } from "@/lib/api/activityLog";
import type { ActivityLog } from "@/types";

export class ActivityLogService {
  getAllActivityLogs(): Promise<ActivityLog[]> {
    return activityLogApi.getAllActivityLogs();
  }
}
