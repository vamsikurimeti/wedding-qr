export interface Event {
  id: string;
  name: string;
  description?: string;
  platformAdminId: string;
  eventAdminIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  qrCodes: QRCode[];
  storageUsed: number; // in GB
}

export interface QRCode {
  id: string;
  eventId: string;
  name: string;
  token: string; // Unique token for guest access
  rules: QRRules;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  scanCount: number;
}

export interface QRRules {
  anyoneCanViewGallery: boolean;
  anyoneCanUpload: boolean;
  uploadRequiresApproval: boolean;
  nameRequired: boolean;
  phoneRequired: 'none' | 'optional' | 'mandatory';
  downloadAllowed: boolean;
}
