import { ApiClient } from "./client";

// Types
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  employee_id?: string;
  position?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  employee_id?: string;
  position?: string;
  password: string;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  department?: string;
  employee_id?: string;
  position?: string;
  is_active?: boolean;
  is_verified?: boolean;
}

export interface UserSearchParams {
  skip?: number;
  limit?: number;
  search?: string;
  department?: string;
  is_active?: boolean;
  is_verified?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export class UserApi extends ApiClient {
  // Get all users with pagination and search
  async getUsers(params?: UserSearchParams): Promise<PaginatedResponse<User>> {
    return this.get<PaginatedResponse<User>>("/users", params);
  }

  // Get a single user by ID
  async getUser(id: string): Promise<User> {
    return this.get<User>(`/users/${id}`);
  }

  // Create a new user
  async createUser(data: UserCreate): Promise<User> {
    return this.post<User>("/users", data);
  }

  // Update an existing user
  async updateUser(id: string, data: UserUpdate): Promise<User> {
    return this.put<User>(`/users/${id}`, data);
  }

  // Delete a user
  async deleteUser(id: string): Promise<void> {
    return this.delete<void>(`/users/${id}`);
  }

  // Get users by department
  async getUsersByDepartment(department: string): Promise<User[]> {
    return this.get<User[]>("/users", { department });
  }

  // Get active users only
  async getActiveUsers(): Promise<User[]> {
    return this.get<User[]>("/users", { is_active: true });
  }

  // Get verified users only
  async getVerifiedUsers(): Promise<User[]> {
    return this.get<User[]>("/users", { is_verified: true });
  }

  // Search users by name or email
  async searchUsers(query: string): Promise<User[]> {
    return this.get<User[]>("/users", { search: query });
  }

  // Bulk update user status
  async bulkUpdateStatus(
    userIds: string[],
    isActive: boolean
  ): Promise<{ message: string; updated_count: number }> {
    return this.put<{ message: string; updated_count: number }>(
      "/users/bulk-update-status",
      { user_ids: userIds, is_active: isActive }
    );
  }

  // Get user statistics
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    by_department: Record<string, number>;
  }> {
    return this.get<{
      total: number;
      active: number;
      inactive: number;
      verified: number;
      unverified: number;
      by_department: Record<string, number>;
    }>("/users/stats");
  }

  // Update user avatar
  async updateUserAvatar(id: string, avatarFile: File): Promise<{ avatar_url: string }> {
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    
    return this.request({
      method: "PUT",
      url: `/users/${id}/avatar`,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // Reset user password
  async resetUserPassword(id: string): Promise<{ message: string }> {
    return this.post<{ message: string }>(`/users/${id}/reset-password`);
  }
}

// Export singleton instance
export const userApi = new UserApi();
