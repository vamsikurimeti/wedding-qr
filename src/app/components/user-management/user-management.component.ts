import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';
import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);

  users: User[] = [];
  isLoading: boolean = false;

  ngOnInit() {
    this.loadUsers();
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

  getRoleDisplayName(role: UserRole): string {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
