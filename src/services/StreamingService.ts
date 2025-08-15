import { cameraApi, type StreamStatus } from "@/lib/api/camera";

export interface StreamMetrics {
  total_streams: number;
  active_streams: number;
  streams: Record<string, StreamStatus>;
}

export class StreamingService {
  // Start a camera stream
  async startStream(cameraId: string): Promise<{ success: boolean; message: string; camera_id: string }> {
    try {
      return await cameraApi.startCameraStream(cameraId);
    } catch (error) {
      console.error(`Failed to start stream for camera ${cameraId}:`, error);
      throw error;
    }
  }

  // Stop a camera stream
  async stopStream(cameraId: string): Promise<{ success: boolean; message: string; camera_id: string }> {
    try {
      return await cameraApi.stopCameraStream(cameraId);
    } catch (error) {
      console.error(`Failed to stop stream for camera ${cameraId}:`, error);
      throw error;
    }
  }

  // Get stream status for a specific camera
  async getStreamStatus(cameraId: string): Promise<StreamStatus | { message: string }> {
    try {
      return await cameraApi.getCameraStreamStatus(cameraId);
    } catch (error) {
      console.error(`Failed to get stream status for camera ${cameraId}:`, error);
      throw error;
    }
  }

  // Get all streams status
  async getAllStreamsStatus(): Promise<StreamMetrics> {
    try {
      return await cameraApi.getAllStreamsStatus();
    } catch (error) {
      console.error("Failed to get all streams status:", error);
      throw error;
    }
  }

  // Stop all active streams
  async stopAllStreams(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/streams/stop-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Failed to stop all streams:", error);
      throw error;
    }
  }

  // Get MJPEG stream URL for a camera
  getMJPEGStreamUrl(cameraId: string): string {
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/streams/${cameraId}/mjpeg`;
  }

  // Get latest frame URL for a camera
  getLatestFrameUrl(cameraId: string): string {
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/streams/${cameraId}/latest-frame`;
  }

  // Check if a stream is active
  async isStreamActive(cameraId: string): Promise<boolean> {
    try {
      const status = await this.getStreamStatus(cameraId);
      return status && typeof status === "object" && "is_running" in status && status.is_running;
    } catch (error) {
      console.error(`Failed to check streaming status for camera ${cameraId}:`, error);
      return false;
    }
  }

  // Get stream performance metrics
  async getStreamPerformance(cameraId: string): Promise<{
    fps: number;
    frame_count: number;
    uptime_seconds: number;
    errors_count: number;
    performance_metrics?: StreamStatus['performance_metrics'];
  } | null> {
    try {
      const status = await this.getStreamStatus(cameraId);
      if (status && typeof status === "object" && "is_running" in status) {
        return {
          fps: status.fps || 0,
          frame_count: status.frame_count || 0,
          uptime_seconds: status.uptime_seconds || 0,
          errors_count: status.errors_count || 0,
          performance_metrics: status.performance_metrics,
        };
      }
      return null;
    } catch (error) {
      console.error(`Failed to get performance metrics for camera ${cameraId}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const streamingService = new StreamingService();
