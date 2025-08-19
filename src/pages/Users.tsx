import { useEffect, useState } from "react";
import {
  Users as UsersIcon,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  UserCheck,
  UserX,
  ImageIcon,
} from "lucide-react";
import { userService } from "@/services";
import { cn, getImageUrl } from "@/lib/utils";
import type { User } from "@/lib/api/user";
import { AddUserModal, ViewUserModal, EditUserModal } from "@/components";

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userService.deleteUser(userId);
        await fetchUsers();
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleUserAdded = () => {
    fetchUsers();
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditUserModal(true);
  };

  const closeModals = () => {
    setShowAddUserModal(false);
    setShowViewUserModal(false);
    setShowEditUserModal(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterActive === null || user.is_active === filterActive;

    return matchesSearch && matchesFilter;
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
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage system users and their permissions
          </p>
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterActive(null)}
            className={cn(
              "px-3 py-2 text-sm rounded-md transition-colors",
              filterActive === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilterActive(true)}
            className={cn(
              "px-3 py-2 text-sm rounded-md transition-colors",
              filterActive === true
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            Active
          </button>
          <button
            onClick={() => setFilterActive(false)}
            className={cn(
              "px-3 py-2 text-sm rounded-md transition-colors",
              filterActive === false
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                        {user.profile_images &&
                        user.profile_images.length > 0 ? (
                          <img
                            src={getImageUrl(
                              user.profile_images.find((img) => img.is_primary)
                                ?.filename || user.profile_images[0].filename
                            , user.profile_images.find((img) => img.is_primary)
                                ?.content_type?.split("/")[1] || "jpeg")}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement("span");
                                fallback.className =
                                  "text-sm font-medium text-primary";
                                fallback.textContent = `${user.first_name[0]}${user.last_name[0]}`;
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-sm font-medium text-primary">
                            {user.first_name[0]}
                            {user.last_name[0]}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {user.employee_id || "N/A"}
                        </div>
                        {user.profile_images &&
                          user.profile_images.length > 0 && (
                            <div className="text-xs text-muted-foreground flex items-center mt-1">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              {user.profile_images.length} image
                              {user.profile_images.length !== 1 ? "s" : ""}
                            </div>
                          )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{user.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.phone || "No phone"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {user.department || "No department"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.position || "No position"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {user.is_active ? (
                        <div className="flex items-center text-green-600">
                          <UserCheck className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <UserX className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Inactive</span>
                        </div>
                      )}
                      {user.is_verified && (
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          title="Verified"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                        title="View user details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm || filterActive !== null
              ? "No users found"
              : "No users yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterActive !== null
              ? "Try adjusting your search or filters."
              : "Get started by adding your first user to the system."}
          </p>
          {!searchTerm && filterActive === null && (
            <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </button>
          )}
        </div>
      )}

      {/* Results Count */}
      {filteredUsers.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      )}

      <AddUserModal
        isOpen={showAddUserModal}
        onClose={closeModals}
        onUserAdded={handleUserAdded}
      />
      <ViewUserModal
        isOpen={showViewUserModal}
        onClose={closeModals}
        user={selectedUser}
      />
      <EditUserModal
        isOpen={showEditUserModal}
        onClose={closeModals}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}
