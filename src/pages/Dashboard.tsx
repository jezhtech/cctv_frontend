import {
  Camera as CameraIcon,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  cameraService,
  userService,
  attendanceService,
} from "@/services";
import { cn } from "@/lib/utils";
import type { Camera } from "@/lib/api/camera";
import type { User } from "@/lib/api/user";
import type { Attendance } from "@/lib/api/attendance";

interface DashboardStats {
  totalCameras: number;
  activeCameras: number;
  totalUsers: number;
  activeUsers: number;
  todayAttendance: number;
  systemStatus: "healthy" | "warning" | "error";
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCameras: 0,
    activeCameras: 0,
    totalUsers: 0,
    activeUsers: 0,
    todayAttendance: 0,
    systemStatus: "healthy",
  });
  const [recentCameras, setRecentCameras] = useState<Camera[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch cameras
        const cameras = await cameraService.getAllCameras();
        const activeCameras = cameras.filter((c) => c.is_active);
        
        // Fetch users
        const users = await userService.getAllUsers();
        const activeUsers = users.filter((u) => u.is_active);
        
        // Fetch attendance
        const attendance = await attendanceService.getAllAttendance();
        
        // Calculate today's attendance
        const today = new Date().toISOString().split("T")[0];
        const todayAttendance = attendance.filter((a) =>
          a.created_at.startsWith(today)
        ).length;
        
        // Set system status based on data availability
        const systemStatus = cameras.length > 0 && users.length > 0 ? "healthy" : "warning";
        
        setStats({
          totalCameras: cameras.length,
          activeCameras: activeCameras.length,
          totalUsers: users.length,
          activeUsers: activeUsers.length,
          todayAttendance,
          systemStatus,
        });
        
        setRecentCameras(cameras.slice(0, 5));
        setRecentUsers(users.slice(0, 5));
        setRecentAttendance(attendance.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setStats((prev) => ({ ...prev, systemStatus: "error" }));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    className,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    trend?: "up" | "down" | "neutral";
    className?: string;
  }) => (
    <div className={cn("bg-card border rounded-lg p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-sm">
          <TrendingUp
            className={cn(
              "h-4 w-4 mr-1",
              trend === "up" ? "text-green-500" : "text-red-500"
            )}
          />
          <span
            className={cn(trend === "up" ? "text-green-600" : "text-red-600")}
          >
            {trend === "up" ? "+" : "-"}12%
          </span>
          <span className="text-muted-foreground ml-1">from last month</span>
        </div>
      )}
    </div>
  );

  const StatusIndicator = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case "healthy":
          return {
            icon: CheckCircle,
            color: "text-green-500",
            bg: "bg-green-100 dark:bg-green-900/20",
          };
        case "warning":
          return {
            icon: AlertCircle,
            color: "text-yellow-500",
            bg: "bg-yellow-100 dark:bg-yellow-900/20",
          };
        case "error":
          return {
            icon: AlertCircle,
            color: "text-red-500",
            bg: "bg-red-100 dark:bg-red-900/20",
          };
        default:
          return {
            icon: Clock,
            color: "text-gray-500",
            bg: "bg-gray-100 dark:bg-gray-900/20",
          };
      }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <div
        className={cn(
          "flex items-center space-x-2",
          config.bg,
          "px-3 py-1 rounded-full"
        )}
      >
        <Icon className={cn("h-4 w-4", config.color)} />
        <span className={cn("text-sm font-medium capitalize", config.color)}>
          {status}
        </span>
      </div>
    );
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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your smart attendance system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Cameras"
          value={stats.totalCameras}
          icon={CameraIcon}
          trend="up"
        />
        <StatCard
          title="Active Cameras"
          value={stats.activeCameras}
          icon={CameraIcon}
          trend="up"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Today's Attendance"
          value={stats.todayAttendance}
          icon={Calendar}
          trend="up"
        />
      </div>

      {/* System Status */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">System Status</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <StatusIndicator status={stats.systemStatus} />
            <span className="text-sm text-muted-foreground">
              Last checked: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <button className="text-sm text-primary hover:underline">
            View Details
          </button>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cameras */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Cameras</h3>
          <div className="space-y-3">
            {recentCameras.map((camera) => (
              <div
                key={camera.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{camera.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {camera.location}
                  </p>
                </div>
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    camera.is_active ? "bg-green-500" : "bg-red-500"
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user.first_name[0]}
                    {user.last_name[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.department || "No department"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Attendance</h3>
          <div className="space-y-3">
            {recentAttendance.map((attendance) => (
              <div key={attendance.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {attendance.user?.first_name} {attendance.user?.last_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(attendance.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {attendance.camera?.name || "Unknown Camera"}
                  </span>
                  <span className="font-medium">
                    {Math.round(attendance.confidence_score * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
