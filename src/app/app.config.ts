import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth, Auth } from '@angular/fire/auth';
import { provideStorage, getStorage, Storage } from '@angular/fire/storage';
import { environment } from '../environments/environment';

import { routes } from './app.routes';
import { mockBackendInterceptor } from './interceptors/mock-backend.interceptor';
import { AuthService } from './services/auth.service';
import { MockAuthService, mockAuthInstance } from './services/mock-auth.service';

// Mock Storage
const mockStorage = {
    // Implement any methods used by MediaService if needed, e.g. ref, uploadBytesResumable
    // However, MediaService calls global functions passing this instance.
    // So the instance itself can be empty if we mock the logic in MediaService.
    // But MediaService injects Storage.
    app: { name: 'mock' }
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
        withInterceptors([
            mockBackendInterceptor // Enable mock backend
        ])
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    // Override Auth provider
    { provide: Auth, useValue: mockAuthInstance },
    // Override Storage provider
    { provide: Storage, useValue: mockStorage },
    // Override AuthService with MockAuthService
    { provide: AuthService, useClass: MockAuthService }
  ]
};
