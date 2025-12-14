import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';
import { UserService } from '../../services/user.service';
import { PricingService } from '../../services/pricing.service';
import { User } from '../../models/user.model';
import { PricingPlan } from '../../models/pricing.model';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.scss'
})
export class SuperAdminDashboardComponent implements OnInit {
  private userService = inject(UserService);
  private pricingService = inject(PricingService);

  users: User[] = [];
  pricingPlans: PricingPlan[] = [];
  isLoading: boolean = false;
  activeTab: 'users' | 'pricing' = 'users';

  ngOnInit() {
    this.loadUsers();
    this.loadPricingPlans();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

  loadPricingPlans() {
    this.pricingService.getPricingPlans().subscribe({
      next: (plans) => {
        this.pricingPlans = plans;
      },
      error: (error) => {
        console.error('Error loading pricing plans:', error);
      }
    });
  }

  toggleUserStatus(user: User) {
    if (user.isActive) {
      this.userService.disableUser(user.id).subscribe({
        next: () => this.loadUsers(),
        error: (error) => console.error('Error disabling user:', error)
      });
    } else {
      this.userService.enableUser(user.id).subscribe({
        next: () => this.loadUsers(),
        error: (error) => console.error('Error enabling user:', error)
      });
    }
  }

  setActiveTab(tab: 'users' | 'pricing') {
    this.activeTab = tab;
  }
}
