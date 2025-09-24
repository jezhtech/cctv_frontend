import {
  Calendar,
  Search,
  Download,
  Eye,
  Clock,
  MapPin,
  Camera,
} from "lucide-react";
import { useEffect, useState } from "react";
import { attendanceService } from "@/services";
import type { Attendance } from "@/types";
import { getImageUrl } from "@/lib/utils";

export function Attendance() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const attendanceData = await attendanceService.getAllAttendance();
      setAttendance(attendanceData);
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendance.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.user?.first_name?.toLowerCase().includes(searchLower) ||
      record.user?.last_name?.toLowerCase().includes(searchLower) ||
      record.user?.email?.toLowerCase().includes(searchLower) ||
      record.camera?.name?.toLowerCase().includes(searchLower) ||
      record.location?.toLowerCase().includes(searchLower)
    );
  });

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            View and manage attendance records
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search attendance records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Attendance Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Camera
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAttendance.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                          {record?.user?.profile_images &&
                          record.user.profile_images.length > 0 ? (
                            <img
                              src={getImageUrl(
                                record.user.profile_images.find(
                                  (img) => img.is_primary,
                                )?.filename ||
                                  record.user.profile_images[0].filename,
                                record.user.profile_images
                                  .find((img) => img.is_primary)
                                  ?.content_type?.split("/")[1] || "jpeg",
                              )}
                              alt={`${record.user.first_name} ${record.user.last_name}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to initials if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  const fallback =
                                    document.createElement("span");
                                  fallback.className =
                                    "text-sm font-medium text-primary";
                                  fallback.textContent = `${record?.user?.first_name[0]}${record?.user?.last_name[0]}`;
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <span className="text-sm font-medium text-primary">
                              {record?.user?.first_name[0]}
                              {record?.user?.last_name[0]}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium">
                          {record.user?.first_name} {record.user?.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {record.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {new Date(record.check_in_time).toLocaleDateString()}
                        </div>
                        <div className="text-muted-foreground">
                          {new Date(record.check_in_time).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      <Camera className="h-4 w-4 mr-1 text-muted-foreground" />
                      {record.camera?.name || "Unknown Camera"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {record.location || "Unknown Location"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-muted rounded-full h-2 mr-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.round(
                              record.confidence_score * 100,
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(record.confidence_score * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredAttendance.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm
              ? "No attendance records found"
              : "No attendance records yet"}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Attendance records will appear here once users start checking in."}
          </p>
        </div>
      )}

      {/* Results Count */}
      {filteredAttendance.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredAttendance.length} of {attendance.length} attendance
          records
        </div>
      )}
    </div>
  );
}
