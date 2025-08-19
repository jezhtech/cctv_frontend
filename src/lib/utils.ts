import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getImageUrl = (filename: string, extension: string) => {
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename; // Already a full URL
  }
  // Construct URL from filename
  return `${
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"
  }/uploads/users/${filename}.${extension}`;
};
