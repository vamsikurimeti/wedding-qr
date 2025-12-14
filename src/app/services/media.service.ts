import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Media, MediaUploadProgress } from '../models/media.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private storage = inject(Storage);
  private http = inject(HttpClient);

  private uploadProgressSubject = new BehaviorSubject<MediaUploadProgress[]>([]);
  public uploadProgress$ = this.uploadProgressSubject.asObservable();

  getMediaByEvent(eventId: string): Observable<Media[]> {
    return this.http.get<Media[]>(`${environment.apiUrl}/events/${eventId}/media`);
  }

  getMediaByQRCode(qrCodeId: string): Observable<Media[]> {
    return this.http.get<Media[]>(`${environment.apiUrl}/qr-codes/${qrCodeId}/media`);
  }

  getApprovedMedia(eventId: string): Observable<Media[]> {
    return this.http.get<Media[]>(`${environment.apiUrl}/events/${eventId}/media/approved`);
  }

  uploadMedia(
    eventId: string,
    qrCodeId: string,
    file: File,
    metadata: { name?: string; phone?: string; token: string }
  ): Observable<MediaUploadProgress> {
    return new Observable(observer => {
      const fileId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const filePath = `events/${eventId}/${qrCodeId}/${fileId}_${file.name}`;
      const storageRef = ref(this.storage, filePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      const progress: MediaUploadProgress = {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      };

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progress.progress = uploadProgress;
          this.updateUploadProgress(progress);
          observer.next(progress);
        },
        (error) => {
          progress.status = 'error';
          progress.error = error.message;
          this.updateUploadProgress(progress);
          observer.error(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Save media metadata to backend
            const mediaData = {
              eventId,
              qrCodeId,
              fileName: file.name,
              fileUrl: downloadURL,
              fileType: file.type.startsWith('image/') ? 'image' : 'video',
              fileSize: file.size,
              uploadedBy: metadata.name,
              uploadedByPhone: metadata.phone,
              uploadedByToken: metadata.token
            };

            const media = await this.http.post<Media>(`${environment.apiUrl}/media`, mediaData).toPromise();
            
            progress.status = 'success';
            this.updateUploadProgress(progress);
            observer.next(progress);
            observer.complete();
          } catch (error: any) {
            progress.status = 'error';
            progress.error = error.message;
            this.updateUploadProgress(progress);
            observer.error(error);
          }
        }
      );
    });
  }

  approveMedia(mediaId: string): Observable<Media> {
    return this.http.post<Media>(`${environment.apiUrl}/media/${mediaId}/approve`, {});
  }

  rejectMedia(mediaId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/media/${mediaId}`);
  }

  deleteMedia(mediaId: string, fileUrl: string): Observable<void> {
    return new Observable(observer => {
      // Delete from Firebase Storage
      const storageRef = ref(this.storage, fileUrl);
      deleteObject(storageRef)
        .then(() => {
          // Delete metadata from backend
          this.http.delete<void>(`${environment.apiUrl}/media/${mediaId}`).subscribe({
            next: () => observer.next(),
            error: (err) => observer.error(err),
            complete: () => observer.complete()
          });
        })
        .catch((error) => observer.error(error));
    });
  }

  downloadMedia(fileUrl: string): void {
    window.open(fileUrl, '_blank');
  }

  private updateUploadProgress(progress: MediaUploadProgress): void {
    const current = this.uploadProgressSubject.value;
    const index = current.findIndex(p => p.fileName === progress.fileName);
    
    if (index >= 0) {
      current[index] = progress;
    } else {
      current.push(progress);
    }
    
    this.uploadProgressSubject.next([...current]);
  }

  clearUploadProgress(): void {
    this.uploadProgressSubject.next([]);
  }
}
