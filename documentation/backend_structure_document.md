# Backend Structure Document

This document describes the backend setup for the Spediak app in simple, everyday language. It covers the architecture, database management, API designs, hosting, security, and more. Each section explains how the different components work together to deliver a scalable, secure, and efficient backend that meets the needs of the app.

## 1. Backend Architecture

The backend of Spediak is built around a modern, scalable design using Node.js and Express.js. Here’s a quick rundown of the key aspects:

- **Framework & Platform:**
  - Node.js (v18+)
  - Express.js for routing and middleware management

- **Design Patterns:**
  - RESTful API design
  - Middleware layers for processing requests (logging, error handling, etc.)
  - Service-oriented structure that separates business logic from request handling

- **Scalability & Maintainability:**
  - Easy to add new endpoints and services as the app grows
  - Clean separation of concerns means that updates or bug fixes in one part do not affect the entire system
  - Well-documented endpoints and modules that simplify future maintenance and onboarding

- **Performance:**
  - Lightweight Node.js runtime that handles concurrent operations efficiently
  - Optimized routing and asynchronous operations to keep response times quick, even under load

## 2. Database Management

Spediak uses Supabase, which provides both a PostgreSQL database and file storage in one service. This makes data handling and image storage smooth and consistent.

- **Database Technology:**
  - SQL database (PostgreSQL via Supabase)

- **File Storage:**
  - Supabase storage for image uploads (JPEG/PNG, up to 5MB per file)

- **Data Handling:**
  - Data is organized into tables (such as users and inspections) that store information like user credentials, inspection details, and file URLs
  - Standard SQL queries are used for data access and management, ensuring data consistency and support for transaction management
  - Real-time updates are leveraged through Supabase to ensure that changes (such as new inspections) are quickly reflected on the frontend

## 3. Database Schema

Below is a human-readable description of the database schema, followed by an SQL-style layout of the core tables.

### Human-Readable Format:
- **Users Table:** Holds user account details including email, full name, state selection, and a reference to profile image.
- **Inspections Table:** Contains records of home inspections, linking the user to the uploaded image, description, generated DDID text, and a timestamp of creation.

### SQL/PostgreSQL Schema:

-- Users Table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  state VARCHAR(50) NOT NULL,          -- Expected values: 'North Carolina' or 'South Carolina'
  profile_image_url TEXT,              -- URL to profile picture, default to an avatar if NULL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inspections Table
CREATE TABLE inspections (
  inspection_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,             -- URL to the uploaded image stored in Supabase storage
  description TEXT NOT NULL,
  ddid_response TEXT,                  -- Generated DDID statement
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

## 4. API Design and Endpoints

The backend APIs follow a simple, RESTful design to enable communication between the frontend and backend. Key endpoints include:

- **Authentication & User Management:**
  - POST /auth/signup – To register new users with email and password (plus optional social login).
  - POST /auth/login – For user login and secure session creation, using JWT for session management.
  - GET /auth/verify – To confirm email verification when the user signs up.

- **Inspection Management:**
  - POST /inspections/new – Accepts uploaded inspection details: image URL, description, and state-specific logic for DDID generation. Triggers the AI backend (OpenAI) to generate a DDID statement.
  - GET /inspections/history – Retrieves a list of past inspections for a user, with real-time updates.
  - GET /inspections/:id – Returns full details for a specific inspection, including the ability to copy the DDID response.

- **Profile Settings:**
  - GET /user/profile – Fetch user profile details (full name, email, state, and profile image).
  - PUT /user/profile – Update editable fields such as full name, password, and state.

These endpoints are designed to be simple, with clear responsibilities. They ensure that the app can easily maintain secure communication between the frontend and backend.

## 5. Hosting Solutions

The hosting environment for the Spediak backend is chosen to maximize reliability and reduce costs while ensuring scalability.

- **Cloud Providers:**
  - The backend (Node.js/Express app) can be hosted on cloud providers like AWS, Google Cloud, or Heroku. These platforms support auto-scaling and provide excellent reliability.
  - Supabase handles both the database (PostgreSQL) and file storage using a cloud-based model.

- **Benefits:**
  - High availability and automatic scaling help manage increased user load
  - Simplified management with integrated services (e.g., Supabase for both DB and storage) reduces operational overhead and cost
  - Robust global infrastructure to ensure fast response times regardless of user location

## 6. Infrastructure Components

Several components work together to ensure that the backend remains fast and reliable:

- **Load Balancers:** Distribute incoming traffic across multiple backend instances, ensuring the application remains responsive during high loads.
- **Caching Mechanisms:** Use caching techniques to store frequently accessed data, reducing the number of direct database queries and lowering latency.
- **Content Delivery Network (CDN):** Especially useful for delivering static content like images stored in Supabase. A CDN ensures these files load quickly for users around the globe.
- **Real-time Update Services:** Supabase real-time features push updates (like new inspections) instantly to the frontend, keeping the app responsive and interactive.
- **File Storage Integration:** Supabase storage is used for holding images securely, with straightforward access through URL references.

## 7. Security Measures

Security is a top priority for the Spediak backend. Measures include:

- **Authentication & Authorization:**
  - Dedicated sign-up/login endpoints using JWT for secure session management
  - Optional social logins with providers like Google and Facebook, which offer added layers of security

- **Encryption & Data Protection:**
  - HTTPS for secure data transmission
  - Passwords are stored with salted hashing to protect against breaches
  - Sensitive data and API keys (like OpenAI and Supabase keys) are stored in environment variables and never hardcoded

- **Access Control:**
  - Proper role-based access and endpoint protection ensure users only access what they’re authorized for
  - Backend restrictions such as IP whitelisting for critical API keys, where possible

- **Regular Security Audits:**
  - Scheduled audits ensure ongoing improvements in security practices and compliance with industry standards

## 8. Monitoring and Maintenance

Regular monitoring and proactive maintenance help maintain backend health and performance:

- **Monitoring Tools:**
  - Logging mechanisms to capture errors and activity logs
  - Real-time monitoring tools (like New Relic, Datadog, or similar) track the performance and uptime of the backend
  - Alerting systems notify the team of critical issues immediately

- **Maintenance Strategies:**
  - Regular software updates to Node.js, Express.js, and related dependencies
  - Routine database backups and performance tuning in Supabase
  - Periodic reviews and refactoring of code to keep the system clean and efficient

## 9. Conclusion and Overall Backend Summary

The Spediak backend is thoughtfully designed to support a modern, mobile-first application. Here’s a quick summary:

- A scalable, maintainable architecture using Node.js and Express.js, designed with RESTful endpoints and middleware that simplify development.
- Supabase offers a unified solution for both a PostgreSQL database and file storage, ensuring data is handled securely and efficiently.
- Key APIs manage everything from user authentication and inspections to profile updates and state-specific logic for DDID generation—all with clear, documented endpoints.
- Cloud-based hosting along with load balancers, caching, and CDN components provide robust performance and global reach.
- Strong security measures, including HTTPS, JWT, environment variable management, and regular audits, keep user data protected.
- Comprehensive monitoring and maintenance practices ensure the backend remains reliable, up-to-date, and ready to scale.

This set-up not only meets the requirements of the Spediak app but also positions it to adapt and grow as new features are added or user demand increases. The backend architecture is both straightforward and robust, making it an excellent foundation for the app’s ongoing success.