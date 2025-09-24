import type { User } from "./user";

export interface FaceDetection {
  id: string;
  camera_id: string;
  timestamp: string;
  confidence_score: number;
  face_bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks: {
    x: number;
    y: number;
  }[];
  recognized_user?: User;
  recognition_confidence: number;
  face_image_url: string;
  full_frame_url: string;
}

export interface FaceDetectionResults {
  recent_detections: FaceDetection[];
  total_faces_detected: number;
  total_faces_recognized: number;
  recognition_accuracy: number;
  active_faces_count: number;
  last_recognition_time?: string;
}
