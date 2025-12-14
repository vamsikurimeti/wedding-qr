# Wedding QR Photo & Video Platform

A production-ready Angular SaaS web application for managing wedding events with QR code-based photo and video sharing.

## Features

### User Roles
- **Super Admin**: Platform owner with full control
- **Platform Admin**: Photographers/clients who create events
- **Event Admin**: Assigned administrators for specific events
- **Guest**: QR-based access (no login required)

### Core Functionality

1. **Authentication**
   - Email/password login for admins
   - Token-based guest access (no OTP)

2. **Super Admin Dashboard**
   - View all users
   - Create/edit pricing plans
   - Set storage limits (GB per plan)
   - Enable/disable users

3. **Platform Admin Dashboard**
   - Create and manage events
   - Assign event admins
   - View storage usage

4. **Event Dashboard**
   - Event details
   - QR management
   - Guest approval list
   - Gallery view
   - Enable/disable uploads or downloads

5. **QR Creation UI**
   - Configurable rules per QR code:
     - Anyone can view gallery (on/off)
     - Anyone can upload (on/off)
     - Upload requires approval (on/off)
     - Name required (on/off)
     - Phone required (none / optional / mandatory)
     - Download allowed (on/off)

6. **Guest QR Flow**
   - Dynamic UI based on QR rules
   - Gallery view
   - Upload interface
   - Manual camera/gallery trigger
   - Approval request form

7. **Media Handling**
   - Photo and video uploads
   - Upload progress indicator
   - No auto camera opening

## Technology Stack

- **Angular 19**: Latest stable version
- **Firebase**: Authentication and Storage
- **PWA Support**: Progressive Web App ready
- **TypeScript**: Type-safe development
- **SCSS**: Styling with responsive design

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── approval-list/       # Media approval interface
│   │   ├── event-dashboard/      # Event management
│   │   ├── gallery/              # Media gallery
│   │   ├── guest-qr-flow/       # Guest QR scanning interface
│   │   ├── layout/               # Main layout component
│   │   ├── login/                # Authentication
│   │   ├── media-upload/         # Media upload component
│   │   ├── platform-admin-dashboard/
│   │   ├── pricing-plans/        # Pricing management
│   │   ├── qr-creation/          # QR code creation
│   │   ├── qr-list/              # QR codes listing
│   │   ├── super-admin-dashboard/
│   │   └── user-management/     # User management
│   ├── guards/
│   │   ├── auth.guard.ts         # Authentication guard
│   │   └── role.guard.ts        # Role-based access guard
│   ├── models/
│   │   ├── event.model.ts
│   │   ├── media.model.ts
│   │   ├── pricing.model.ts
│   │   └── user.model.ts
│   ├── services/
│   │   ├── auth.service.ts      # Authentication
│   │   ├── event.service.ts     # Event management
│   │   ├── media.service.ts     # Media handling
│   │   ├── pricing.service.ts   # Pricing plans
│   │   └── user.service.ts      # User management
│   ├── app.routes.ts            # Routing configuration
│   └── app.config.ts            # App configuration
└── environments/
    ├── environment.ts           # Development config
    └── environment.prod.ts      # Production config
```

## Setup Instructions

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wedding-qr-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Enable Storage
   - Copy your Firebase config

4. **Update environment files**
   - Edit `src/environments/environment.ts`
   - Add your Firebase configuration:
     ```typescript
     firebase: {
       apiKey: 'YOUR_API_KEY',
       authDomain: 'YOUR_AUTH_DOMAIN',
       projectId: 'YOUR_PROJECT_ID',
       storageBucket: 'YOUR_STORAGE_BUCKET',
       messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
       appId: 'YOUR_APP_ID'
     }
     ```
   - Update `apiUrl` with your Node.js backend URL

5. **Run development server**
   ```bash
   npm start
   ```
   Navigate to `http://localhost:4200`

6. **Build for production**
   ```bash
   npm run build
   ```

## Backend Integration

This Angular application expects a Node.js backend API. The backend should provide:

- User authentication endpoints
- Event CRUD operations
- QR code management
- Media metadata storage
- Pricing plan management
- User management

API endpoints are configured in the services and should follow RESTful conventions.

## Key Features Implementation

### Dynamic QR Rules
All UI rendering in the guest flow depends on QR rules from the backend. No permissions are hardcoded.

### Responsive Design
- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly interfaces

### PWA Support
- Service worker configured
- Manifest file included
- Offline capability ready

## Development Guidelines

### Services
- All API calls go through services
- Services handle error management
- Observable-based data flow

### Guards
- Route protection with authentication
- Role-based access control
- Automatic redirects

### Components
- Standalone components
- Reusable UI elements
- Clear separation of concerns

## Environment Configuration

### Development
- `environment.ts`: Local development settings
- API URL: `http://localhost:3000/api`

### Production
- `environment.prod.ts`: Production settings
- API URL: Your production API domain

## Security Considerations

- Firebase Authentication for admin access
- Token-based guest access
- Role-based route guards
- Input validation on all forms
- Secure file upload handling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

[Your License Here]

## Support

For issues and questions, please contact [Your Contact Information]
