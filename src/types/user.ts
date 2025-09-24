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
