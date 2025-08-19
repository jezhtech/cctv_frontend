import {
  Play,
  Wifi,
  WifiOff,
  Activity,
  RotateCcw,
  StopCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { cameraService, streamingService } from "@/services";
import type { Camera, StreamStatus } from "@/lib/api/camera";
import { Button } from "@/components/ui/button";
import { GoBack } from "@/components/go-back";

export function CameraStream() {
  const { cameraId } = useParams<{ cameraId: string }>();
  const navigate = useNavigate();
  const [camera, setCamera] = useState<Camera | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);

  useEffect(() => {
    if (cameraId) {
      loadCameraData();
      loadStreamStatus();

      // Poll stream status every 2 seconds
      const interval = setInterval(loadStreamStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [cameraId]);

  const loadCameraData = async () => {
    try {
      setIsLoading(true);
      const cameraData = await cameraService.getCameraById(cameraId!);
      setCamera(cameraData);
    } catch (err) {
      setError("Failed to load camera data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStreamStatus = async () => {
    try {
      const status = await streamingService.getStreamStatus(cameraId!);
      if (status && typeof status === "object" && "is_running" in status) {
        setStreamStatus(status);
        setIsStreamActive(status.is_running);
      }
    } catch (err: any) {
      if (isStreamActive && "Stream not found" === err.message) {
        setIsStreamActive(false);
      }
    }
  };

  const handleStartStream = async () => {
    try {
      setStreamLoading(true);
      await streamingService.startStream(cameraId!);
    } catch (err) {
      console.error("Failed to start stream:", err);
      setError("Failed to start camera stream");
    } finally {
      setStreamLoading(false);
    }
  };

  const handleStopStream = async () => {
    try {
      setStreamLoading(true);
      await streamingService.stopStream(cameraId!);
      loadStreamStatus();
    } catch (err) {
      console.error("Failed to stop stream:", err);
      setError("Failed to stop camera stream");
    } finally {
      setStreamLoading(false);
    }
  };

  const handleRefresh = () => {
    loadCameraData();
    loadStreamStatus();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading camera stream...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !camera) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Camera not found"}</p>
          <button
            onClick={() => navigate("/cameras")}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Cameras
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <GoBack />
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          {isStreamActive ? (
            <Button
              variant="destructive"
              onClick={handleStopStream}
              disabled={streamLoading}
            >
              {streamLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <StopCircle className="h-4 w-4 mr-2" />
              )}
              {streamLoading ? "Stopping..." : "Stop Stream"}
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={handleStartStream}
              disabled={streamLoading}
            >
              {streamLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {streamLoading ? "Starting..." : "Start Stream"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Stream */}
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                {isStreamActive ? (
                  <Wifi className="h-5 w-5 text-green-500" />
                ) : (
                  <WifiOff className="h-5 w-5 text-muted-foreground" />
                )}
                <span>Live Stream</span>
                <span
                  className={cn(
                    "px-2 py-1 text-xs rounded-full font-medium",
                    isStreamActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  )}
                >
                  {isStreamActive ? "Active" : "Inactive"}
                </span>
              </h2>
            </div>
            <div className="p-4">
              {isStreamActive ? (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <img
                    src={streamingService.getMJPEGStreamUrl(cameraId!)}
                    alt="Live Camera Stream"
                    className="w-full h-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                    onError={(e) => {
                      console.error("Failed to load video stream");
                      e.currentTarget.style.display = "none";
                    }}
                    onLoad={() => {
                      console.log("Video stream loaded successfully");
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <WifiOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">
                      No active stream
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click "Start Stream" to begin streaming
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stream Information */}
        <div className="space-y-6">
          {/* Camera Details */}
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Camera Details</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={cn(
                    "px-2 py-1 text-xs rounded-full font-medium",
                    camera.is_active
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  )}
                >
                  {camera.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IP Address:</span>
                <span className="font-mono text-sm">{camera.ip_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Port:</span>
                <span className="font-mono text-sm">{camera.port}</span>
              </div>
              {camera.path && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Path:</span>
                  <span className="font-mono text-sm">{camera.path}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frame Rate:</span>
                <span>{camera.frame_rate} FPS</span>
              </div>
            </div>
          </div>

          {/* Stream Status */}
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Stream Status</h3>
            </div>
            <div className="p-4 space-y-3">
              {streamStatus ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span
                      className={cn(
                        "px-2 py-1 text-xs rounded-full font-medium",
                        isStreamActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      )}
                    >
                      {isStreamActive ? "Running" : "Stopped"}
                    </span>
                  </div>

                  {isStreamActive && (
                    <>
                      <div className="border-t pt-3 mt-3 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Frames:</span>
                          <span>
                            {streamStatus.frame_count?.toLocaleString() || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">FPS:</span>
                          <span>{streamStatus.fps || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Uptime:</span>
                          <span>
                            {streamStatus.uptime_seconds
                              ? `${Math.round(streamStatus.uptime_seconds)}s`
                              : "0s"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Errors:</span>
                          <span
                            className={
                              streamStatus.errors_count &&
                              streamStatus.errors_count > 0
                                ? "text-red-500"
                                : ""
                            }
                          >
                            {streamStatus.errors_count || 0}
                          </span>
                        </div>
                        {streamStatus.performance_metrics && (
                          <>
                            <div className="border-t pt-3 mt-3">
                              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                                <Activity className="h-4 w-4 mr-2" />
                                Performance
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Avg Frame Time:
                                  </span>
                                  <span>
                                    {
                                      streamStatus.performance_metrics
                                        .avg_frame_time_ms
                                    }
                                    ms
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Max Frame Time:
                                  </span>
                                  <span>
                                    {
                                      streamStatus.performance_metrics
                                        .max_frame_time_ms
                                    }
                                    ms
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Min Frame Time:
                                  </span>
                                  <span>
                                    {
                                      streamStatus.performance_metrics
                                        .min_frame_time_ms
                                    }
                                    ms
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                        {streamStatus.processor_type && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Processor:
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                              {streamStatus.processor_type}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No stream data available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
