import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, PlatformAdmin } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  getUser(userId: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${userId}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, user);
  }

  updateUser(userId: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${userId}`, user);
  }

  enableUser(userId: string): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users/${userId}/enable`, {});
  }

  disableUser(userId: string): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users/${userId}/disable`, {});
  }

  getPlatformAdmins(): Observable<PlatformAdmin[]> {
    return this.http.get<PlatformAdmin[]>(`${environment.apiUrl}/users/platform-admins`);
  }
}
