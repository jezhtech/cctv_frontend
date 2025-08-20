import { useState } from "react";
import { X, Camera as CameraIcon, MapPin, Settings, Save, Loader2 } from "lucide-react";
import { cameraService } from "@/services";
import type { CameraCreate } from "@/lib/api/camera";
import { cn } from "@/lib/utils";

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCameraAdded: () => void;
}

export function AddCameraModal({ isOpen, onClose, onCameraAdded }: AddCameraModalProps) {
  const [formData, setFormData] = useState<CameraCreate>({
    name: "",
    location: "",
    ip_address: "",
    port: 554,
    path: "",
    frame_rate: 30,
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CameraCreate, value: any) => {

    if (field === "port") {
      //can also enter empty string
      const isNum = /^[0-9]+$/.test(value) || value === "";
      if (!isNum) {
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Camera name is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.ip_address.trim()) {
      newErrors.ip_address = "IP address is required";
    }

    if (formData.port < 1 || formData.port > 65535) {
      newErrors.port = "Port must be between 1 and 65535";
    }

    if (formData.frame_rate < 1 || formData.frame_rate > 60) {
      newErrors.frame_rate = "Frame rate must be between 1 and 60 FPS";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      console.log(formData);
      await cameraService.createCamera(formData);
      onCameraAdded();
      onClose();
      // Reset form
      setFormData({
        name: "",
        location: "",
        ip_address: "",
        port: 554,
        path: "",
        frame_rate: 30,
        username: "",
        password: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Failed to create camera:", error);
      setErrors({ submit: "Failed to create camera. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.ip_address.trim()) {
      setErrors({ ip_address: "IP address is required to test connection" });
      return;
    }

    try {
      setTestingConnection(true);
      setConnectionTestResult(null);
      
      // Basic IP address validation
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(formData.ip_address)) {
        setConnectionTestResult({
          success: false,
          message: "Invalid IP address format. Must be in 'xxx.xxx.xxx.xxx' format."
        });
        return;
      }

      // Show the constructed RTSP URL
      const rtspUrl = formData.username && formData.password 
        ? `rtsp://${formData.username}:${formData.password}@${formData.ip_address}:${formData.port}${formData.path || ''}`
        : `rtsp://${formData.ip_address}:${formData.port}${formData.path || ''}`;

      setConnectionTestResult({
        success: true,
        message: `RTSP URL constructed: ${rtspUrl}\n\nNote: This is just format validation. The backend will test the actual connection.`
      });
    } catch (error) {
      setConnectionTestResult({
        success: false,
        message: "Failed to test connection. Please check your settings."
      });
    } finally {
      setTestingConnection(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <CameraIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Add New Camera</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Camera Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Camera Name *
            </label>
            <div className="relative">
              <CameraIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  errors.name ? "border-red-500" : "border-border"
                )}
                placeholder="e.g., Main Entrance Camera"
                disabled={loading}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  errors.location ? "border-red-500" : "border-border"
                )}
                placeholder="e.g., Main Entrance, Building A"
                disabled={loading}
              />
            </div>
            {errors.location && (
              <p className="text-sm text-red-500 mt-1">{errors.location}</p>
            )}
          </div>

          {/* IP Address */}
          <div>
            <label className="block text-sm font-medium mb-2">
              IP Address *
            </label>
            <input
              type="text"
              value={formData.ip_address}
              onChange={(e) => handleInputChange("ip_address", e.target.value)}
              className={cn(
                "w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                errors.ip_address ? "border-red-500" : "border-border"
              )}
              placeholder="192.168.1.100"
              disabled={loading}
            />
            {errors.ip_address && (
              <p className="text-sm text-red-500 mt-1">{errors.ip_address}</p>
            )}
          </div>

          {/* Port */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Port *
            </label>
            <input
              value={formData.port}
              onChange={(e) => handleInputChange("port", e.target.value)}
              className={cn(
                "w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                errors.port ? "border-red-500" : "border-border"
              )}
              min="1"
              max="65535"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Default RTSP port is 554
            </p>
            {errors.port && (
              <p className="text-sm text-red-500 mt-1">{errors.port}</p>
            )}
          </div>

          {/* Path */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Path (optional)
            </label>
            <input
              type="text"
              value={formData.path}
              onChange={(e) => handleInputChange("path", e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="/h264.sdp or /stream"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Optional RTSP path (e.g., /h264.sdp, /stream)
            </p>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="RTSP username"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="RTSP password"
              disabled={loading}
            />
          </div>

          {/* Frame Rate */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Frame Rate (FPS)
            </label>
            <div className="relative">
              <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                value={formData.frame_rate}
                onChange={(e) => handleInputChange("frame_rate", parseInt(e.target.value) || 30)}
                className={cn(
                  "w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  errors.frame_rate ? "border-red-500" : "border-border"
                )}
                min="1"
                max="60"
                disabled={loading}
              />
            </div>
            {errors.frame_rate && (
              <p className="text-sm text-red-500 mt-1">{errors.frame_rate}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={true}
              disabled
              className="rounded border-border focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              Camera will be active by default
            </label>
          </div>

          {/* Test Connection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Test Connection
            </label>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConnection || loading || !formData.ip_address.trim()}
              className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testingConnection ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                "Test RTSP Connection"
              )}
            </button>
            {connectionTestResult && (
              <div className={cn(
                "mt-2 p-2 rounded-md text-sm",
                connectionTestResult.success 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : "bg-red-50 text-red-700 border border-red-200"
              )}>
                {connectionTestResult.message}
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-sm text-red-500 text-center">{errors.submit}</p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Camera
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
