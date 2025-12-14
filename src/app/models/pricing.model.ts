export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  storageLimit: number; // in GB
  price: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
