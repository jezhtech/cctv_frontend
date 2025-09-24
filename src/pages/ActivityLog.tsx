import {
  Activity,
  Search,
  Download,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  Loader,
  ServerCrash,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import { cn } from "@/lib/utils";
import { ActivityLogService } from "@/services/ActivityLogService";
import type { ActivityLog } from "@/types";

// Helper for chart colors
const LEVEL_COLORS: Record<string, string> = {
  SUCCESS: "#22c55e", // green-500
  INFO: "#3b82f6", // blue-500
  WARNING: "#f59e0b", // amber-500
  ERROR: "#ef4444", // red-500
};

const renderDetails = (details: string) => {
  if (!details) return null;

  try {
    const parsed = JSON.parse(details);
    return (
      <pre className="text-sm text-muted-foreground mb-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-md overflow-auto">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  } catch (e) {
    // If it's not a valid JSON string, display it as plain text.
    return <p className="text-sm text-muted-foreground font-mono">{details}</p>;
  }
};

export function ActivityLog() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const service = new ActivityLogService();
        const data = await service.getAllActivityLogs();
        setActivities(
          data.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          ),
        );
        setError(null);
      } catch (err) {
        setError("Failed to fetch activity logs.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const { actions, levels } = useMemo(() => {
    const actionsSet = new Set(activities.map((a) => a.action));
    const levelsSet = new Set(activities.map((a) => a.level));
    return {
      actions: ["all", ...Array.from(actionsSet)],
      levels: ["all", ...Array.from(levelsSet)],
    };
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const searchDetails = activity.details || "";
      const matchesSearch =
        activity.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        searchDetails.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction =
        selectedAction === "all" || activity.action === selectedAction;
      const matchesLevel =
        selectedLevel === "all" || activity.level === selectedLevel;

      return matchesSearch && matchesAction && matchesLevel;
    });
  }, [activities, searchTerm, selectedAction, selectedLevel]);

  const levelChartData = useMemo(() => {
    const counts = filteredActivities.reduce(
      (acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredActivities]);

  const activityByDateData = useMemo(() => {
    if (filteredActivities.length === 0) return [];
    const counts = filteredActivities.reduce(
      (acc, log) => {
        const date = new Date(log.created_at).toLocaleDateString("en-CA"); // YYYY-MM-DD for sorting
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredActivities]);

  const actionLevelData = useMemo(() => {
    const data = filteredActivities.reduce(
      (acc, log) => {
        if (!acc[log.action]) {
          acc[log.action] = {};
        }
        acc[log.action][log.level] = (acc[log.action][log.level] || 0) + 1;
        return acc;
      },
      {} as Record<string, Record<string, number>>,
    );

    return Object.entries(data).map(([action, levels]) => ({
      action,
      ...levels,
    }));
  }, [filteredActivities]);

  const getLevelIcon = (level: ActivityLog["level"]) => {
    switch (level) {
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "WARNING":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "ERROR":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "INFO":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: ActivityLog["level"]) => {
    switch (level) {
      case "SUCCESS":
        return "border-l-green-500 bg-green-50 dark:bg-green-900/10";
      case "WARNING":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10";
      case "ERROR":
        return "border-l-red-500 bg-red-50 dark:bg-red-900/10";
      case "INFO":
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-900/10";
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-900/10";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <ServerCrash className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">An Error Occurred</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">
            Monitor system activities and events
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <Download className="h-4 w-4 mr-2" />
          Export Log
        </button>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-card border rounded-lg relative">
          <h3 className="text-lg font-semibold mb-4">Events by Level</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={levelChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                labelLine={false}
              >
                {levelChartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={LEVEL_COLORS[entry.name] || "#8884d8"}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {filteredActivities.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </div>
          </div>
        </div>
        <div className="p-6 bg-card border rounded-lg lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">
            Action Breakdown by Level
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={actionLevelData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="action"
                type="category"
                width={110}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="SUCCESS" stackId="a" fill={LEVEL_COLORS.SUCCESS} />
              <Bar dataKey="INFO" stackId="a" fill={LEVEL_COLORS.INFO} />
              <Bar dataKey="WARNING" stackId="a" fill={LEVEL_COLORS.WARNING} />
              <Bar dataKey="ERROR" stackId="a" fill={LEVEL_COLORS.ERROR} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 bg-card border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Activity Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={activityByDateData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              name="Total Events"
              stroke="#8884d8"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div>
            <label className="text-sm font-medium mr-2">Action:</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3 py-1 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mr-2">Level:</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-1 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className={cn(
              "border-l-4 p-4 rounded-r-lg border transition-colors",
              getLevelColor(activity.level),
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="mt-1">{getLevelIcon(activity.level)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium">{activity.message}</h4>
                    <span className="px-2 py-1 text-xs font-medium bg-muted rounded-full">
                      {activity.action}
                    </span>
                  </div>
                  {renderDetails(activity.details)}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(activity.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm || selectedAction !== "all" || selectedLevel !== "all"
              ? "No activities found"
              : "No activities yet"}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedAction !== "all" || selectedLevel !== "all"
              ? "Try adjusting your search or filters."
              : "Activity logs will appear here as the system runs."}
          </p>
        </div>
      )}

      {/* Results Count */}
      {filteredActivities.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredActivities.length} of {activities.length} activities
        </div>
      )}
    </div>
  );
}
