export interface Media {
  id: string;
  eventId: string;
  qrCodeId: string;
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'video';
  fileSize: number; // in bytes
  uploadedBy?: string; // Guest name
  uploadedByPhone?: string;
  uploadedByToken?: string; // QR token used
  isApproved: boolean;
  uploadedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

export interface MediaUploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'success' | 'error';
  error?: string;
}
