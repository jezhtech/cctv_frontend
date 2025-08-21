import {
  Play,
  Wifi,
  WifiOff,
  Activity,
  RotateCcw,
  StopCircle,
  User,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { cameraService, streamingService } from "@/services";
import type { Camera, StreamStatus } from "@/lib/api/camera";
import { Button } from "@/components/ui/button";
import { GoBack } from "@/components/go-back";

// Interface for face detection data
interface FaceDetection {
  timestamp: string;
  user_name?: string;
  user_id?: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Interface for face detection results from API
interface FaceDetectionResults {
  recent_detections: FaceDetection[];
  total_faces_detected: number;
  total_faces_recognized: number;
  recognition_accuracy: number;
  active_faces_count: number;
  last_recognition_time?: string;
}

export function CameraStream() {
  const { cameraId } = useParams<{ cameraId: string }>();
  const navigate = useNavigate();
  const [camera, setCamera] = useState<Camera | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);
  
  // New state for face detections
  const [faceDetections, setFaceDetections] = useState<FaceDetectionResults | null>(null);
  const [detectionLoading, setDetectionLoading] = useState(false);
  const [lastDetectionCount, setLastDetectionCount] = useState(0);
  const [showNewDetectionAlert, setShowNewDetectionAlert] = useState(false);

  useEffect(() => {
    if (cameraId) {
      loadCameraData();
      loadStreamStatus();

      // Poll stream status every 2 seconds
      const statusInterval = setInterval(loadStreamStatus, 2000);
      
      // Poll face detections every 1 second when stream is active
      let detectionInterval: NodeJS.Timeout;
      if (isStreamActive) {
        detectionInterval = setInterval(loadFaceDetections, 1000);
      }

      return () => {
        clearInterval(statusInterval);
        if (detectionInterval) {
          clearInterval(detectionInterval);
        }
      };
    }
  }, [cameraId, isStreamActive]);

  // Effect to start/stop detection polling when stream status changes
  useEffect(() => {
    if (isStreamActive && cameraId) {
      // Load initial detections
      loadFaceDetections();
      // Set up polling interval
      const detectionInterval = setInterval(loadFaceDetections, 1000);
      return () => clearInterval(detectionInterval);
    } else {
      // Reset detection state when stream stops
      setFaceDetections(null);
      setLastDetectionCount(0);
      setShowNewDetectionAlert(false);
    }
  }, [isStreamActive, cameraId]);

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

  const loadFaceDetections = async () => {
    if (!isStreamActive || !cameraId) return;
    
    try {
      setDetectionLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/streams/${cameraId}/face-detections`);
      
      if (response.ok) {
        const data: FaceDetectionResults = await response.json();
        
        // Check for new detections
        if (lastDetectionCount > 0 && data.recent_detections.length > lastDetectionCount) {
          setShowNewDetectionAlert(true);
          // Auto-hide alert after 3 seconds
          setTimeout(() => setShowNewDetectionAlert(false), 3000);
        }
        
        setLastDetectionCount(data.recent_detections.length);
        setFaceDetections(data);
      }
    } catch (err) {
      console.error("Failed to load face detections:", err);
    } finally {
      setDetectionLoading(false);
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
      // Clear face detections when stream stops
      setFaceDetections(null);
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
    if (isStreamActive) {
      loadFaceDetections();
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch {
      return "Unknown";
    }
  };

  // Get confidence color based on value
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-500";
    if (confidence >= 0.6) return "text-yellow-500";
    return "text-red-500";
  };

  // Get confidence label
  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High";
    if (confidence >= 0.6) return "Medium";
    return "Low";
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
        <div className="flex items-center space-x-4">
          <GoBack />
          
          {/* Real-time Detection Counter */}
          {isStreamActive && faceDetections && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Target className="h-4 w-4 text-blue-600" />
                <div className="text-sm">
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {faceDetections.active_faces_count}
                  </span>
                  <span className="text-blue-700 dark:text-blue-300 ml-1">
                    active detection{faceDetections.active_faces_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              {/* View Frame with Boxes Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/streams/${cameraId}/frame-with-boxes`, '_blank')}
                className="h-8 px-3 text-xs"
              >
                <Target className="h-3 w-3 mr-1" />
                View Boxes
              </Button>
            </div>
          )}
        </div>
        
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

          {/* Real-Time Face Detections */}
          {isStreamActive && (
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <span>Real-Time Detections</span>
                    {detectionLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 ml-2"></div>
                    )}
                  </h3>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadFaceDetections}
                    disabled={detectionLoading || !isStreamActive}
                    className="h-8 px-3"
                  >
                    <RotateCcw className={cn("h-3 w-3 mr-1", detectionLoading && "animate-spin")} />
                    Refresh
                  </Button>
                </div>
              </div>
              <div className="p-4">
                {/* New Detection Alert */}
                {showNewDetectionAlert && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        New face detection detected!
                      </span>
                    </div>
                  </div>
                )}
                
                {faceDetections ? (
                  <div className="space-y-4">
                    {/* Detection Statistics */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {faceDetections.total_faces_detected}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Detected</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {faceDetections.total_faces_recognized}
                        </div>
                        <div className="text-sm text-muted-foreground">Recognized</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {faceDetections.active_faces_count}
                        </div>
                        <div className="text-sm text-muted-foreground">Active Now</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {(faceDetections.recognition_accuracy * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Accuracy</div>
                      </div>
                    </div>

                    {/* Recent Detections */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Recent Detections
                        </h4>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-muted-foreground">Live</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {faceDetections.recent_detections.length} detection{faceDetections.recent_detections.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {faceDetections.recent_detections.length > 0 ? (
                          faceDetections.recent_detections.map((detection, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-background border rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="flex items-center space-x-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center",
                                  detection.user_name 
                                    ? "bg-green-100 dark:bg-green-900" 
                                    : "bg-blue-100 dark:bg-blue-900"
                                )}>
                                  <User className={cn(
                                    "h-4 w-4",
                                    detection.user_name 
                                      ? "text-green-600" 
                                      : "text-blue-600"
                                  )} />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {detection.user_name || "Unknown Person"}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center space-x-2">
                                    <span>{formatTimestamp(detection.timestamp)}</span>
                                    {detection.user_id && (
                                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                        ID: {detection.user_id.slice(0, 8)}...
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={cn(
                                  "text-sm font-medium",
                                  getConfidenceColor(detection.confidence)
                                )}>
                                  {getConfidenceLabel(detection.confidence)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {(detection.confidence * 100).toFixed(1)}%
                                </div>
                                {/* Bounding box info */}
                                <div className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  Box: {detection.bbox.width}×{detection.bbox.height}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No detections yet</p>
                            <p className="text-xs">Faces will appear here as they are detected</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Last Recognition Time */}
                    {faceDetections.last_recognition_time && (
                      <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                        Last recognition: {formatTimestamp(faceDetections.last_recognition_time)}
                      </div>
                    )}

                    {/* System Health */}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>System Status:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-600 dark:text-green-400 font-medium">Healthy</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>Update Rate:</span>
                        <span className="font-medium">1 second</span>
                      </div>
                    </div>
                  </div>
                ) : detectionLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm">Loading detections...</p>
                    <p className="text-xs">Initializing face detection system</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No detections yet</p>
                    <p className="text-xs">Face detection data will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}
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
