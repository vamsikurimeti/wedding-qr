import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PricingPlan } from '../models/pricing.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PricingService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/super-admin/pricing-plans`;

  getPricingPlans(): Observable<PricingPlan[]> {
    return this.http.get<{ plans: any[] }>(this.baseUrl).pipe(
      map(response => response.plans.map(plan => this.mapBackendPlanToFrontend(plan)))
    );
  }

  getPricingPlan(planId: string): Observable<PricingPlan> {
    return this.http.get<any>(`${this.baseUrl}/${planId}`).pipe(
      map(plan => this.mapBackendPlanToFrontend(plan))
    );
  }

  createPricingPlan(plan: Partial<PricingPlan>): Observable<PricingPlan> {
    const backendPlan = this.mapFrontendPlanToBackend(plan);
    return this.http.post<any>(this.baseUrl, backendPlan).pipe(
      map(plan => this.mapBackendPlanToFrontend(plan))
    );
  }

  updatePricingPlan(planId: string, plan: Partial<PricingPlan>): Observable<PricingPlan> {
    const backendPlan = this.mapFrontendPlanToBackend(plan);
    return this.http.put<any>(`${this.baseUrl}/${planId}`, backendPlan).pipe(
      map(plan => this.mapBackendPlanToFrontend(plan))
    );
  }

  deletePricingPlan(planId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${planId}`);
  }

  // Map frontend model to backend format
  private mapFrontendPlanToBackend(plan: Partial<PricingPlan>): any {
    const backendPlan: any = {
      name: plan.name,
      storageLimitGB: plan.storageLimit,
      isActive: plan.isActive !== undefined ? plan.isActive : true
    };

    // Price is optional in backend
    if (plan.price !== undefined && plan.price !== null) {
      backendPlan.price = plan.price;
    }

    // Features array - use description if provided
    if (plan.description) {
      backendPlan.features = [plan.description];
    } else {
      backendPlan.features = [];
    }

    return backendPlan;
  }

  // Map backend format to frontend model
  private mapBackendPlanToFrontend(plan: any): PricingPlan {
    // Helper to convert Firestore timestamp or date string to Date
    const toDate = (dateValue: any): Date => {
      if (!dateValue) return new Date();
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate();
      }
      if (dateValue._seconds) {
        return new Date(dateValue._seconds * 1000);
      }
      return new Date(dateValue);
    };

    return {
      id: plan.id,
      name: plan.name,
      description: plan.features && plan.features.length > 0 ? plan.features[0] : '',
      storageLimit: plan.storageLimitGB || 0,
      price: plan.price || 0,
      currency: plan.currency || 'USD',
      isActive: plan.isActive !== undefined ? plan.isActive : true,
      createdAt: toDate(plan.createdAt),
      updatedAt: toDate(plan.updatedAt)
    };
  }
}
