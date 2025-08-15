import {
  Play,
  Trash2,
  Edit,
  Wifi,
  WifiOff,
  StopCircle,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Camera, StreamStatus } from "@/lib/api/camera";

interface CameraCardProps {
  camera: Camera;
  streamStatus?: StreamStatus;
  onStartStream: (cameraId: string) => void;
  onStopStream: (cameraId: string) => void;
  onEdit: (camera: Camera) => void;
  onDelete: (cameraId: string) => void;
}

export function CameraCard({
  camera,
  streamStatus,
  onStartStream,
  onStopStream,
  onEdit,
  onDelete,
}: CameraCardProps) {
  const navigate = useNavigate();
  const isStreamActive = streamStatus && "is_running" in streamStatus && streamStatus.is_running;

  const handleViewStream = () => {
    navigate(`/camera/stream/${camera.id}`);
  };

  return (
    <div className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Camera Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">{camera.name}</h3>
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              camera.is_active ? "bg-green-500" : "bg-red-500"
            )}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {camera.location}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {camera.ip_address}:{camera.port}{camera.path ? camera.path : ''}
        </p>
      </div>

      {/* Camera Preview Placeholder */}
      <div className="aspect-video bg-muted flex items-center justify-center">
        {isStreamActive ? (
          <div className="text-center">
            <Wifi className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Stream Active</p>
            {streamStatus && "fps" in streamStatus && (
              <p className="text-xs text-muted-foreground">
                {streamStatus.fps.toFixed(1)} FPS
              </p>
            )}
          </div>
        ) : (
          <div className="text-center">
            <WifiOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No Stream</p>
          </div>
        )}
      </div>

      {/* Camera Info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Frame Rate:</span>
          <span className="font-medium">{camera.frame_rate} FPS</span>
        </div>

        {isStreamActive &&
          streamStatus &&
          "frame_count" in streamStatus && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Frames:</span>
              <span className="font-medium">
                {streamStatus.frame_count.toLocaleString()}
              </span>
            </div>
          )}

        {isStreamActive &&
          streamStatus &&
          "faces_detected" in streamStatus && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Faces Detected:
              </span>
              <span className="font-medium">
                {streamStatus.faces_detected}
              </span>
            </div>
          )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          {isStreamActive ? (
            <button
              onClick={() => onStopStream(camera.id)}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
            >
              <StopCircle className="h-4 w-4 mr-1" />
              Stop
            </button>
          ) : (
            <button
              onClick={() => onStartStream(camera.id)}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </button>
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
