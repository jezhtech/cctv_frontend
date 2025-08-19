import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosRequestConfig,
} from "axios";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const API_VERSION = "/api/v1";

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}${API_VERSION}`,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem("auth_token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  protected async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request(config);
      return response.data;
    } catch (error: any) {
      // Extract error message from different possible sources
      let errorMessage = "An error occurred";
      
      if (error.response?.data) {
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Create a more informative error
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).status = error.response?.status;
      (enhancedError as any).response = error.response;
      
      throw enhancedError;
    }
  }

  // GET request
  protected async get<T>(url: string, params?: any): Promise<T> {
    return this.request({
      method: "GET",
      url,
      params,
    });
  }

  // POST request
  protected async post<T>(url: string, data?: any): Promise<T> {
    return this.request({
      method: "POST",
      url,
      data,
    });
  }

  // PUT request
  protected async put<T>(url: string, data?: any): Promise<T> {
    return this.request({
      method: "PUT",
      url,
      data,
    });
  }

  // DELETE request
  protected async delete<T>(url: string): Promise<T> {
    return this.request({
      method: "DELETE",
      url,
    });
  }

  // Health check
  async getHealthStatus(): Promise<{
    status: string;
    timestamp: string;
    version: string;
    database: string;
  }> {
    return this.get("/health");
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
