import {
  X,
  User,
  Trash2,
  Save,
  Star,
  Plus,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { cn, getImageUrl } from "@/lib/utils";
import { userService } from "@/services";
import type { User as UserType } from "@/lib/api/user";

interface EditUserModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ProfileImage {
  id: string;
  filename: string;
  is_primary: boolean;
  uploaded_at: string;
  size?: number;
  content_type?: string;
}

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onUserUpdated,
}: EditUserModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "",
    employee_id: "",
    position: "",
    is_active: true,
    is_verified: false,
  });
  const [existingImages, setExistingImages] = useState<ProfileImage[]>([]);
  const [newImages, setNewImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || "",
        department: user.department || "",
        employee_id: user.employee_id || "",
        position: user.position || "",
        is_active: user.is_active,
        is_verified: user.is_verified,
      });
      setExistingImages(user.profile_images || []);
      setNewImages([]);
      setErrors({});
    }
  }, [user]);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleNewImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const totalImages = existingImages.length + newImages.length;
    const maxNewImages = Math.max(0, 5 - totalImages);

    for (let i = 0; i < Math.min(files.length, maxNewImages); i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        const imageFile: ImageFile = {
          file,
          preview,
          id: Math.random().toString(36).substr(2, 9),
        };

        setNewImages((prev) => [...prev, imageFile]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeNewImage = (imageId: string) => {
    setNewImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const removeExistingImage = async (imageId: string) => {
    if (!user) return;

    try {
      await userService.deleteProfileImage(user.id, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error("Failed to delete image:", error);
      setErrors({ general: "Failed to delete image" });
    }
  };

  const setPrimaryImage = async (imageId: string) => {
    if (!user) return;

    try {
      await userService.setPrimaryProfileImage(user.id, imageId);
      // Update local state
      setExistingImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }))
      );
    } catch (error) {
      console.error("Failed to set primary image:", error);
      setErrors({ general: "Failed to set primary image" });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (
      formData.phone &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    try {
      setLoading(true);
      setErrors({});

      // Update user information
      await userService.updateUser(user.id, formData);

      // Upload new images if any
      if (newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          try {
            const isPrimary = existingImages.length === 0 && i === 0; // Primary if no existing images
            await userService.uploadProfileImage(
              user.id,
              newImages[i].file,
              isPrimary ? "primary" : `secondary_${i + 1}`
            );
          } catch (error: any) {
            console.error(`Failed to upload image: ${error}`);
            setErrors((prev) => ({
              ...prev,
              general: `User updated but failed to upload image ${i + 1}: ${
                error.message || "Unknown error"
              }`,
            }));
          }
        }
      }

      onUserUpdated();
      onClose();
    } catch (error: any) {
      console.error("Failed to update user:", error);

      // Handle different types of errors
      let errorMessage = "Failed to update user";

      if (error.message) {
        if (
          error.message.includes("email") ||
          error.message.includes("Email")
        ) {
          setErrors({ email: "This email is already registered" });
          return;
        } else if (
          error.message.includes("employee_id") ||
          error.message.includes("Employee ID")
        ) {
          setErrors({ employee_id: "This employee ID is already taken" });
          return;
        } else {
          errorMessage = error.message;
        }
      }

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen || !user) return null;

  const canAddMoreImages = existingImages.length + newImages.length < 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Edit User</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  handleInputChange("first_name", e.target.value)
                }
                className={cn(
                  "w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  errors.first_name ? "border-red-500" : "border-border"
                )}
                placeholder="Enter first name"
                disabled={loading}
              />
              {errors.first_name && (
                <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  errors.last_name ? "border-red-500" : "border-border"
                )}
                placeholder="Enter last name"
                disabled={loading}
              />
              {errors.last_name && (
                <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  errors.email ? "border-red-500" : "border-border"
                )}
                placeholder="Enter email address"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  errors.phone ? "border-red-500" : "border-border"
                )}
                placeholder="Enter phone number"
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Work Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Employee ID
              </label>
              <input
                type="text"
                value={formData.employee_id}
                onChange={(e) =>
                  handleInputChange("employee_id", e.target.value)
                }
                className={cn(
                  "w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  errors.employee_id ? "border-red-500" : "border-border"
                )}
                placeholder="Enter employee ID"
                disabled={loading}
              />
              {errors.employee_id && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.employee_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  handleInputChange("department", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent border-border"
                placeholder="Enter department"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Position</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => handleInputChange("position", e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent border-border"
              placeholder="Enter job position"
              disabled={loading}
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    handleInputChange("is_active", e.target.checked)
                  }
                  className="rounded border-border"
                  disabled={loading}
                />
                <span className="text-sm font-medium">Active User</span>
              </label>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_verified}
                  onChange={(e) =>
                    handleInputChange("is_verified", e.target.checked)
                  }
                  className="rounded border-border"
                  disabled={loading}
                />
                <span className="text-sm font-medium">Verified User</span>
              </label>
            </div>
          </div>

          {/* Existing Profile Images */}
          {existingImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Current Profile Images
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={getImageUrl(
                        image.filename,
                        image.content_type?.split("/")[1] || "jpeg"
                      )}
                      alt="Profile"
                      className="w-full h-24 object-cover rounded-lg border"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement("div");
                          fallback.className =
                            "w-full h-24 bg-primary/10 rounded-lg border flex items-center justify-center";
                          fallback.innerHTML = `<span class="text-lg font-medium text-primary">${formData.first_name[0]}${formData.last_name[0]}</span>`;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                    {image.is_primary && (
                      <div className="absolute top-2 left-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {!image.is_primary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(image.id)}
                          className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                          title="Set as primary"
                        >
                          <Star className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Delete image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {image.is_primary ? "Primary" : "Image"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Existing Images Message */}
          {existingImages.length === 0 && (
            <div className="text-center py-6 bg-muted/30 rounded-lg">
              <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No profile images uploaded yet
              </p>
            </div>
          )}

          {/* Add New Images */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Add New Images (Max 5 total)
            </label>
            <div className="space-y-4">
              {/* Upload Button */}
              {canAddMoreImages && (
                <div
                  onClick={openFileDialog}
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                >
                  <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click to upload new images
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 5MB each. Max{" "}
                    {5 - existingImages.length - newImages.length} more images.
                  </p>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleNewImageUpload}
                className="hidden"
              />

              {/* New Image Previews */}
              {newImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {newImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(image.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
