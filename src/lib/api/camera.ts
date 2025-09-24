import { ApiClient } from "./client";
import type {
  Camera,
  CameraCreate,
  CameraUpdate,
  FaceDetection,
  PaginatedResponse,
  StreamStatus,
} from "@/types";

export class CameraApi extends ApiClient {
  // Get all cameras with pagination
  async getCameras(params?: {
    skip?: number;
    limit?: number;
    active_only?: boolean;
  }): Promise<PaginatedResponse<Camera>> {
    return this.get<PaginatedResponse<Camera>>("/cameras", params);
  }

  // Get a single camera by ID
  async getCamera(id: string): Promise<Camera> {
    return this.get<Camera>(`/cameras/${id}`);
  }

  // Create a new camera
  async createCamera(data: CameraCreate): Promise<Camera> {
    return this.post<Camera>("/cameras", data);
  }

  // Update an existing camera
  async updateCamera(id: string, data: CameraUpdate): Promise<Camera> {
    return this.put<Camera>(`/cameras/${id}`, data);
  }

  // Delete a camera
  async deleteCamera(id: string): Promise<void> {
    return this.delete<void>(`/cameras/${id}`);
  }

  // Start camera stream
  async startCameraStream(
    id: string
  ): Promise<{ success: boolean; message: string; camera_id: string }> {
    return this.post<{ success: boolean; message: string; camera_id: string }>(
      `/streams/${id}/start`
    );
  }

  // Stop camera stream
  async stopCameraStream(
    id: string
  ): Promise<{ success: boolean; message: string; camera_id: string }> {
    return this.post<{ success: boolean; message: string; camera_id: string }>(
      `/streams/${id}/stop`
    );
  }

  // Get camera stream status
  async getCameraStreamStatus(
    id: string
  ): Promise<StreamStatus | { message: string }> {
    return this.get<StreamStatus | { message: string }>(
      `/streams/${id}/status`
    );
  }

  // Get all streams status
  async getAllStreamsStatus(): Promise<{
    total_streams: number;
    active_streams: number;
    streams: Record<string, StreamStatus>;
  }> {
    return this.get<{
      total_streams: number;
      active_streams: number;
      streams: Record<string, StreamStatus>;
    }>("/streams/status");
  }

  // Get camera by location
  async getCamerasByLocation(location: string): Promise<Camera[]> {
    return this.get<Camera[]>("/cameras", { location });
  }

  // Get active cameras only
  async getActiveCameras(): Promise<Camera[]> {
    return this.get<Camera[]>("/cameras", { active_only: true });
  }

  // Bulk update camera status
  async bulkUpdateStatus(
    cameraIds: string[],
    isActive: boolean
  ): Promise<{ message: string; updated_count: number }> {
    return this.put<{ message: string; updated_count: number }>(
      "/cameras/bulk-update-status",
      { camera_ids: cameraIds, is_active: isActive }
    );
  }

  async getCameraDetections(id: string): Promise<FaceDetection[]> {
    return this.get<FaceDetection[]>(`/cameras/${id}/detections`);
  }
}

// Export singleton instance
export const cameraApi = new CameraApi();
