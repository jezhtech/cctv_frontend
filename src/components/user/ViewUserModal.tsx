import {
  X,
  User,
  Mail,
  Phone,
  Building,
  IdCard,
  UserCheck,
  UserX,
  Image as ImageIcon,
  Star,
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import type { User as UserType } from "@/lib/api/user";

interface ViewUserModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewUserModal({ user, isOpen, onClose }: ViewUserModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">User Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* User Header with Profile Image */}
          <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
              {user.profile_images && user.profile_images.length > 0 ? (
                <img
                  src={getImageUrl(
                    user.profile_images.find((img) => img.is_primary)
                      ?.filename || user.profile_images[0].filename,
                    user.profile_images
                      .find((img) => img.is_primary)
                      ?.content_type?.split("/")[1] || "jpeg"
                  )}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-medium text-primary">
                  {user.first_name[0]}
                  {user.last_name[0]}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {user.first_name} {user.last_name}
              </h3>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                {user.is_active ? (
                  <div className="flex items-center text-green-600">
                    <UserCheck className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <UserX className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Inactive</span>
                  </div>
                )}
                {user.is_verified && (
                  <div className="flex items-center text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                    <span className="text-sm">Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Personal Information
              </h4>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Name:</span> {user.first_name}{" "}
                    {user.last_name}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Email:</span> {user.email}
                  </span>
                </div>

                {user.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Phone:</span> {user.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Work Information
              </h4>

              <div className="space-y-2">
                {user.employee_id && (
                  <div className="flex items-center space-x-2">
                    <IdCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Employee ID:</span>{" "}
                      {user.employee_id}
                    </span>
                  </div>
                )}

                {user.department && (
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Department:</span>{" "}
                      {user.department}
                    </span>
                  </div>
                )}

                {user.position && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Position:</span>{" "}
                      {user.position}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Images */}
          {user.profile_images && user.profile_images.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center">
                <ImageIcon className="h-4 w-4 mr-2" />
                Profile Images ({user.profile_images.length})
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {user.profile_images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={getImageUrl(
                        image.filename,
                        image.content_type?.split("/")[1] || "jpeg"
                      )}
                      alt={`Profile ${index + 1}`}
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
                          fallback.innerHTML = `<span class="text-lg font-medium text-primary">${user.first_name[0]}${user.last_name[0]}</span>`;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                    {image.is_primary && (
                      <div className="absolute top-2 left-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {image.is_primary ? "Primary" : `${index + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Images Message */}
          {(!user.profile_images || user.profile_images.length === 0) && (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No profile images uploaded yet
              </p>
            </div>
          )}

          {/* System Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
              System Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Created:</span>{" "}
                {new Date(user.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{" "}
                {new Date(user.updated_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                {user.is_active ? "Active" : "Inactive"}
              </div>
              <div>
                <span className="font-medium">Verification:</span>{" "}
                {user.is_verified ? "Verified" : "Not Verified"}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
