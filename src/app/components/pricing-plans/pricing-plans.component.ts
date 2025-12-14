import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';
import { PricingService } from '../../services/pricing.service';
import { PricingPlan } from '../../models/pricing.model';

@Component({
  selector: 'app-pricing-plans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LayoutComponent],
  templateUrl: './pricing-plans.component.html',
  styleUrl: './pricing-plans.component.scss'
})
export class PricingPlansComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pricingService = inject(PricingService);
  private router = inject(Router);

  plans: PricingPlan[] = [];
  isLoading: boolean = false;
  showForm: boolean = false;
  planForm: FormGroup;
  editingPlan: PricingPlan | null = null;

  constructor() {
    this.planForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      storageLimit: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      currency: ['USD', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.isLoading = true;
    this.pricingService.getPricingPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        this.isLoading = false;
      }
    });
  }

  openCreateForm() {
    this.editingPlan = null;
    this.planForm.reset({
      name: '',
      description: '',
      storageLimit: 0,
      price: 0,
      currency: 'USD',
      isActive: true
    });
    this.showForm = true;
  }

  openEditForm(plan: PricingPlan) {
    this.editingPlan = plan;
    this.planForm.patchValue(plan);
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingPlan = null;
    this.planForm.reset();
  }

  onSubmit() {
    if (this.planForm.invalid) {
      return;
    }

    const planData = this.planForm.value;

    if (this.editingPlan) {
      this.pricingService.updatePricingPlan(this.editingPlan.id, planData).subscribe({
        next: () => {
          this.loadPlans();
          this.closeForm();
        },
        error: (error) => console.error('Error updating plan:', error)
      });
    } else {
      this.pricingService.createPricingPlan(planData).subscribe({
        next: () => {
          this.loadPlans();
          this.closeForm();
        },
        error: (error) => console.error('Error creating plan:', error)
      });
    }
  }

  deletePlan(planId: string) {
    if (confirm('Are you sure you want to delete this pricing plan?')) {
      this.pricingService.deletePricingPlan(planId).subscribe({
        next: () => this.loadPlans(),
        error: (error) => console.error('Error deleting plan:', error)
      });
    }
  }
}
