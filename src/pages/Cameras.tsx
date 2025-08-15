import {
  Plus,
  X,
  CameraIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { cameraService } from "@/services";
import type { Camera, StreamStatus } from "@/lib/api/camera";
import { AddCameraModal, EditCameraModal, CameraCard } from "@/components";

export function Cameras() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [streamStatuses, setStreamStatuses] = useState<
    Record<string, StreamStatus>
  >({});
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [showAddCameraModal, setShowAddCameraModal] = useState(false);
  const [showEditCameraModal, setShowEditCameraModal] = useState(false);

  useEffect(() => {
    fetchCameras();
    fetchStreamStatuses();
  }, []);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const camerasData = await cameraService.getAllCameras();
      setCameras(camerasData);
    } catch (error) {
      console.error("Failed to fetch cameras:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStreamStatuses = async () => {
    try {
      const statuses = await cameraService.getAllStreamsStatus();
      setStreamStatuses(statuses);
    } catch (error) {
      console.error("Failed to fetch stream statuses:", error);
    }
  };

  const handleStartStream = async (cameraId: string) => {
    try {
      await cameraService.startCameraStream(cameraId);
      await fetchStreamStatuses();
    } catch (error) {
      console.error("Failed to start stream:", error);
    }
  };

  const handleStopStream = async (cameraId: string) => {
    try {
      await cameraService.stopCameraStream(cameraId);
      await fetchStreamStatuses();
    } catch (error) {
      console.error("Failed to stop stream:", error);
    }
  };

  const handleDeleteCamera = async (cameraId: string) => {
    if (window.confirm("Are you sure you want to delete this camera?")) {
      try {
        await cameraService.deleteCamera(cameraId);
        await fetchCameras();
      } catch (error) {
        console.error("Failed to delete camera:", error);
      }
    }
  };

  const handleCameraAdded = () => {
    fetchCameras();
  };

  const handleCameraUpdated = () => {
    fetchCameras();
  };

  const handleEditCamera = (camera: Camera) => {
    setSelectedCamera(camera);
    setShowEditCameraModal(true);
  };

  const getStreamStatus = (cameraId: string) => {
    return streamStatuses[cameraId];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cameras</h1>
          <p className="text-muted-foreground">
            Manage and monitor your camera streams
          </p>
        </div>
        <button 
          onClick={() => setShowAddCameraModal(true)}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Camera
        </button>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {cameras.map((camera) => {
          const streamStatus = getStreamStatus(camera.id);

          return (
            <CameraCard
              key={camera.id}
              camera={camera}
              streamStatus={streamStatus}
              onStartStream={handleStartStream}
              onStopStream={handleStopStream}
              onEdit={handleEditCamera}
              onDelete={handleDeleteCamera}
            />
          );
        })}
      </div>

      {/* Empty State */}
      {cameras.length === 0 && (
        <div className="text-center py-12">
          <CameraIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No cameras found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first camera to the system.
          </p>
          <button 
            onClick={() => setShowAddCameraModal(true)}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Camera
          </button>
        </div>
      )}

      {/* Stream Modal */}
      {showStreamModal && selectedCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                Camera Stream: {selectedCamera.name}
              </h2>
              <button
                onClick={() => setShowStreamModal(false)}
                className="p-2 hover:bg-accent rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
              <p className="text-muted-foreground">
                Stream preview would go here
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowStreamModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Camera Modal */}
      <AddCameraModal 
        isOpen={showAddCameraModal}
        onClose={() => setShowAddCameraModal(false)} 
        onCameraAdded={handleCameraAdded} 
      />

      {/* Edit Camera Modal */}
      <EditCameraModal
        isOpen={showEditCameraModal}
        onClose={() => setShowEditCameraModal(false)}
        camera={selectedCamera}
        onCameraUpdated={handleCameraUpdated}
      />
    </div>
  );
}
