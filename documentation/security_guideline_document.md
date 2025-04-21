# Spediak App Implementation Plan

## Project Overview

- **Purpose:**
  - Mobile-first app for home inspectors to generate standardized DDID statements using defect images and descriptions.
  - Emphasizes a clean, minimalist interface and efficient workflow.

- **Key Features:**
  - **Image Upload:**
    - Support via camera/gallery on mobile and file picker on desktop.
    - Valid file types: JPEG, PNG (max 5MB).
  - **Voice-to-Text Description Input:**
    - Leverages native device capabilities with editing support.
  - **AI-Powered DDID Generation:**
    - Uses OpenAI API for generating DDID statements.
    - Displays a loading indicator during processing and includes graceful error handling with retry options.
  - **Inspection History:**
    - Provides real-time updates.
  - **Profile Settings:**
    - State selection (North Carolina or South Carolina) affects DDID formatting.
  - **Navigation:**
    - Strict adherence to Hamburger Menu navigation only (no tab bars or bottom navigation).

## Tech Stack

- **Frontend:**
  - React (Web)
  - React Native (Mobile)
  - Expo for multi-platform deployment (iOS, Android, Web)

- **Backend:**
  - Node.js (v18+) with Express.js

- **Database & Storage:**
  - Supabase (for both database and file storage)

- **AI Integration:**
  - OpenAI for DDID generation (API keys to be managed securely via environment variables, not hardcoded)

- **Development Tools:**
  - Cursor (IDE)

## Key Requirements and Considerations

### Navigation

- Use of only Hamburger Menu navigation (eliminate use of tab bars or bottom navigation).

### Authentication & Access Control

- Dedicated sign-up/login with email verification.
- Optional social login (Google/Facebook) for enhanced user experience.
- Secure session management using JWT with proper token expiration and backend validations.

### Image Handling & Data Storage

- Image uploads stored in Supabase Storage.
- Validate file types (JPEG, PNG) and enforce size constraints (max 5MB).

### DDID Generation

- Use OpenAI API for DDID generation.
- Show loading indicators while processing and implement robust error handling with retry options.
- Backend must handle conditional logic for state-specific (NC/SC) DDID formatting.

### Voice-to-Text

- Leverage device native transcription capabilities for quick input.
- Allow users to edit the transcribed text before submission.

### Security

- **Data Transmission:** Enforce HTTPS for all data exchanges.
- **API Key Management:**
  - Use environment variables for API keys (OpenAI and Supabase credentials).
  - Avoid hardcoding or exposing API keys in the source code repository.
- **Sensitive Data Handling:**
  - Encrypt sensitive data (e.g., passwords using salted hashing algorithms).
  - Implement role-based access control (RBAC) and enforce least privilege for all users and services.
- **Infrastructure Security:**
  - Regular security audits, proper session management, and safe error handling to avoid leakage of sensitive information.

### Accessibility

- Support adjustable font sizes and sufficient color contrast.
- Ensure screen reader support with ARIA labels.
- Enable keyboard navigation across the app.

### Real-time Updates

- Inspection history should be updated in real-time to reflect current status and data changes.

## Critical Decisions & Assumptions

- **Image Storage:** Supabase storage is used, acknowledging its simplicity and efficiency.
- **Voice-to-Text Implementation:** Rely on the device's native capabilities to reduce overhead and complexity.
- **State-Specific Formatting:** Backend logic will process conditional rules for NC/SC DDID formatting.
- **Secure API Key Management:** All sensitive API keys must be managed via secure environment variables and not embedded in the source code.

## Additional Security Measures

- **Input Validation & Output Encoding:**
  - Validate all user inputs on both client and server sides.
  - Use parameterized queries with Supabase to prevent injection attacks.
- **Secure Default Configurations:**
  - Use secure defaults when configuring APIs and databases.
- **CORS and HTTPS Enforcement:**
  - Configure CORS with restrictive policies.
  - Enforce TLS for all communications.
- **Session & Cookie Security:**
  - Employ secure session management, including HttpOnly, Secure, and SameSite cookie attributes.

## Conclusion

The plan outlines a secure, scalable, and accessible mobile-first app that leverages modern web technologies and robust security practices across the entire stack. The focus is on delivering a seamless experience for home inspectors while ensuring strong safeguards for user data and operations throughout the application.

_Note: Always review and update environmental configurations and security practices as part of continuous integration and deployment (CI/CD) to maintain a strong security posture._