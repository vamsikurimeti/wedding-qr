import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Event, QRCode, QRRules } from '../models/event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);

  getEvents(): Observable<Event[]> {
    return this.http.get<{ events: Event[] }>(`${environment.apiUrl}/events`).pipe(
      map(response => response.events || [])
    );
  }

  getEvent(eventId: string): Observable<Event> {
    return this.http.get<Event>(`${environment.apiUrl}/events/${eventId}`);
  }

  createEvent(event: Partial<Event>): Observable<Event> {
    return this.http.post<Event>(`${environment.apiUrl}/events`, event);
  }

  updateEvent(eventId: string, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${environment.apiUrl}/events/${eventId}`, event);
  }

  deleteEvent(eventId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/events/${eventId}`);
  }

  assignEventAdmin(eventId: string, adminId: string): Observable<Event> {
    return this.http.post<Event>(`${environment.apiUrl}/events/${eventId}/admins`, { adminId });
  }

  removeEventAdmin(eventId: string, adminId: string): Observable<Event> {
    return this.http.delete<Event>(`${environment.apiUrl}/events/${eventId}/admins/${adminId}`);
  }

  // QR Code Management
  createQRCode(eventId: string, name: string, rules: QRRules): Observable<QRCode> {
    return this.http.post<QRCode>(`${environment.apiUrl}/events/${eventId}/qr-codes`, { name, rules });
  }

  updateQRCode(eventId: string, qrCodeId: string, updates: Partial<QRCode>): Observable<QRCode> {
    return this.http.put<QRCode>(`${environment.apiUrl}/events/${eventId}/qr-codes/${qrCodeId}`, updates);
  }

  deleteQRCode(eventId: string, qrCodeId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/events/${eventId}/qr-codes/${qrCodeId}`);
  }

  getQRCodes(eventId: string): Observable<QRCode[]> {
    return this.http.get<QRCode[]>(`${environment.apiUrl}/events/${eventId}/qr-codes`);
  }

  getQRCodeByToken(token: string): Observable<QRCode> {
    return this.http.get<QRCode>(`${environment.apiUrl}/qr-codes/token/${token}`);
  }
}
