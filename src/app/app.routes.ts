import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { UserRole } from './models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'guest',
    loadComponent: () => import('./components/guest-qr-flow/guest-qr-flow.component').then(m => m.GuestQrFlowComponent)
  },
  {
    path: 'super-admin',
    loadComponent: () => import('./components/super-admin-dashboard/super-admin-dashboard.component').then(m => m.SuperAdminDashboardComponent),
    canActivate: [authGuard, roleGuard([UserRole.SUPER_ADMIN])]
  },
  {
    path: 'super-admin/pricing-plans',
    loadComponent: () => import('./components/pricing-plans/pricing-plans.component').then(m => m.PricingPlansComponent),
    canActivate: [authGuard, roleGuard([UserRole.SUPER_ADMIN])]
  },
  {
    path: 'super-admin/users',
    loadComponent: () => import('./components/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [authGuard, roleGuard([UserRole.SUPER_ADMIN])]
  },
  {
    path: 'platform-admin',
    loadComponent: () => import('./components/platform-admin-dashboard/platform-admin-dashboard.component').then(m => m.PlatformAdminDashboardComponent),
    canActivate: [authGuard, roleGuard([UserRole.PLATFORM_ADMIN])]
  },
  {
    path: 'events',
    loadComponent: () => import('./components/platform-admin-dashboard/platform-admin-dashboard.component').then(m => m.PlatformAdminDashboardComponent),
    canActivate: [authGuard, roleGuard([UserRole.PLATFORM_ADMIN, UserRole.EVENT_ADMIN])]
  },
  {
    path: 'events/create',
    loadComponent: () => import('./components/event-dashboard/event-dashboard.component').then(m => m.EventDashboardComponent),
    canActivate: [authGuard, roleGuard([UserRole.PLATFORM_ADMIN])]
  },
  {
    path: 'events/:id',
    loadComponent: () => import('./components/event-dashboard/event-dashboard.component').then(m => m.EventDashboardComponent),
    canActivate: [authGuard, roleGuard([UserRole.PLATFORM_ADMIN, UserRole.EVENT_ADMIN])]
  },
  {
    path: 'events/:eventId/qr/create',
    loadComponent: () => import('./components/qr-creation/qr-creation.component').then(m => m.QRCreationComponent),
    canActivate: [authGuard, roleGuard([UserRole.PLATFORM_ADMIN, UserRole.EVENT_ADMIN])]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
