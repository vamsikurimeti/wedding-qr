import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../models/user.model';

// Create a mock Auth object that mimics Firebase Auth
export const mockAuthInstance = {
  currentUser: null as any,
  onAuthStateChanged: (callback: any) => {
     // Mock implementation if needed, but we mainly need currentUser property
     return () => {};
  },
  signOut: () => Promise.resolve()
};

@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check localStorage for persisted user
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.currentUserSubject.next(user);

      // Also update the mock Auth instance
      mockAuthInstance.currentUser = {
        uid: user.id,
        email: user.email,
        getIdToken: () => Promise.resolve('mock-token')
      };
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Method to make guard happy
  getCurrentUser(): User | null {
      return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role || false;
  }

  isSuperAdmin(): boolean {
    return this.hasRole(UserRole.SUPER_ADMIN);
  }

  isPlatformAdmin(): boolean {
    return this.hasRole(UserRole.PLATFORM_ADMIN);
  }

  isEventAdmin(): boolean {
    return this.hasRole(UserRole.EVENT_ADMIN);
  }

  login(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      // Mock validation
      if (password.length < 6) {
        reject(new Error('Password must be at least 6 characters'));
        return;
      }

      let user: User;
      if (email.includes('super')) {
        user = {
          id: 'user-1',
          email,
          role: UserRole.SUPER_ADMIN,
          displayName: 'Super Admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else if (email.includes('platform')) {
        user = {
          id: 'user-2',
          email,
          role: UserRole.PLATFORM_ADMIN,
          displayName: 'Platform Admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          storageUsed: 1.5,
          storageLimit: 10
        } as any;
      } else {
         user = {
          id: 'user-3',
          email,
          role: UserRole.EVENT_ADMIN,
          displayName: 'Event Admin',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      this.updateUser(user);
      resolve(user);
    });
  }

  signup(email: string, password: string, displayName: string): Promise<User> {
     return new Promise((resolve) => {
        const user: User = {
            id: `user-${Date.now()}`,
            email,
            role: UserRole.EVENT_ADMIN, // Default role
            displayName,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.updateUser(user);
        resolve(user);
     });
  }

  logout(): Promise<void> {
    this.updateUser(null);
    return Promise.resolve();
  }

  private updateUser(user: User | null) {
    this.currentUserSubject.next(user);
    if (user) {
      localStorage.setItem('mockUser', JSON.stringify(user));
      // Update mock auth instance
      mockAuthInstance.currentUser = {
          uid: user.id,
          email: user.email,
          getIdToken: () => Promise.resolve('mock-token')
      };
    } else {
      localStorage.removeItem('mockUser');
      mockAuthInstance.currentUser = null;
    }
  }

  // Helper to simulate token for interceptor (not really used in mock auth but good for compatibility)
  async getIdToken(): Promise<string> {
    return 'mock-token';
  }
}
