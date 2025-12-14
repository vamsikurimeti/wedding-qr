import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { UserRole } from '../models/user.model';

// --- Helper to manage persistence ---
const load = (key: string, initial: any[]) => {
  const saved = localStorage.getItem(`mock_${key}`);
  return saved ? JSON.parse(saved) : initial;
};

const save = (key: string, data: any[]) => {
  localStorage.setItem(`mock_${key}`, JSON.stringify(data));
};

// --- Initial Mock Data ---
const INITIAL_USERS = [
  {
    id: 'user-1',
    email: 'super@admin.com',
    role: UserRole.SUPER_ADMIN,
    displayName: 'Super Admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'user-2',
    email: 'platform@admin.com',
    role: UserRole.PLATFORM_ADMIN,
    displayName: 'Platform Admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    storageUsed: 1.5,
    storageLimit: 10
  }
];

const INITIAL_PLANS = [
  { id: 'plan-1', name: 'Basic', price: 0, storageLimitGB: 5, isActive: true, features: ['Basic Plan'] },
  { id: 'plan-2', name: 'Pro', price: 29, storageLimitGB: 50, isActive: true, features: ['Pro Plan'] },
  { id: 'plan-3', name: 'Enterprise', price: 99, storageLimitGB: 500, isActive: true, features: ['Enterprise Plan'] }
];

const INITIAL_EVENTS = [
  {
    id: 'event-1',
    name: 'Wedding 2024',
    description: 'John and Jane Wedding',
    platformAdminId: 'user-2',
    eventAdminIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    qrCodes: [],
    storageUsed: 0.5
  }
];

const INITIAL_QR_CODES = [
  {
    id: 'qr-1',
    eventId: 'event-1',
    name: 'Main Guest QR',
    token: 'token-123',
    rules: {
      anyoneCanViewGallery: true,
      anyoneCanUpload: true,
      uploadRequiresApproval: false,
      nameRequired: true,
      phoneRequired: 'optional',
      downloadAllowed: true
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    scanCount: 10
  }
];

const INITIAL_MEDIA = [
  {
    id: 'media-1',
    eventId: 'event-1',
    url: 'https://via.placeholder.com/300',
    type: 'photo',
    isApproved: true,
    uploadedBy: 'guest-1',
    createdAt: new Date()
  },
  {
    id: 'media-2',
    eventId: 'event-1',
    url: 'https://via.placeholder.com/300',
    type: 'photo',
    isApproved: false,
    uploadedBy: 'guest-2',
    createdAt: new Date()
  }
];

// --- State Variables (loaded lazily in interceptor or init) ---
// Since interceptor is a function, we can't easily hold state outside.
// However, the module is evaluated once per page load.
// We will load from localStorage on every request or use a singleton-like object if we can.
// But we need to handle "init" if localStorage is empty.
// Best to load inside the interceptor or just use a helper that checks cache.

const getStore = () => {
  return {
    users: load('users', INITIAL_USERS),
    plans: load('plans', INITIAL_PLANS),
    events: load('events', INITIAL_EVENTS),
    qrCodes: load('qrCodes', INITIAL_QR_CODES),
    media: load('media', INITIAL_MEDIA)
  };
};

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const { url, method, body } = req;
  console.log(`[MockBackend] ${method} ${url}`);

  const store = getStore();

  // Helper to respond with JSON
  const ok = (body: any) => of(new HttpResponse({ status: 200, body })).pipe(delay(500));
  const error = (message: string) => throwError(() => ({ status: 400, message }));

  // --- Users ---
  if (url.includes('/users') && method === 'GET') {
    if (url.includes('/users/self-register')) {
       // Mock self register response
       return ok({ id: 'user-new', role: 'event_admin' });
    }
    return ok(store.users);
  }

  // --- Pricing Plans ---
  if (url.includes('/pricing-plans') && method === 'GET') {
    return ok({ plans: store.plans });
  }

  // --- Events ---
  if (url.endsWith('/events') && method === 'GET') {
    return ok({ events: store.events });
  }

  if (url.endsWith('/events') && method === 'POST') {
    const newEvent = {
      id: `event-${Date.now()}`,
      ...body as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      qrCodes: [],
      storageUsed: 0
    };
    store.events.push(newEvent);
    save('events', store.events);
    return ok(newEvent);
  }

  if (url.match(/\/events\/[\w-]+$/) && method === 'GET') {
    const id = url.split('/').pop();
    const event = store.events.find((e: any) => e.id === id);
    return event ? ok(event) : error('Event not found');
  }

  if (url.match(/\/events\/[\w-]+$/) && method === 'DELETE') {
     const id = url.split('/').pop();
     const newEvents = store.events.filter((e: any) => e.id !== id);
     save('events', newEvents);
     return ok({});
  }

  // --- QR Codes ---
  if (url.match(/\/events\/[\w-]+\/qr-codes$/) && method === 'GET') {
    const eventId = url.split('/events/')[1].split('/')[0];
    const qrs = store.qrCodes.filter((q: any) => q.eventId === eventId);
    return ok(qrs);
  }

  if (url.match(/\/events\/[\w-]+\/qr-codes$/) && method === 'POST') {
    const eventId = url.split('/events/')[1].split('/')[0];
    const newQr = {
      id: `qr-${Date.now()}`,
      eventId,
      ...(body as any),
      token: `token-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      scanCount: 0
    };
    store.qrCodes.push(newQr);
    save('qrCodes', store.qrCodes);
    return ok(newQr);
  }

  // --- Guest QR Token ---
  if (url.includes('/qr-codes/token/') && method === 'GET') {
    const token = url.split('/').pop();
    const qr = store.qrCodes.find((q: any) => q.token === token);
    return qr ? ok(qr) : error('Invalid token');
  }

  // --- Media by QR Code ---
  if (url.match(/\/qr-codes\/[\w-]+\/media$/) && method === 'GET') {
    const qrCodeId = url.split('/qr-codes/')[1].split('/')[0];
    const qr = store.qrCodes.find((q: any) => q.id === qrCodeId);
    if (!qr) return error('QR Code not found');

    // Return all media for this event? Or specific to QR?
    // Usually guest sees approved media or their own uploads.
    // Assuming backend filters. For mock, return approved media for the event of this QR.
    return ok(store.media.filter((m: any) => m.eventId === qr.eventId && m.isApproved));
  }

  // --- Media ---
  // Get approved media
  if (url.match(/\/events\/[\w-]+\/media\/approved$/) && method === 'GET') {
    const eventId = url.split('/events/')[1].split('/')[0];
    return ok(store.media.filter((m: any) => m.eventId === eventId && m.isApproved));
  }

  // Get all media (for approval)
  if (url.match(/\/events\/[\w-]+\/media$/) && method === 'GET') {
      const eventId = url.split('/events/')[1].split('/')[0];
      return ok(store.media.filter((m: any) => m.eventId === eventId));
  }

  // Approve media
  if (url.match(/\/media\/[\w-]+\/approve$/) && method === 'POST') {
      const mediaId = url.split('/media/')[1].split('/')[0];
      const media = store.media.find((m: any) => m.id === mediaId);
      if (media) {
          media.isApproved = true;
          save('media', store.media);
          return ok(media);
      }
      return error('Media not found');
  }

  // Reject media
  if (url.match(/\/media\/[\w-]+\/reject$/) && method === 'POST') {
    const mediaId = url.split('/media/')[1].split('/')[0];
    const newMedia = store.media.filter((m: any) => m.id !== mediaId);
    save('media', newMedia);
    return ok({});
  }

  // Fallback to passthrough if not mocked
  return next(req);
};
