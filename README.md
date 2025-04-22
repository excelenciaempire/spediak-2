# Spediak - DDID Statement Generator App

Spediak is a mobile application for building inspectors to generate DDID (Description, Defect, Impact, Directive) statements based on their observations.

## Features

- User authentication with JWT tokens
- Secure password handling
- Profile management
- Inspection history tracking
- Offline capability for inspections
- DDID statement generation

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Node.js with Express
- **Authentication**: JWT-based auth with secure storage
- **State Management**: React Context API
- **Styling**: React Native StyleSheet

## Getting Started

### Prerequisites

- Node.js (>=18.0.0)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
```
git clone <repository-url>
cd Spediak
```

2. Install dependencies
```
npm install
cd backend && npm install && cd ..
```

3. Set up environment variables
```
cp backend/.env.example backend/.env
```
Edit the `.env` file and replace the JWT_SECRET with a secure random string.

### Running the App

#### Run both frontend and backend together
```
npm run dev
```

#### Run separately

Backend:
```
cd backend
npm run dev
```

Frontend:
```
npm run dev:frontend
```

### Testing the App

1. Open the Expo app on your phone or use an emulator
2. Sign up with a new account
3. Log in with your credentials
4. Use the app to create inspections and generate DDID statements

## API Endpoints

The application includes the following API endpoints:

- **Authentication**
  - `POST /api/v1/auth/signup` - Register a new user
  - `POST /api/v1/auth/login` - Login an existing user
  - `GET /api/v1/auth/verify/:token` - Verify email

- **User Management**
  - `GET /api/v1/user/profile` - Get user profile
  - `PUT /api/v1/user/profile` - Update user profile
  - `PUT /api/v1/user/password` - Update user password

- **Inspections**
  - `POST /api/v1/inspections/generate-ddid` - Generate DDID from image and description
  - `POST /api/v1/inspections` - Save a new inspection
  - `GET /api/v1/inspections` - Get all inspections for a user
  - `GET /api/v1/inspections/:id` - Get a specific inspection

## Security

- All API endpoints (except auth routes) are protected with JWT authentication
- Passwords are hashed using bcrypt
- Tokens are stored securely using Expo SecureStore
- Environment variables are used for sensitive configuration
