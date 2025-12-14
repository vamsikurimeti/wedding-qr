import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser$ = this.authService.currentUser$;

  logout() {
    this.authService.logout();
  }

  get isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  get isPlatformAdmin(): boolean {
    return this.authService.isPlatformAdmin();
  }

  get isEventAdmin(): boolean {
    return this.authService.isEventAdmin();
  }
}
