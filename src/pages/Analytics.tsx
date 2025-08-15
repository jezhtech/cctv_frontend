import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Camera,
  Calendar,
  Clock,
  Activity,
} from "lucide-react";
import { cameraService, userService, attendanceService } from "@/services";

export function Analytics() {
  const [stats, setStats] = useState({
    totalCameras: 0,
    activeCameras: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalAttendance: 0,
    todayAttendance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const [cameras, users, attendance] = await Promise.all([
        cameraService.getAllCameras(),
        userService.getAllUsers(),
        attendanceService.getAllAttendance(),
      ]);

      const today = new Date().toISOString().split("T")[0];
      const todayAttendance = attendance.filter((a) =>
        a.created_at.startsWith(today)
      ).length;

      setStats({
        totalCameras: cameras.length,
        activeCameras: cameras.filter((c) => c.is_active).length,
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.is_active).length,
        totalAttendance: attendance.length,
        todayAttendance,
      });
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Insights and statistics about your smart attendance system
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Cameras
              </p>
              <p className="text-2xl font-bold">{stats.totalCameras}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Camera className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {stats.activeCameras} active
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Users
              </p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {stats.activeUsers} active
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Attendance
              </p>
              <p className="text-2xl font-bold">{stats.totalAttendance}</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            {stats.todayAttendance} today
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                System Health
              </p>
              <p className="text-2xl font-bold text-green-600">Good</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            All systems operational
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Attendance Trend</h3>
          <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Chart would go here</p>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </div>
          </div>
        </div>

        {/* Camera Performance */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Camera Performance</h3>
          <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Chart would go here</p>
              <p className="text-sm text-muted-foreground">
                FPS and detection rates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Camera stream started</p>
              <p className="text-xs text-muted-foreground">
                Main Entrance Camera • 2 minutes ago
              </p>
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">User check-in detected</p>
              <p className="text-xs text-muted-foreground">
                John Doe • 5 minutes ago
              </p>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                Face recognition confidence low
              </p>
              <p className="text-xs text-muted-foreground">
                Camera 3 • 8 minutes ago
              </p>
            </div>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">System backup completed</p>
              <p className="text-xs text-muted-foreground">
                Daily backup • 1 hour ago
              </p>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
            <Calendar className="h-6 w-6 text-primary mb-2" />
            <h4 className="font-medium">Generate Report</h4>
            <p className="text-sm text-muted-foreground">
              Export attendance data
            </p>
          </button>

          <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
            <Camera className="h-6 w-6 text-primary mb-2" />
            <h4 className="font-medium">Camera Status</h4>
            <p className="text-sm text-muted-foreground">Check all cameras</p>
          </button>

          <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
            <Users className="h-6 w-6 text-primary mb-2" />
            <h4 className="font-medium">User Management</h4>
            <p className="text-sm text-muted-foreground">Manage users</p>
          </button>
        </div>
      </div>
    </div>
  );
}
