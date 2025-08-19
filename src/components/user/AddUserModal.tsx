import { useState, useRef } from "react";
import { X, User, Upload, Trash2, Save, Loader2 } from "lucide-react";
import { userService } from "@/services";
import type { UserCreate } from "@/lib/api/user";
import { cn } from "@/lib/utils";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

export function AddUserModal({
  isOpen,
  onClose,
  onUserAdded,
}: AddUserModalProps) {
  const [formData, setFormData] = useState<UserCreate>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department: "",
    employee_id: "",
    position: "",
    password: "",
  });
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof UserCreate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check if we already have 5 images
      if (images.length + newImages.length >= 5) break;

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

        setImages((prev) => [...prev, imageFile]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
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

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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

    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({}); // Clear previous errors

      // Generate image names upfront
      let profileImages = undefined;
      if (images.length > 0) {
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8); // 6 random chars

        profileImages = images.map((img, index) => ({
          id: `img_${timestamp}_${index + 1}_${randomSuffix}`,
          filename: `img_${String(index + 1).padStart(
            3,
            "0"
          )}_${timestamp}_${randomSuffix}`,
          is_primary: index === 0, // First image is primary
          uploaded_at: new Date().toISOString(),
          size: 0, // Will be updated after upload
          content_type: img.file.type, // Will be updated after upload
        }));
      }

      // Create user with pre-assigned image names
      const userDataWithImages = {
        ...formData,
        profile_images: profileImages,
      };

      const newUser = await userService.createUser(userDataWithImages);

      // Upload images if any
      if (images.length > 0) {
        try {
          console.log(
            `Uploading ${images.length} images for user ${newUser.id}`
          );

          // Upload each image with its pre-assigned name
          for (let i = 0; i < images.length; i++) {
            const imageName = profileImages![i].filename;
            console.log(`Uploading image ${i + 1} with name: ${imageName}`);
            await userService.uploadProfileImage(
              newUser.id,
              images[i].file,
              imageName
            );
            console.log(`Successfully uploaded image ${i + 1}`);
          }

          console.log(`Successfully uploaded ${images.length} images`);
        } catch (error: any) {
          console.error(`Failed to upload images: ${error}`);
          // Show image upload error but don't fail the entire operation
          setErrors((prev) => ({
            ...prev,
            general: `User created but failed to upload images: ${
              error.message || "Unknown error"
            }`,
          }));
        }
      }

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        department: "",
        employee_id: "",
        position: "",
        password: "",
      });
      setImages([]);
      setErrors({});

      onUserAdded();
      onClose();
    } catch (error: any) {
      console.error("Failed to create user:", error);

      // Handle different types of errors
      let errorMessage = "Failed to create user";

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
        } else if (error.message.includes("password")) {
          setErrors({ password: error.message });
          return;
        } else if (
          error.message.includes("first_name") ||
          error.message.includes("First name")
        ) {
          setErrors({ first_name: error.message });
          return;
        } else if (
          error.message.includes("last_name") ||
          error.message.includes("Last name")
        ) {
          setErrors({ last_name: error.message });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Add New User</h2>
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

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={cn(
                "w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                errors.password ? "border-red-500" : "border-border"
              )}
              placeholder="Enter password"
              disabled={loading}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Profile Images (Max 5)
            </label>
            <div className="space-y-4">
              {/* Upload Button */}
              {images.length < 5 && (
                <div
                  onClick={openFileDialog}
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click to upload images
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 5MB each. Max 5 images.
                  </p>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
