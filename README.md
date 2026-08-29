# TravelZ

TravelZ is a travel planning application for authenticated users where they can organize trips, activities and costs. Users can create trips with dates and budgets, add activities with costs, and track their total spending against a trip budget.

## Installation and Running

### Clone the repository

```bash
git clone https://github.com/korizmak/travelz.git
cd travelz
```

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm start
```

The application will be available at `http://localhost:4200`.

### Build for production

```bash
npm run build
```

The production build will be output to the `www` directory.

## Features

- User registration
- User login
- Logout
- Protected application routes
- Create, view, edit and delete trips
- Trip title and destination
- Trip start and end dates
- Validation that end date cannot be before start date
- Optional trip budget
- Optional trip description
- Create, view, edit and delete activities
- Activity types:
  - Accommodation
  - Transport
  - Sightseeing
  - Food
  - Entertainment
  - Other
- Optional activity date
- Optional activity time
- Activity notes
- Activity cost
- Total spent calculation per trip
- Remaining trip budget calculation
- Persistent storage with Firebase Realtime Database
- Authentication-protected database access

## Technologies

- Angular 20.3.25
- Ionic 8.0.0
- TypeScript 5.9.0
- RxJS 7.8.0
- Angular HttpClient
- Firebase Realtime Database
- Firebase Authentication

**Important:** Firebase communication is implemented through REST API requests using Angular HttpClient. AngularFire is NOT used. Firebase JavaScript SDK is NOT used. Firestore is NOT used.

## Architecture / Project Structure

The project follows a standard Angular + Ionic structure:

- **Pages:** UI components for trips, trip details, forms, login, and register
- **Models:** TypeScript interfaces for Trip, TravelEvent, CostItem, EventType, and AuthResponse
- **Services:** Business logic and data management
- **Auth Guard:** Functional route guard protecting authenticated routes
- **Environment Configuration:** Firebase configuration values

### Key Services

**AuthService**
- Communicates with Firebase Authentication REST API
- Manages user registration, login, and logout
- Stores authentication state and tokens in localStorage
- Restores authentication session on application startup

**TravelDataService**
- Communicates with Firebase Realtime Database through REST API
- Handles Trip and Activity/Event CRUD operations
- Attaches Firebase ID token to all database requests using the `auth` query parameter
- Calculates total spent per trip

## Authentication and Database Security

1. User registers or logs in through Firebase Authentication REST API.
2. Firebase returns an ID token, refresh token, and user information.
3. The application stores the authentication data in localStorage.
4. Protected Angular routes require authentication via the auth guard.
5. TravelDataService attaches the ID token to Firebase Realtime Database REST requests using the `auth` query parameter.
6. Firebase Realtime Database rules allow reads and writes only when `auth != null`.

### Firebase Realtime Database Rules

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "events": {
      ".indexOn": ["tripId"]
    }
  }
}
```

The current project does not implement per-user data ownership, so authenticated users access the same shared trip and activity data.
The `.indexOn` rule for `events.tripId` supports the orderBy query used to fetch activities for a specific trip.

## Firebase Setup

To configure Firebase for this project:

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable Realtime Database for the project.
3. Register a Web app in the Firebase project settings.
4. Enable Authentication with Email/Password sign-in method.
5. Configure Realtime Database security rules (see rules above).
6. Obtain the following from Firebase Console:
   - Firebase Realtime Database URL
   - Firebase Web API Key
7. Configure the Angular environment files (`src/environments/environment.ts` and `src/environments/environment.prod.ts`):

```ts
export const environment = {
  production: false,
  firebaseDatabaseUrl: 'YOUR_FIREBASE_DATABASE_URL',
  firebaseApiKey: 'YOUR_FIREBASE_WEB_API_KEY',
  firebaseAuthUrl: 'https://identitytoolkit.googleapis.com/v1/accounts'
};
```
