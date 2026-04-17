# LINESETU - PRD & Implementation Log

## Original Problem Statement
User built LINESETU (healthcare queue management) app on Replit.com and needed APK files for both Patient App and Doctor App for real-time testing on Android devices without Expo Go.

## Architecture
- **Monorepo**: pnpm workspaces with TypeScript
- **Patient App**: Expo React Native (com.linesetu.patientapp)
- **Doctor App**: Expo React Native (com.linesetu.doctorapp)
- **Admin Panel**: React + Vite web app
- **API Server**: Express.js on port 8080
- **Database**: Firebase Firestore
- **Auth**: Firebase Phone Auth (web) + Fast2SMS OTP (native)
- **Payments**: Razorpay (skipped for now)
- **SMS**: Fast2SMS
- **Real-time**: SSE (Server-Sent Events) for queue positions

## User Personas
1. **Patients**: Book tokens, track queue position, manage profile
2. **Doctors**: Manage queue, call tokens, view earnings, walk-in patients
3. **Admin**: Approve/manage doctors, monitor system

## Core Requirements
- Generate Android APK for Patient App
- Generate Android APK for Doctor App
- Both apps connect to existing Replit backend at linesetu.replit.app
- Firebase Firestore for real-time data sync
- Fast2SMS for OTP on native

## What's Been Implemented (April 17, 2026)

### APK Generation
- Set up EAS environment variables for both apps (Firebase config + API domain)
- Fixed missing `react-native-worklets` dependency in Doctor App
- Removed Replit-specific `baseUrl` paths from app.json
- Updated expo-router origin
- Built and delivered both APKs:
  - Patient App: https://expo.dev/artifacts/eas/mpWLVVxFyX8cmFNs6ghVga.apk
  - Doctor App: https://expo.dev/artifacts/eas/d4XFJfgb6Ymkx39H1bdsJY.apk

### Issues Fixed
1. First build crashed because EXPO_PUBLIC_* env vars weren't baked in
2. Doctor app Gradle build failed due to missing react-native-worklets
3. Removed Replit-specific baseUrl paths that broke standalone navigation

### Patient Management Feature (Admin Panel) - April 17, 2026
**Backend (api-server/src/routes/admin.ts):**
- `GET /api/admin/patients` — List all patients from Firestore
- `DELETE /api/admin/patients/:patientId` — Hard delete patient with:
  - Deletes patient profile document
  - Deletes all associated tokens/bookings
  - Deletes all associated notifications
  - Logs deletion activity to `adminLogs` collection
  - Phone number is freed for new registration

**Frontend (admin-panel & Emergent preview):**
- Tab navigation (Doctors / Patients) in header
- PatientsPage with search, filter tabs (All/Complete/Incomplete), stat cards
- PatientRow with red delete button + confirmation modal + success message
- Real-time Firestore listener for patients collection
- Also ported to Emergent React frontend for live preview at port 3000
- FastAPI backend on port 8001 proxies API calls to Express server on port 8002

## Prioritized Backlog
- P0: Test APKs on real devices, verify login/OTP flow
- P0: Verify Firebase real-time sync works in APKs
- P1: Set up Razorpay with real keys for payment
- P1: Deploy backend independently (not dependent on Replit)
- P2: Google Play Store submission
- P2: App Store (iOS) submission
- P3: Push notifications setup (FCM)

## Next Tasks
1. User tests both APKs on Android devices
2. Fix any runtime issues found during testing
3. Configure Razorpay for payments
4. Deploy backend to production
5. Submit to Google Play Store
