import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { Event } from '../../models/event.model';
import { PlatformAdmin, User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-platform-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent],
  templateUrl: './platform-admin-dashboard.component.html',
  styleUrl: './platform-admin-dashboard.component.scss'
})
export class PlatformAdminDashboardComponent implements OnInit {
  private eventService = inject(EventService);
  private authService = inject(AuthService);

  events: Event[] = [];
  isLoading: boolean = false;
  user: User | null = null;
  canCreateEvents: boolean = false;

  ngOnInit() {
    this.loadEvents();
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      // Check if user can create events (platform_admin or super_admin)
      this.canCreateEvents = user ? 
        (user.role === UserRole.PLATFORM_ADMIN || user.role === UserRole.SUPER_ADMIN) : 
        false;
      
      if (user && user.role === 'platform_admin') {
        // Cast to PlatformAdmin for type safety
        this.user = user as PlatformAdmin;
      }
    });
  }

  loadEvents() {
    this.isLoading = true;
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.isLoading = false;
      }
    });
  }

  deleteEvent(eventId: string) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(eventId).subscribe({
        next: () => this.loadEvents(),
        error: (error) => console.error('Error deleting event:', error)
      });
    }
  }

  getStoragePercentage(): number {
    if (!this.user) return 0;
    const platformAdmin = this.user as PlatformAdmin;
    if (!platformAdmin.storageLimit || platformAdmin.storageLimit === 0) return 0;
    return ((platformAdmin.storageUsed || 0) / platformAdmin.storageLimit) * 100;
  }

  getStorageUsed(): number {
    if (!this.user || this.user.role !== 'platform_admin') return 0;
    return (this.user as PlatformAdmin).storageUsed || 0;
  }

  getStorageLimit(): number {
    if (!this.user || this.user.role !== 'platform_admin') return 0;
    return (this.user as PlatformAdmin).storageLimit || 0;
  }

  getActiveEventsCount(): number {
    return this.events.filter(e => e.isActive).length;
  }
}
