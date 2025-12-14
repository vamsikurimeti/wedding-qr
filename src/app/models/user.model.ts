export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  PLATFORM_ADMIN = 'platform_admin',
  EVENT_ADMIN = 'event_admin',
  GUEST = 'guest'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformAdmin extends User {
  role: UserRole.PLATFORM_ADMIN;
  storageUsed: number; // in GB
  storageLimit: number; // in GB
  planId?: string;
}

export interface EventAdmin extends User {
  role: UserRole.EVENT_ADMIN;
  eventIds: string[];
}
