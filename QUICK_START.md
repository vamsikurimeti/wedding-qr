# Quick Start Guide

## Initial Setup

1. **Install Dependencies**
   ```bash
   cd wedding-qr-platform
   npm install
   ```

2. **Configure Firebase**
   - Update `src/environments/environment.ts` with your Firebase credentials
   - Update `src/environments/environment.prod.ts` for production

3. **Configure Backend API**
   - Update `apiUrl` in environment files to point to your Node.js backend

4. **Run Development Server**
   ```bash
   npm start
   ```

## Application Routes

- `/login` - Admin login page
- `/guest?token=XXX` - Guest QR flow (token-based)
- `/super-admin` - Super Admin Dashboard
- `/platform-admin` - Platform Admin Dashboard
- `/events` - Events list
- `/events/:id` - Event Dashboard
- `/events/:eventId/qr/create` - Create QR Code
- `/super-admin/pricing-plans` - Pricing Plans Management
- `/super-admin/users` - User Management

## Key Components

### Authentication
- Login component handles email/password authentication
- Auth service manages Firebase authentication
- Guards protect routes based on authentication and roles

### QR Code Flow
1. Platform Admin creates event
2. Creates QR codes with configurable rules
3. Guests scan QR code (token in URL)
4. Dynamic UI renders based on QR rules
5. Guests can view gallery and/or upload media

### Media Management
- Upload with progress tracking
- Approval workflow for event admins
- Gallery view with download capability
- Firebase Storage integration

## Backend API Requirements

Your Node.js backend should implement:

- `GET /api/users/:id` - Get user data
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `POST /api/users/:id/enable` - Enable user
- `POST /api/users/:id/disable` - Disable user
- `GET /api/events` - List events
- `GET /api/events/:id` - Get event
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/admins` - Assign event admin
- `DELETE /api/events/:id/admins/:adminId` - Remove event admin
- `GET /api/events/:id/qr-codes` - List QR codes
- `POST /api/events/:id/qr-codes` - Create QR code
- `PUT /api/events/:id/qr-codes/:qrCodeId` - Update QR code
- `DELETE /api/events/:id/qr-codes/:qrCodeId` - Delete QR code
- `GET /api/qr-codes/token/:token` - Get QR code by token
- `GET /api/qr/validate/:token` - Validate guest token
- `GET /api/events/:id/media` - Get event media
- `GET /api/events/:id/media/approved` - Get approved media
- `GET /api/qr-codes/:qrCodeId/media` - Get QR code media
- `POST /api/media` - Create media metadata
- `POST /api/media/:id/approve` - Approve media
- `DELETE /api/media/:id` - Delete/reject media
- `GET /api/pricing-plans` - List pricing plans
- `POST /api/pricing-plans` - Create pricing plan
- `PUT /api/pricing-plans/:id` - Update pricing plan
- `DELETE /api/pricing-plans/:id` - Delete pricing plan

## Testing the Application

1. **Create a Super Admin user** (via Firebase Console or backend)
2. **Login** at `/login`
3. **Create a Platform Admin** (via Super Admin dashboard)
4. **Login as Platform Admin**
5. **Create an Event**
6. **Create a QR Code** with desired rules
7. **Test Guest Flow** by visiting `/guest?token=YOUR_QR_TOKEN`

## Important Notes

- All UI rendering in guest flow is dynamic based on QR rules
- No permissions are hardcoded
- Firebase handles authentication and storage
- Backend handles all business logic and data persistence
- PWA support is enabled for offline capability

## Troubleshooting

### Firebase Errors
- Ensure Firebase config is correct
- Check Firebase Authentication is enabled
- Verify Storage rules allow uploads

### API Errors
- Check backend is running
- Verify API URL in environment files
- Check CORS settings on backend

### Build Errors
- Run `npm install` again
- Clear `node_modules` and reinstall
- Check Node.js version compatibility
