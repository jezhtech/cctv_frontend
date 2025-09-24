import { Users, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { DUMMY_USERS } from "@/constants/dashboard";

export function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
              trend === "up" ? "text-green-500" : "text-red-500",
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

  const getCategory = (age: number) => {
    if (age < 18) return "Child";
    if (age >= 18 && age < 65) return "Adult";
    return "Senior";
  };

  const categoryCounts = DUMMY_USERS.reduce(
    (acc, user) => {
      const category = getCategory(user.age);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const totalPages = Math.ceil(DUMMY_USERS.length / pageSize);
  const paginatedUsers = DUMMY_USERS.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of public attendance</p>
      </div>

      {/* User Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="No. of Males"
          value={DUMMY_USERS.filter((u) => u.gender === "Male").length}
          icon={Users}
        />
        <StatCard
          title="No. of Females"
          value={DUMMY_USERS.filter((u) => u.gender === "Female").length}
          icon={Users}
        />
        <StatCard
          title="Childrens"
          value={categoryCounts.Child || 0}
          icon={Users}
        />
      </div>

      {/* People Overview Table */}
      <div className="bg-card border rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold">People Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  ID
                </th>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Gender
                </th>
                <th scope="col" className="px-6 py-3">
                  Age
                </th>
                <th scope="col" className="px-6 py-3">
                  Category
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="bg-card border-b last:border-none">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-foreground whitespace-nowrap"
                  >{`PER00${user.id}`}</th>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.gender}</td>
                  <td className="px-6 py-4">{user.age}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        {
                          "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300":
                            getCategory(user.age) === "Child",
                          "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300":
                            getCategory(user.age) === "Adult",
                          "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300":
                            getCategory(user.age) === "Senior",
                        },
                      )}
                    >
                      {getCategory(user.age)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end space-x-2 p-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium bg-muted/50 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium bg-muted/50 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
