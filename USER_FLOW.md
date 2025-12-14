# Complete User Flow Documentation

## Overview
This document explains the complete authentication and user registration flow for the Wedding QR Platform.

## User Registration & Login Flow

### 1. Sign Up (New Users)

**Route:** `/signup`

**Flow:**
1. User fills out the signup form with:
   - Display Name (required)
   - Email (required, must be valid email)
   - Password (required, minimum 6 characters)
   - Confirm Password (must match password)

2. When user submits:
   - Creates Firebase Authentication account using `createUserWithEmailAndPassword`
   - Automatically calls `/api/users/self-register` endpoint to create Firestore user document
   - User is registered with `event_admin` role by default
   - User is redirected based on their role:
     - `super_admin` → `/super-admin`
     - `platform_admin` → `/platform-admin`
     - `event_admin` → `/events`

**Backend Endpoint:** `POST /api/users/self-register`
- Requires: Valid Firebase Auth token
- Creates user document in Firestore with:
  - `uid`: Firebase Auth UID
  - `email`: User's email
  - `role`: `event_admin` (default)
  - `displayName`: User's display name
  - `isActive`: `true`
  - `createdAt`: Current timestamp
  - `updatedAt`: Current timestamp

### 2. Login (Existing Users)

**Route:** `/login`

**Flow:**
1. User enters email and password
2. System authenticates with Firebase Auth using `signInWithEmailAndPassword`
3. System fetches user data from backend (`GET /api/users/:uid`)
4. If user doesn't exist in Firestore:
   - Automatically calls `/api/users/self-register` to create user document
   - Retries fetching user data
5. User is redirected based on their role (same as signup)

**Auto-Registration:**
- If a user exists in Firebase Auth but not in Firestore, the system automatically creates their Firestore document
- This handles the case where you manually added users in Firebase Console

### 3. Auto-Registration on Auth State Change

**When:** User is already authenticated (e.g., page refresh)

**Flow:**
1. Firebase Auth state changes (user is logged in)
2. System attempts to fetch user data from backend
3. If user doesn't exist in Firestore:
   - Automatically calls `/api/users/self-register`
   - Fetches user data again
   - Updates current user state

## Backend Changes

### New Middleware: `verifyTokenOnly`
- Verifies Firebase Auth token only
- Does NOT require user to exist in Firestore
- Used for self-registration endpoint

### Updated Endpoint: `POST /api/users/self-register`
- Now uses `verifyTokenOnly` instead of `verifyToken`
- Allows users to register themselves even if they don't exist in Firestore yet

### New Endpoint: `GET /api/users/:id`
- Gets user by ID
- Users can only access their own data (unless super admin)
- Super admins can access any user's data

## Frontend Components

### Signup Component (`/signup`)
- **File:** `src/app/components/signup/signup.component.ts`
- **Features:**
  - Email/password registration
  - Display name input
  - Password confirmation validation
  - Link to login page

### Login Component (`/login`)
- **File:** `src/app/components/login/login.component.ts`
- **Updated Features:**
  - Auto-registration for existing Firebase users
  - Link to signup page

### Auth Service
- **File:** `src/app/services/auth.service.ts`
- **New Methods:**
  - `signup(email, password, displayName)`: Creates new user account
  - `selfRegister(token, displayName)`: Registers user in Firestore
- **Updated Methods:**
  - `login()`: Now handles auto-registration
  - `fetchUserData()`: Now handles auto-registration on 404/403 errors
  - `onAuthStateChanged`: Now handles auto-registration

## Routes

### New Routes Added:
- `/signup` - Sign up page (no auth required)

### Existing Routes:
- `/login` - Login page (no auth required)
- `/super-admin` - Super admin dashboard (requires super_admin role)
- `/platform-admin` - Platform admin dashboard (requires platform_admin role)
- `/events` - Events list (requires event_admin or platform_admin role)

## User Roles

1. **Super Admin** (`super_admin`)
   - Full platform control
   - Can manage all users, events, pricing plans
   - Can access all endpoints

2. **Platform Admin** (`platform_admin`)
   - Can create and manage events
   - Can manage users (assigned to their platform)
   - Limited by storage limits

3. **Event Admin** (`event_admin`)
   - Can manage assigned events
   - Can create QR codes for their events
   - Can approve/reject media

## Testing the Flow

### For New Users:
1. Navigate to `/signup`
2. Fill out the form
3. Submit
4. You'll be automatically registered and logged in
5. Redirected to appropriate dashboard based on role

### For Existing Firebase Users (Manual Creation):
1. If you added a user in Firebase Console:
   - Navigate to `/login`
   - Enter email and password
   - System will auto-register you in Firestore
   - You'll be logged in and redirected

### For Super Admin:
1. Sign up or login with your Firebase credentials
2. By default, you'll be registered as `event_admin`
3. To become super admin, you need to:
   - Use the backend script: `node backend/src/scripts/createSuperAdmin.js <uid> <email> [displayName]`
   - Or have an existing super admin update your role via the super admin dashboard

## Error Handling

### Signup Errors:
- **Email already in use**: "This email is already registered. Please sign in instead."
- **Weak password**: "Password is too weak. Please use a stronger password."
- **Invalid email**: "Invalid email address."

### Login Errors:
- **Invalid credentials**: Standard Firebase error messages
- **User not found in Firestore**: Auto-registration is attempted automatically

### Auto-Registration Errors:
- If auto-registration fails, user is not logged in
- Error is logged to console
- User can manually sign up or contact support

## Security Notes

1. **Firebase Auth**: All authentication is handled by Firebase
2. **Firestore**: User documents are created server-side only
3. **Tokens**: All API calls require valid Firebase Auth tokens
4. **Role Assignment**: New users are assigned `event_admin` role by default
5. **Super Admin**: Must be created manually via script or by existing super admin

## Next Steps

1. **Test the signup flow**: Create a new account
2. **Test the login flow**: Login with existing Firebase credentials
3. **Create Super Admin**: Use the script to create your super admin account
4. **Test role-based access**: Verify that users are redirected to correct dashboards

