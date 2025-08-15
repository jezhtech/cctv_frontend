import { cameraApi, type Camera, type CameraCreate, type CameraUpdate, type StreamStatus } from "@/lib/api/camera";

export interface CameraFilters {
  location?: string;
  isActive?: boolean;
  frameRate?: number;
}

export interface CameraStats {
  total: number;
  active: number;
  inactive: number;
  byLocation: Record<string, number>;
  averageFrameRate: number;
}

export class CameraService {
  // Get all cameras with optional filtering
  async getAllCameras(filters?: CameraFilters): Promise<Camera[]> {
    try {
      const response = await cameraApi.getCameras({ limit: 1000 });
      let cameras = response.data;

      // Apply filters
      if (filters?.location) {
        cameras = cameras.filter(camera => 
          camera.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters?.isActive !== undefined) {
        cameras = cameras.filter(camera => camera.is_active === filters.isActive);
      }

      if (filters?.frameRate) {
        cameras = cameras.filter(camera => camera.frame_rate >= filters.frameRate!);
      }

      return cameras;
    } catch (error) {
      console.error("Failed to fetch cameras:", error);
      throw error;
    }
  }

  // Get camera by ID
  async getCameraById(id: string): Promise<Camera> {
    try {
      return await cameraApi.getCamera(id);
    } catch (error) {
      console.error(`Failed to fetch camera ${id}:`, error);
      throw error;
    }
  }

  // Create new camera
  async createCamera(cameraData: CameraCreate): Promise<Camera> {
    try {
      // Validate camera data
      this.validateCameraData(cameraData);
      
      return await cameraApi.createCamera(cameraData);
    } catch (error) {
      console.error("Failed to create camera:", error);
      throw error;
    }
  }

  // Update camera
  async updateCamera(id: string, updateData: CameraUpdate): Promise<Camera> {
    try {
      // Validate update data
      if (updateData.frame_rate && updateData.frame_rate <= 0) {
        throw new Error("Frame rate must be greater than 0");
      }

      return await cameraApi.updateCamera(id, updateData);
    } catch (error) {
      console.error(`Failed to update camera ${id}:`, error);
      throw error;
    }
  }

  // Delete camera
  async deleteCamera(id: string): Promise<void> {
    try {
      // Check if camera is currently streaming
      const streamStatus = await this.getCameraStreamStatus(id);
      if (streamStatus && typeof streamStatus === 'object' && 'is_running' in streamStatus && streamStatus.is_running) {
        throw new Error("Cannot delete camera while it's streaming");
      }

      await cameraApi.deleteCamera(id);
    } catch (error) {
      console.error(`Failed to delete camera ${id}:`, error);
      throw error;
    }
  }

  // Start camera stream
  async startCameraStream(id: string): Promise<void> {
    try {
      const camera = await this.getCameraById(id);
      if (!camera.is_active) {
        throw new Error("Cannot start stream for inactive camera");
      }

      await cameraApi.startCameraStream(id);
    } catch (error) {
      console.error(`Failed to start stream for camera ${id}:`, error);
      throw error;
    }
  }

  // Stop camera stream
  async stopCameraStream(id: string): Promise<void> {
    try {
      await cameraApi.stopCameraStream(id);
    } catch (error) {
      console.error(`Failed to stop stream for camera ${id}:`, error);
      throw error;
    }
  }

  // Get camera stream status
  async getCameraStreamStatus(id: string): Promise<StreamStatus | { message: string }> {
    try {
      return await cameraApi.getCameraStreamStatus(id);
    } catch (error) {
      console.error(`Failed to get stream status for camera ${id}:`, error);
      throw error;
    }
  }

  // Get all streams status
  async getAllStreamsStatus(): Promise<Record<string, StreamStatus>> {
    try {
      const response = await cameraApi.getAllStreamsStatus();
      return response.streams;
    } catch (error) {
      console.error("Failed to get all streams status:", error);
      throw error;
    }
  }

  // Get cameras by location
  async getCamerasByLocation(location: string): Promise<Camera[]> {
    try {
      return await cameraApi.getCamerasByLocation(location);
    } catch (error) {
      console.error(`Failed to get cameras by location ${location}:`, error);
      throw error;
    }
  }

  // Get active cameras
  async getActiveCameras(): Promise<Camera[]> {
    try {
      return await cameraApi.getActiveCameras();
    } catch (error) {
      console.error("Failed to get active cameras:", error);
      throw error;
    }
  }

  // Bulk update camera status
  async bulkUpdateCameraStatus(cameraIds: string[], isActive: boolean): Promise<void> {
    try {
      if (cameraIds.length === 0) {
        throw new Error("No camera IDs provided");
      }

      await cameraApi.bulkUpdateStatus(cameraIds, isActive);
    } catch (error) {
      console.error("Failed to bulk update camera status:", error);
      throw error;
    }
  }

  // Get camera statistics
  async getCameraStats(): Promise<CameraStats> {
    try {
      const cameras = await this.getAllCameras();
      
      const total = cameras.length;
      const active = cameras.filter(c => c.is_active).length;
      const inactive = total - active;
      
      const byLocation: Record<string, number> = {};
      cameras.forEach(camera => {
        byLocation[camera.location] = (byLocation[camera.location] || 0) + 1;
      });

      const totalFrameRate = cameras.reduce((sum, camera) => sum + camera.frame_rate, 0);
      const averageFrameRate = total > 0 ? totalFrameRate / total : 0;

      return {
        total,
        active,
        inactive,
        byLocation,
        averageFrameRate: Math.round(averageFrameRate * 100) / 100
      };
    } catch (error) {
      console.error("Failed to get camera statistics:", error);
      throw error;
    }
  }

  // Validate camera data
  private validateCameraData(data: CameraCreate): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Camera name is required");
    }

    if (!data.ip_address || data.ip_address.trim().length === 0) {
      throw new Error("Camera IP address is required");
    }

    if (!data.port || data.port <= 0 || data.port > 65535) {
      throw new Error("Camera port must be between 1 and 65535");
    }

    if (!data.location || data.location.trim().length === 0) {
      throw new Error("Camera location is required");
    }

    if (data.frame_rate <= 0) {
      throw new Error("Frame rate must be greater than 0");
    }

    if (data.frame_rate > 60) {
      throw new Error("Frame rate cannot exceed 60 FPS");
    }
  }

  // Check if camera is streaming
  async isCameraStreaming(id: string): Promise<boolean> {
    try {
      const status = await this.getCameraStreamStatus(id);
      return status && typeof status === 'object' && 'is_running' in status && status.is_running;
    } catch (error) {
      console.error(`Failed to check streaming status for camera ${id}:`, error);
      return false;
    }
  }

  // Get camera health status
  async getCameraHealthStatus(id: string): Promise<{
    isOnline: boolean;
    isStreaming: boolean;
    lastSeen?: string;
    errors?: string[];
  }> {
    try {
      const camera = await this.getCameraById(id);
      const streamStatus = await this.getCameraStreamStatus(id);
      
      const isStreaming = streamStatus && typeof streamStatus === 'object' && 'is_running' in streamStatus && streamStatus.is_running;
      const lastSeen = streamStatus && typeof streamStatus === 'object' && 'last_frame_time' in streamStatus ? streamStatus.last_frame_time : undefined;
      
      const errors: string[] = [];
      if (streamStatus && typeof streamStatus === 'object' && 'errors_count' in streamStatus && streamStatus.errors_count > 0) {
        errors.push(`Stream errors: ${streamStatus.errors_count}`);
      }

      return {
        isOnline: camera.is_active,
        isStreaming,
        lastSeen,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error(`Failed to get health status for camera ${id}:`, error);
      return {
        isOnline: false,
        isStreaming: false,
        errors: ["Failed to connect to camera"]
      };
    }
  }
}

// Export singleton instance
export const cameraService = new CameraService();

