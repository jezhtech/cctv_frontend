import {
  userApi,
  type User,
  type UserCreate,
  type UserUpdate,
  type ProfileImageResponse,
} from "@/lib/api/user";

export interface UserFilters {
  department?: string;
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  unverified: number;
  byDepartment: Record<string, number>;
  byPosition: Record<string, number>;
}

export interface UserSearchResult {
  users: User[];
  total: number;
  hasMore: boolean;
}

export class UserService {
  // Get all users with optional filtering
  async getAllUsers(filters?: UserFilters): Promise<User[]> {
    try {
      const response = await userApi.getUsers({ limit: 1000 });
      let users = response.data;

      // Apply filters
      if (filters?.department) {
        users = users.filter((user) =>
          user.department
            ?.toLowerCase()
            .includes(filters.department!.toLowerCase())
        );
      }

      if (filters?.isActive !== undefined) {
        users = users.filter((user) => user.is_active === filters.isActive);
      }

      if (filters?.isVerified !== undefined) {
        users = users.filter((user) => user.is_verified === filters.isVerified);
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        users = users.filter(
          (user) =>
            user.first_name.toLowerCase().includes(searchLower) ||
            user.last_name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.employee_id?.toLowerCase().includes(searchLower)
        );
      }

      return users;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    try {
      return await userApi.getUser(id);
    } catch (error) {
      console.error(`Failed to fetch user ${id}:`, error);
      throw error;
    }
  }

  // Create new user
  async createUser(userData: UserCreate): Promise<User> {
    try {
      // Validate user data
      this.validateUserData(userData);

      return await userApi.createUser(userData);
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  }

  // Update user
  async updateUser(id: string, updateData: UserUpdate): Promise<User> {
    try {
      // Validate update data
      if (updateData.email) {
        this.validateEmail(updateData.email);
      }

      return await userApi.updateUser(id, updateData);
    } catch (error) {
      console.error(`Failed to update user ${id}:`, error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    try {
      // Check if user has active attendance records
      // This would typically be done by checking with the attendance service
      // For now, we'll just proceed with deletion

      await userApi.deleteUser(id);
    } catch (error) {
      console.error(`Failed to delete user ${id}:`, error);
      throw error;
    }
  }

  // Search users
  async searchUsers(
    query: string,
    filters?: Omit<UserFilters, "search">
  ): Promise<UserSearchResult> {
    try {
      const response = await userApi.searchUsers(query);
      let users = response;

      // Apply additional filters
      if (filters?.department) {
        users = users.filter((user) =>
          user.department
            ?.toLowerCase()
            .includes(filters.department!.toLowerCase())
        );
      }

      if (filters?.isActive !== undefined) {
        users = users.filter((user) => user.is_active === filters.isActive);
      }

      if (filters?.isVerified !== undefined) {
        users = users.filter((user) => user.is_verified === filters.isVerified);
      }

      return {
        users,
        total: users.length,
        hasMore: false, // Since we're not paginating search results
      };
    } catch (error) {
      console.error("Failed to search users:", error);
      throw error;
    }
  }

  // Get users by department
  async getUsersByDepartment(department: string): Promise<User[]> {
    try {
      return await userApi.getUsersByDepartment(department);
    } catch (error) {
      console.error(`Failed to get users by department ${department}:`, error);
      throw error;
    }
  }

  // Get active users
  async getActiveUsers(): Promise<User[]> {
    try {
      return await userApi.getActiveUsers();
    } catch (error) {
      console.error("Failed to get active users:", error);
      throw error;
    }
  }

  // Get verified users
  async getVerifiedUsers(): Promise<User[]> {
    try {
      return await userApi.getVerifiedUsers();
    } catch (error) {
      console.error("Failed to get verified users:", error);
      throw error;
    }
  }

  // Bulk update user status
  async bulkUpdateUserStatus(
    userIds: string[],
    isActive: boolean
  ): Promise<void> {
    try {
      if (userIds.length === 0) {
        throw new Error("No user IDs provided");
      }

      await userApi.bulkUpdateStatus(userIds, isActive);
    } catch (error) {
      console.error("Failed to bulk update user status:", error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(): Promise<UserStats> {
    try {
      const users = await this.getAllUsers();

      const total = users.length;
      const active = users.filter((u) => u.is_active).length;
      const inactive = total - active;
      const verified = users.filter((u) => u.is_verified).length;
      const unverified = total - verified;

      const byDepartment: Record<string, number> = {};
      const byPosition: Record<string, number> = {};

      users.forEach((user) => {
        if (user.department) {
          byDepartment[user.department] =
            (byDepartment[user.department] || 0) + 1;
        }
        if (user.position) {
          byPosition[user.position] = (byPosition[user.position] || 0) + 1;
        }
      });

      return {
        total,
        active,
        inactive,
        verified,
        unverified,
        byDepartment,
        byPosition,
      };
    } catch (error) {
      console.error("Failed to get user statistics:", error);
      throw error;
    }
  }

  // Update user avatar
  async updateUserAvatar(id: string, avatarFile: File): Promise<string> {
    try {
      // Validate file
      this.validateAvatarFile(avatarFile);

      const result = await userApi.updateUserAvatar(id, avatarFile);
      return result.avatar_url;
    } catch (error) {
      console.error(`Failed to update avatar for user ${id}:`, error);
      throw error;
    }
  }

  // Upload profile image
  async uploadProfileImage(
    userId: string,
    imageFile: File,
    imageName: string
  ): Promise<ProfileImageResponse> {
    try {
      // Validate file
      this.validateAvatarFile(imageFile);

      return await userApi.uploadProfileImage(userId, imageFile, imageName);
    } catch (error) {
      console.error(`Failed to upload profile image for user ${userId}:`, error);
      throw error;
    }
  }



  // Get user profile images
  async getUserProfileImages(userId: string): Promise<{
    images: ProfileImageResponse[];
    total: number;
    primary_image?: ProfileImageResponse;
  }> {
    try {
      return await userApi.getUserProfileImages(userId);
    } catch (error) {
      console.error(`Failed to get profile images for user ${userId}:`, error);
      throw error;
    }
  }

  // Delete profile image
  async deleteProfileImage(userId: string, imageId: string): Promise<void> {
    try {
      await userApi.deleteProfileImage(userId, imageId);
    } catch (error) {
      console.error(`Failed to delete profile image ${imageId} for user ${userId}:`, error);
      throw error;
    }
  }

  // Set primary profile image
  async setPrimaryProfileImage(
    userId: string,
    imageId: string
  ): Promise<ProfileImageResponse> {
    try {
      return await userApi.setPrimaryProfileImage(userId, imageId);
    } catch (error) {
      console.error(`Failed to set primary profile image ${imageId} for user ${userId}:`, error);
      throw error;
    }
  }

  // Reset user password
  async resetUserPassword(id: string): Promise<void> {
    try {
      await userApi.resetUserPassword(id);
    } catch (error) {
      console.error(`Failed to reset password for user ${id}:`, error);
      throw error;
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.searchUsers(email);
      const user = users.users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      return user || null;
    } catch (error) {
      console.error(`Failed to get user by email ${email}:`, error);
      return null;
    }
  }

  // Get user by employee ID
  async getUserByEmployeeId(employeeId: string): Promise<User | null> {
    try {
      const users = await this.getAllUsers();
      const user = users.find((u) => u.employee_id === employeeId);
      return user || null;
    } catch (error) {
      console.error(`Failed to get user by employee ID ${employeeId}:`, error);
      return null;
    }
  }

  // Validate user data
  private validateUserData(data: UserCreate): void {
    if (!data.first_name || data.first_name.trim().length === 0) {
      throw new Error("First name is required");
    }

    if (!data.last_name || data.last_name.trim().length === 0) {
      throw new Error("Last name is required");
    }

    if (!data.email || data.email.trim().length === 0) {
      throw new Error("Email is required");
    }

    this.validateEmail(data.email);

    if (!data.password || data.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    if (data.phone && !this.validatePhone(data.phone)) {
      throw new Error("Invalid phone number format");
    }
  }

  // Validate email format
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }
  }

  // Validate phone number format
  private validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
  }

  // Validate avatar file
  private validateAvatarFile(file: File): void {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Avatar must be a JPEG, PNG, or GIF image");
    }

    if (file.size > maxSize) {
      throw new Error("Avatar file size must be less than 5MB");
    }
  }

  // Check if user exists
  async userExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) return false;

      // If excluding a specific user (for updates), check if it's the same user
      if (excludeId && user.id === excludeId) return false;

      return true;
    } catch (error) {
      console.error("Failed to check if user exists:", error);
      return false;
    }
  }

  // Get user full name
  getUserFullName(user: User): string {
    return `${user.first_name} ${user.last_name}`.trim();
  }

  // Get user initials
  getUserInitials(user: User): string {
    const first = user.first_name.charAt(0).toUpperCase();
    const last = user.last_name.charAt(0).toUpperCase();
    return `${first}${last}`;
  }
}

// Export singleton instance
export const userService = new UserService();
