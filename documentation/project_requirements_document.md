# Project Requirements Document (PRD) for Spediak App

## 1. Project Overview

Spediak is a professional, minimalistic app built for home inspectors who need to quickly generate standardized DDID statements from defect images and brief descriptions. The core idea is to streamline the inspection process using an intuitive interface that lets users upload photos, dictate or type descriptions, and instantly receive a formatted DDID report. The design emphasizes clarity and simplicity, ensuring that even non-technical users can produce legally compliant inspection documents with minimal effort.

The app is being built to help inspectors reduce manual report generation time while ensuring state-specific standards are met. Success for Spediak will be measured by its ease-of-use, fast turnaround in report generation, secure handling of sensitive data, and smooth navigation throughout via a single, strictly enforced Hamburger Menu. The objectives include efficient image uploading, voice-to-text support, real-time update of inspection history, and secure user authentication using email/password with social login options.

## 2. In-Scope vs. Out-of-Scope

**In-Scope:**

*   A dedicated sign-up and login process with email/password and social login (Google, Facebook) along with email verification.

*   A New Inspection (Home) screen that includes:

    *   A large image upload area for defect photos (camera or gallery options for mobile; file picker for desktop).
    *   A text description field with an integrated voice-to-text transcription feature (using device native capabilities).
    *   A “Generate DDID Response” button that only activates after both an image and description are provided.
    *   A modal pop-up for displaying the generated DDID response that includes copy and close options.

*   An Inspection History screen that shows a scrollable, real-time list of past inspections with thumbnails, snippets, and timestamps.

*   A Profile Settings screen with editable fields (full name, password, and state selection limited to North Carolina or South Carolina) and a view-only email field.

*   Navigation exclusively through a Hamburger Menu available on every screen.

*   Integration with Open AI for DDID response generation and Supabase for secure database and file storage.

*   Mobile-first design built with Expo for iOS, Android, and Web compatibility.

**Out-of-Scope:**

*   Any additional menus such as tab bars, bottom navigation, or extra side menus other than the Hamburger Menu.
*   Native Swift/Kotlin development for mobile; only React Native will be used.
*   Onboarding prompts, tooltips, or in-depth help sections for first-time users.
*   Deleting or archiving inspection records (this feature can be planned for later versions).
*   A state selector on the main inspection screen; state selection is only available in Profile Settings.
*   Unnecessary client-side storage of API keys; all sensitive keys must be handled securely via environment variables.

## 3. User Flow

A typical user starts by signing up or logging in to the Spediak App using an email/password system, with the option to use social logins if they prefer. After verifying their account (via email verification), the user is taken to the New Inspection screen. Here, the user sees a centered Spediak brand name at the top and a Hamburger Menu icon at the top-left corner. The main area emphasizes a large image upload box with a camera/gallery icon and a prompt to “Tap to upload or take a photo.” Below this, a text field is available to either type or use the voice-to-text feature (with an editable transcription) to add a defect description. Once both image and description are provided, the “Generate DDID Response” button is activated.

After clicking the generate button, the app sends the image and description to the Open AI-powered backend while displaying a loading spinner near the button. On successful processing, a modal pop-up appears with the generated DDID statement, along with options to copy the report or close the modal. Once done, users can navigate the app solely via the Hamburger Menu to view their Inspection History—which updates in real time and shows a list of past inspection reports—or access Profile Settings to update personal data and state selection. This single-navigation approach keeps the user journey simple and uncluttered.

## 4. Core Features

*   **User Authentication:**

    *   Dedicated sign-up and login screens.
    *   Email verification and support for Google and Facebook logins.
    *   Secure session management using JWT and appropriate encryption.

*   **New Inspection Screen:**

    *   Image upload section with device-adapted behavior (pop-up options for mobile, direct file picker for desktop).
    *   Text description field with placeholder text and voice-to-text icon for transcription.
    *   Primary “Generate DDID Response” button that becomes active only when both image and description are provided.
    *   Secondary “New Inspection” button with confirmation flow if fields are filled.

*   **DDID Response Generation:**

    *   Integration with Open AI to process image and text inputs and generate a standardized DDID statement.
    *   Loading indicators (spinner) and clear error messages with a retry option in case of backend issues.
    *   Modal pop-up to display the generated statement with easy copy and close options.

*   **Inspection History Screen:**

    *   Scrollable list displaying past DDID reports with thumbnails, description snippets, partial DDID text, and timestamps.
    *   Ability to expand any record to see full DDID content with a copy function.
    *   Real-time updates when new inspections are completed.

*   **Profile Settings Screen:**

    *   Editable fields for full name, password, and a dropdown for state selection (North Carolina or South Carolina).
    *   View-only email field and optional profile picture with a default avatar fallback.

*   **Navigation:**

    *   Hamburger Menu as the sole navigation element across all screens, offering access to Home (New Inspection), Inspection History, Profile Settings, and Logout.

*   **Security & Accessibility:**

    *   Utilization of HTTPS for data encryption, secure API key management, and proper access control.
    *   Incorporation of adjustable font sizes, sufficient color contrast, screen reader support, and keyboard navigation for accessibility.

## 5. Tech Stack & Tools

*   **Frontend:**

    *   React for web interfaces.
    *   React Native with Expo for building mobile apps (iOS and Android) and web compatibility.

*   **Backend:**

    *   Node.js (v18+) and Express.js for server-side logic and API operations.

*   **Database & Storage:**

    *   Supabase serves as both the database and file storage solution, where defect images (JPEG and PNG, up to 5MB) are securely stored.

*   **AI Integration:**

    *   Open AI for generating DDID responses, using a secure API key supplied via backend environment variables.

*   **Development Tools:**

    *   Cursor IDE for advanced coding assistance and real-time suggestions.

## 6. Non-Functional Requirements

*   **Performance:**

    *   Fast response times for image uploads and report generation, with minimal delays in navigating between screens.
    *   Use loading indicators (spinners) for backend processing tasks to keep users informed.

*   **Security:**

    *   All data transmitted over HTTPS.
    *   API keys and user credentials stored and managed securely (using environment variables, encrypted channels, and salted hashing for passwords).
    *   Implementation of proper session management using JWT.

*   **Usability & Accessibility:**

    *   Mobile-first, touch-optimized design ensuring seamless experiences on smartphones and tablets.
    *   High contrast visuals, adjustable font sizes, and ARIA labels to support users with accessibility needs.
    *   Clean, minimalist layouts with plenty of whitespace and rounded elements for visual comfort.

*   **Reliability:**

    *   Real-time updates for inspection history and robust error handling for communication with the AI backend.
    *   Graceful fallback mechanisms for desktop users during image uploads.

## 7. Constraints & Assumptions

*   The app must rely solely on a Hamburger Menu for navigation—no tab bars, bottom navigation, or additional side menus are allowed.
*   Image files are stored in Supabase storage, with allowed file types limited to JPEG and PNG and a maximum file size of around 5MB.
*   The voice-to-text functionality will use the device's native transcription capabilities rather than an external API.
*   State selection (North Carolina or South Carolina) affects backend logic for DDID generation, with specific codes, standards, or terminologies applied based on the selected state.
*   API keys must not be hardcoded in the client application; they will be managed using secure environment variables and appropriate backend restrictions.
*   Social login is included as an alternative, but email/password remains the primary authentication method.
*   The app uses React Native for mobile development, avoiding native development in Swift or Kotlin.

## 8. Known Issues & Potential Pitfalls

*   **API Response Delays:**

    *   The DDID response generation powered by Open AI may experience delays. To mitigate this, a clear visual indicator (spinner) will be provided, and error messages with a retry option will be implemented.

*   **Image Upload Challenges:**

    *   Differences in file upload handling between mobile (pop-up/modal) and desktop (direct file picker) could lead to inconsistent user experiences. Thorough testing and graceful fallbacks are necessary.
    *   Enforcing file type and size constraints may require robust error handling and user feedback for rejected files.

*   **Navigation Consistency:**

    *   Strict adherence to the single Hamburger Menu navigation might restrict future expansion. Future integration of additional features must consider this constraint.

*   **Security Measures:**

    *   Managing API keys and sensitive user data requires diligent implementation of environment variables and secure storage. Regular security audits are advised.
    *   Handling user sessions with JWT must be carefully implemented to prevent unauthorized data access.

*   **Real-time Data Updates:**

    *   Keeping the Inspection History updated in real time could face issues with latency or data synchronization, so robust backend support and handling mechanisms are crucial.

This document provides a comprehensive blueprint for the Spediak App, ensuring that every technical and functional detail is covered to guide subsequent technical specification documents and development phases with clarity and precision.
