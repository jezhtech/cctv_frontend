import { useNavigate } from "react-router-dom";
import {
  Play,
  Trash2,
  Edit,
  WifiOff,
  StopCircle,
  Eye,
  LoaderCircleIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Camera, StreamStatus } from "@/types";
import { cameraService, streamingService } from "@/services";
import { useState } from "react";
import { Button } from "../ui/button";

interface CameraCardProps {
  camera: Camera;
  streamStatus?: StreamStatus;
  onStreamChange: () => Promise<void>;
  onEdit: (camera: Camera) => void;
  onDelete: (cameraId: string) => void;
}

export function CameraCard({
  camera,
  streamStatus,
  onStreamChange,
  onEdit,
  onDelete,
}: CameraCardProps) {
  const navigate = useNavigate();
  const isStreamActive =
    streamStatus && "is_running" in streamStatus && streamStatus.is_running;
  const [isLoading, setIsLoading] = useState(false);

  const handleViewStream = () => {
    navigate(`/camera/stream/${camera.id}`);
  };

  const handleStartStream = async (cameraId: string) => {
    setIsLoading(true);
    try {
      await cameraService.startCameraStream(cameraId);
      await onStreamChange();
    } catch (error) {
      console.error("Failed to start stream:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopStream = async (cameraId: string) => {
    setIsLoading(true);
    try {
      await cameraService.stopCameraStream(cameraId);
      await onStreamChange();
    } catch (error) {
      console.error("Failed to stop stream:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Camera Header */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{camera.name}</h3>
          <div>
            <p className="text-xs text-muted-foreground mt-1">
              {camera.ip_address}:{camera.port}
              {camera.path ? camera.path : ""}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{camera.location}</p>
      </div>

      {/* Camera Preview Placeholder */}
      <div className="aspect-video bg-muted flex items-center justify-center">
        {isStreamActive ? (
          <div className="aspect-video bg-black overflow-hidden">
            <img
              src={streamingService.getMJPEGStreamUrl(camera.id)}
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
          <div className="text-center">
            <WifiOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No Stream</p>
          </div>
        )}
      </div>

      {/* Camera Info */}
      <div className="p-3">
        {isStreamActive && streamStatus && "frame_count" in streamStatus && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Frames:</span>
            <span className="font-medium">
              {streamStatus.frame_count.toLocaleString()}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          {isStreamActive ? (
            <Button
              onClick={() => handleStopStream(camera.id)}
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            >
              {isLoading && (
                <LoaderCircleIcon className={cn("size-5 mr-1 animate-spin")} />
              )}
              {!isLoading && (
                <>
                  <StopCircle className="h-4 w-4 mr-1" />
                  Stop
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => handleStartStream(camera.id)}
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              {isLoading && (
                <LoaderCircleIcon className={cn("size-5 mr-1 animate-spin")} />
              )}
              {!isLoading && (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </>
              )}
            </Button>
          )}

          <button
            onClick={handleViewStream}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            <Eye className="h-4 w-4 mr-1" />
            View Stream
          </button>

          <button
            onClick={() => onEdit(camera)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDelete(camera.id)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
