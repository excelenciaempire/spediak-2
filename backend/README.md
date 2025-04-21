# Spediak Backend API

This is the backend API for the Spediak inspection app, providing authentication, inspection management, and AI-powered DDID generation.

## Tech Stack

- Node.js (v18+) 
- Express.js
- Supabase (PostgreSQL)
- OpenAI API for DDID generation

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
5. Update the `.env` file with your actual credentials:
   - Generate a secure `JWT_SECRET`
   - Add your Supabase URL and key
   - Add your OpenAI API key

### Running the Server

#### Development mode:
```
npm run dev
```

#### Production mode:
```
npm start
```

## API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Authenticate a user
- `GET /api/v1/auth/verify/:token` - Verify email

### Inspection Endpoints

- `POST /api/v1/inspections/generate-ddid` - Generate a DDID response from an image and description
- `POST /api/v1/inspections` - Save a new inspection
- `GET /api/v1/inspections` - Get all inspections for a user
- `GET /api/v1/inspections/:id` - Get a specific inspection

### User Profile Endpoints

- `GET /api/v1/user/profile` - Get user profile
- `PUT /api/v1/user/profile` - Update user profile
- `PUT /api/v1/user/password` - Update user password

## Security

This backend implements several security measures:
- JWT authentication
- Password hashing with bcrypt
- Security headers via Helmet.js
- CORS protection
- OpenAI API key protection

## Testing

Run the test suite:
```
npm test
``` 