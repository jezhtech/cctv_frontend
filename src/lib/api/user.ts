import { ApiClient } from "./client";

// Types
export interface ProfileImageResponse {
  id: string;
  url: string;
  is_primary: boolean;
  uploaded_at: string;
  size?: number;
  content_type?: string;
}

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
  profile_images?: Array<{
    id: string;
    filename: string;
    is_primary: boolean;
    uploaded_at: string;
    size?: number;
    content_type?: string;
  }>;
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
  profile_images?: Array<{
    id: string;
    filename: string;
    is_primary: boolean;
    uploaded_at: string;
    size?: number;
    content_type?: string;
  }>;
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

  // Upload profile image
  async uploadProfileImage(
    userId: string,
    imageFile: File,
    imageName: string
  ): Promise<ProfileImageResponse> {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("image_name", imageName);
    
    return this.request({
      method: "POST",
      url: `/users/${userId}/profile-images`,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }



  // Get user profile images
  async getUserProfileImages(userId: string): Promise<{
    images: ProfileImageResponse[];
    total: number;
    primary_image?: ProfileImageResponse;
  }> {
    return this.get(`/users/${userId}/profile-images`);
  }

  // Delete profile image
  async deleteProfileImage(userId: string, imageId: string): Promise<void> {
    return this.delete(`/users/${userId}/profile-images/${imageId}`);
  }

  // Set primary profile image
  async setPrimaryProfileImage(
    userId: string,
    imageId: string
  ): Promise<ProfileImageResponse> {
    return this.put(`/users/${userId}/profile-images/${imageId}/primary`);
  }
}

// Export singleton instance
export const userApi = new UserApi();
