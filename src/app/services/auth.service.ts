import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private http = inject(HttpClient);
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch user data from backend
          const user = await this.fetchUserData(firebaseUser.uid);
          this.currentUserSubject.next(user);
        } catch (error) {
          // If user doesn't exist, try auto-registration
          console.log('User not found in Firestore, attempting auto-registration...');
          try {
            const token = await firebaseUser.getIdToken();
            await this.selfRegister(token);
            const user = await this.fetchUserData(firebaseUser.uid);
            this.currentUserSubject.next(user);
          } catch (regError) {
            console.error('Failed to auto-register user:', regError);
            // Don't set user if registration fails
            this.currentUserSubject.next(null);
          }
        }
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = await this.fetchUserData(userCredential.user.uid);
      this.currentUserSubject.next(user);
      return user;
    } catch (error: any) {
      // If user doesn't exist in Firestore, try auto-registration
      if (error?.error?.error === 'User not found in database' || error?.status === 404) {
        try {
          const firebaseUser = this.auth.currentUser;
          if (firebaseUser) {
            const token = await firebaseUser.getIdToken();
            await this.selfRegister(token);
            // Retry fetching user data
            const user = await this.fetchUserData(firebaseUser.uid);
            this.currentUserSubject.next(user);
            return user;
          }
        } catch (regError) {
          // If auto-registration fails, throw original error
          throw error;
        }
      }
      throw error;
    }
  }

  async signup(email: string, password: string, displayName: string): Promise<User> {
    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      
      // Get Firebase token
      const token = await userCredential.user.getIdToken();
      
      // Auto-register in Firestore
      await this.selfRegister(token, displayName);
      
      // Fetch user data
      const user = await this.fetchUserData(userCredential.user.uid);
      this.currentUserSubject.next(user);
      return user;
    } catch (error: any) {
      // Provide user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please sign in instead.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      }
      throw new Error(error.message || 'Signup failed. Please try again.');
    }
  }

  private async selfRegister(token: string, displayName?: string): Promise<void> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const body: any = {};
    if (displayName) {
      body.displayName = displayName;
    }

    try {
      await this.http.post(`${environment.apiUrl}/users/self-register`, body, { headers }).toPromise();
    } catch (error: any) {
      // If user already exists, that's okay
      if (error?.error?.error !== 'User document already exists') {
        throw error;
      }
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

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

  private async fetchUserData(uid: string): Promise<User> {
    try {
      // Get current Firebase token
      const firebaseUser = this.auth.currentUser;
      if (!firebaseUser) {
        throw new Error('Not authenticated');
      }

      const token = await firebaseUser.getIdToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Call backend API to get user data
      const response = await this.http.get<User>(`${environment.apiUrl}/users/${uid}`, { headers }).toPromise();
      if (!response) {
        throw new Error('Failed to fetch user data');
      }
      return response;
    } catch (error: any) {
      // If user doesn't exist in Firestore, try auto-registration
      if (error?.error?.error === 'User not found in database' || error?.status === 404 || error?.status === 403) {
        const firebaseUser = this.auth.currentUser;
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          await this.selfRegister(token);
          // Retry fetching user data
          const response = await this.http.get<User>(`${environment.apiUrl}/users/${uid}`, {
            headers: new HttpHeaders({
              'Authorization': `Bearer ${token}`
            })
          }).toPromise();
          if (!response) {
            throw new Error('Failed to fetch user data after registration');
          }
          return response;
        }
      }
      throw error;
    }
  }

  // Guest token validation (no Firebase auth)
  async validateGuestToken(token: string): Promise<{ qrCodeId: string; eventId: string; rules: any }> {
    const response = await this.http.get<{ qrCodeId: string; eventId: string; rules: any }>(
      `${environment.apiUrl}/qr/validate/${token}`
    ).toPromise();
    if (!response) {
      throw new Error('Invalid token');
    }
    return response;
  }
}
