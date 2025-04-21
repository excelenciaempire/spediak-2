# Implementation plan

Below is a step-by-step implementation plan based on the Spediak app project documents, user requirements, and technical specifications.

## Phase 1: Environment Setup

1.  **Prevalidation:** Check if the current directory is already an initialized project (i.e., verify the existence of key directories like `/web`, `/mobile`, `/backend`) before starting a new setup. (Reference: Project Overview, Project Rules)

2.  **Node.js Setup:** Verify that Node.js (v18+) is installed. If not, install Node.js v18+ as specified. **Validation:** Run `node -v` and check that the version is 18.x. (Reference: Technical Stack: Backend)

3.  **Expo CLI Setup:** Ensure Expo CLI is installed (for React Native development) and confirm its version. (Reference: Technical Stack: Frontend)

4.  **Directory Structure:** Create the base directories if they are not already present: `/web/src`, `/mobile`, `/backend`, and `/assets`. (Reference: Project Rules)

5.  **Cursor Environment Setup:**

    *   Check if the project is already set up for Cursor by verifying a `.cursor` directory in the project root.
    *   If not present, create a `.cursor` directory in the project root. (Reference: IDE: Cursor)

6.  **Create MCP Configuration for Cursor:**

    *   Inside the `.cursor` directory, create a file named `mcp.json` if it does not exist.
    *   Add `.cursor/mcp.json` to the project's ignore file (e.g., `.gitignore`). **Warning:** Ensure the actual `<connection-string>` value used in `mcp.json` is *never* committed to version control. (Reference: IDE: Cursor)

7.  **Verify MCP Command (Action Required):** Verify the recommended MCP command for Supabase integration. Add a note: "Verify the MCP Supabase server command (`@modelcontextprotocol/server-postgres`?) is current and correct before execution." (Reference: IDE: Cursor, Supabase)

8.  **Insert Supabase MCP Configuration (Cursor):**

    *   For macOS, add the following configuration in `.cursor/mcp.json` (after verifying the command):

    `{ "mcpServers": { "supabase": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-postgres", "<connection-string>"] } } }`

    *   For Windows, add:

    ``{ "mcpServers": { "supabase": { "command": "cmd", "args": ["/c", "npx", "-y", "@modelcontextprotocol/server-postgres", "`<connection-string>`"] } } }``

    *   **Note:** Display the following link to obtain your Supabase connection string: <https://supabase.com/docs/guides/getting-started/mcp#connect-to-supabase-using-mcp>. Replace `<connection-string>` with the real string once obtained and **do not commit it**.

9.  **Verify MCP Connection:** Navigate to **Settings/MCP** in your Cursor IDE and check for a green active status.

## Phase 2: Frontend Development

1.  **Project Initialization (Web & Mobile):**

    *   Initialize a React project inside the `/web` directory.
    *   Initialize an Expo project inside the `/mobile` directory. (Reference: Technical Stack: Frontend, Project Rules)
    *   **Validation:** Confirm project structure and run `expo start` for the mobile project; run `npm start` (or equivalent) for the React web app.

2.  **UI Theme Setup:**

    *   Configure the global CSS/theme for the app with the following specs: Background `#F4F6F8`, Primary `#0A2540`, Secondary `#FFFFFF`, Accent `#28A745`, Dark Text `#333333`. (Reference: Frontend Guidelines)

3.  **Font Setup:**

    *   Import and set up the chosen font (Helvetica or Arial) in both web and mobile projects. (Reference: Frontend Guidelines) **Note:** Confirm final font choice if necessary.

4.  **State Management Setup:**

    *   Set up State Management using Context API for global state like authentication status and user profile. Consider Redux only if complexity significantly increases later. (Reference: Frontend Guidelines)

5.  **Authentication Screens (Web & Mobile):**

    *   Create Login, Sign Up, and Forgot Password screens/routes in both `/web/src/routes` (or `/web/src/views`) and `/mobile/screens`.
    *   Implement UI elements for email/password input, social login buttons (Google/Facebook), and submission logic.
    *   Implement the email verification flow logic (e.g., showing a prompt or redirecting after signup). (Reference: Requirements, App Flow)

6.  **Hamburger Menu Navigation:**

    *   Build a reusable hamburger menu component. Implement as a shared component if feasible, ensuring identical functionality and appearance in both web and mobile apps.
    *   Include navigation items for: New Inspection, Inspection History, Profile Settings, and Logout. (Reference: Requirements)

7.  **New Inspection Screen:**

    *   Create `NewInspectionScreen.js` under `/mobile/screens/` and a corresponding route/view (e.g., `NewInspection.jsx`) under `/web/src/routes/`.
    *   Implement an image upload component with support for camera/gallery on mobile (Expo ImagePicker) and file picker on desktop. Add a thumbnail preview widget.
    *   Implement client-side validation for image file type (JPEG/PNG) and size (<5MB) before uploading. (Reference: Requirements)

8.  **Voice-to-Text Integration:**

    *   Add a text description field with built-in support for device native voice-to-text (e.g., using platform APIs or Expo Speech). Ensure text is editable. (Reference: Requirements)

9.  **DDID Generation Button:**

    *   Add a button labeled "Generate DDID Response". The button should remain disabled until both an image and a text description are provided. Include a loading indicator (spinner) activation on press. (Reference: Requirements)

10. **DDID Result Popup:**

    *   On successful generation, show a modal popup that displays the DDID with copy and close buttons. (Reference: Requirements)

11. **Inspection History Screen:**

    *   Create `InspectionHistoryScreen.js` under `/mobile/screens/` and a corresponding route/view under `/web/src/routes/`.
    *   Implement a scrollable list that displays past inspections using data fetched from the backend. Each item should include a thumbnail, truncated description, DDID snippet, and date/time.
    *   Allow expansion of each record to reveal full DDID and a copy option. (Reference: Requirements)

12. **Profile Settings Screen:**

    *   Create `ProfileSettingsScreen.js` under `/mobile/screens/` and a corresponding route/view under `/web/src/routes/`.
    *   Add editable fields: Full Name and Password (using secure input). Provide a read-only Email field, state selection dropdown (only North Carolina and South Carolina), and an area for profile pictures (with default avatar). (Reference: Requirements)

13. **Accessibility Enhancements:**

    *   Ensure components have adjustable font sizes, proper ARIA labels (web) / accessibility props (mobile), sufficient color contrast, alt text for images, and large, touchable elements. (Reference: Requirements, Frontend Guidelines)

14. **Validation:**

    *   Perform UI tests (using Jest/React Testing Library for web, Jest/Expo testing utilities for mobile) to ensure components render correctly.

## Phase 3: Backend Development

1.  **Express App Initialization:**

    *   Create the backend Express app in `/backend/app.js` (or `server.js`) using Node.js (v18+). (Reference: Technical Stack: Backend, Project Rules)

2.  **Middleware & Security:**

    *   Set up middleware for JSON parsing, CORS (restrict to frontend domains in production), and consider HTTPS redirection if applicable (often handled by deployment platform).
    *   Implement security-related HTTP headers using a library like Helmet.js. (Reference: Security Guidelines, Backend Structure)

3.  **Centralized Error Handling:**

    *   Implement centralized error handling middleware to catch and format API errors consistently, including specific handling for potential OpenAI API errors. (Reference: Project Rules, Backend Structure)

4.  **User Authentication Endpoints:**

    *   Implement sign-up (`POST /api/v1/auth/signup`), login (`POST /api/v1/auth/login`), and potentially email verification (`GET /api/v1/auth/verify/:token`) endpoints in `/backend/routes/auth.js`. Use bcrypt for password hashing and JWT for session management. (Reference: Requirements, Backend Structure)

5.  **Social Login Integration:**

    *   Implement backend endpoints to handle OAuth callbacks for Google and Facebook login. (Reference: Requirements)

6.  **DDID Generation Endpoint & Image Analysis:**

    *   **Endpoint:** Create `POST /api/v1/inspections/generate-ddid` in `/backend/routes/inspections.js`.
    *   **Input:** Accepts image URL (from Supabase) and text description.
    *   **OpenAI Image Requirements:** Investigate and confirm OpenAI Vision API's specific requirements (supported formats beyond JPEG/PNG, resolution limits/recommendations, data encoding).
    *   **Image Preprocessing:** Implement backend logic to perform necessary image preprocessing if required by OpenAI (e.g., resizing, format validation/conversion if needed) before sending to the API.
    *   **Data Transfer to OpenAI:** Determine and implement the method for sending the image to OpenAI (e.g., passing the public Supabase URL if supported, or downloading the image data from Supabase and sending the bytes). Prioritize passing the URL if possible and secure.
    *   **Prompt Engineering:** Design and iteratively refine the prompt sent to OpenAI, ensuring it effectively combines the image input and text description to guide the AI towards generating accurate and well-formatted DDID statements.
    *   **State Logic:** Ensure this endpoint includes logic to handle state-specific DDID formatting based on the user's profile setting (NC or SC).
    *   **OpenAI Call:** Call the OpenAI API (using secure environment variable for API key) with the prepared image data/URL and prompt.
    *   **Error Handling:** Implement robust error handling specifically for the OpenAI call, distinguishing between network/API errors and image analysis failures (e.g., "image unprocessable", format errors). Return informative error messages to the frontend. (Reference: Requirements, Project Rules)

7.  **Inspection Data Endpoints:**

    *   Create endpoints `POST /api/v1/inspections` (for saving new inspections *after* successful DDID generation), `GET /api/v1/inspections` (to list user's history), `GET /api/v1/inspections/:id` (to get specific details) in `/backend/routes/inspections.js`. Store/retrieve data in Supabase. (Reference: Requirements, Backend Structure)
    *   **Validation:** Test endpoints using `curl` or Postman to ensure correct responses and status codes.

8.  **Profile Settings Endpoints:**

    *   Create endpoints `GET /api/v1/user/profile` and `PUT /api/v1/user/profile` in `/backend/routes/user.js` to fetch and update user profile data (name, password hash, state) in Supabase. (Reference: Requirements, Backend Structure)

9.  **Supabase Setup & Schema:**

    *   Configure Supabase connection in the backend using environment variables for URL and API key.
    *   Define the following schemas using Supabase (PostgreSQL):

        *   **Users Table:** `user_id`, `email`, `hashed_password`, `full_name`, `profile_image_url`, `state`, `created_at`.
        *   **Inspections Table:** `inspection_id`, `user_id` (foreign key), `image_url`, `description`, `ddid_response`, `created_at`.

    *   Use Supabase dashboard or migration tool (or verified MCP server) to create these tables and relationships.
    *   Configure Supabase Row Level Security (RLS) policies to ensure users can only access/modify their own data. (Reference: Technical Stack, Backend Structure, Security Guidelines)

10. **Realtime Updates:**

    *   Implement realtime updates for the Inspection History screen using Supabase Realtime subscriptions on the `inspections` table. (Reference: Requirements, Backend Structure)

11. **Validation:**

    *   Write backend API tests (using Mocha, Jest, or Supertest) under `/backend/tests/` and run them to ensure proper API functionality, including authentication checks, data validation, and simulating OpenAI success/failure scenarios.

## Phase 4: Integration

1.  **Connect Frontend to Backend:**

    *   Implement API client/service functions in the frontend (both web and mobile) to communicate with the backend endpoints. Handle loading states and potential errors returned from the backend, including specific image analysis errors.
    *   Store the backend API base URL in frontend environment variables (e.g., `.env` files or Expo constants) - do not hardcode URLs. (Reference: App Flow)

2.  **API Integration Testing:**

    *   Validate integration using tools like Postman or Insomnia, or preferably, automated integration tests within the frontend/backend test suites. Test success and error paths for DDID generation. (Reference: Testing)

3.  **Realtime Data Integration:**

    *   Ensure the mobile/web UI for Inspection History correctly subscribes to Supabase Realtime updates and updates the list dynamically. (Reference: Requirements)

4.  **Validation:**

    *   Run end-to-end tests (manually or using tools like Cypress for web, Detox/Appium for mobile) to confirm data flows correctly: signup -> login -> create inspection (test with various valid JPEG/PNG images, including sizes near 5MB limit, and potentially edge cases like very low/high resolution if feasible) -> view history -> update profile -> logout. Verify DDID response display and error handling for failed image analysis.

## Phase 5: Deployment

1.  **Backend Deployment:**

    *   Prepare a production build of the Express app. Deploy it to your chosen cloud service (e.g., AWS, Google Cloud, Heroku, Render).
    *   Ensure all required environment variables (Supabase URL/keys, OpenAI key, JWT secret, frontend URL for CORS) are securely configured in the production environment. Enable HTTPS. (Reference: Deployment, Security)

2.  **Frontend Deployment (Web):**

    *   Build and deploy the React web app to a hosting platform (e.g., Vercel, Netlify, AWS Amplify).
    *   Ensure the backend API URL environment variable is correctly set for the production build. (Reference: Deployment)

3.  **Mobile App Deployment:**

    *   Use Expo Application Services (EAS) Build to create builds for iOS and Android.
    *   Configure environment variables (like the backend API URL) securely using Expo Secrets for EAS Build.
    *   Follow Expo/store guidelines for deployment to the Apple App Store and Google Play Store. (Reference: Requirements, Deployment)

4.  **CI/CD Pipeline:**

    *   Configure automated testing and deployment pipelines (using GitHub Actions, GitLab CI, CircleCI, etc.) for backend, web frontend, and potentially EAS updates/builds. Include integration tests in the pipeline. (Reference: Deployment)

5.  **Post-Deployment Testing:**

    *   Run end-to-end tests on the production environment. Focus testing on core user flows (authentication, inspection creation/viewing with diverse images, profile updates) across web, iOS, and Android, including performance and error handling checks. (Reference: Testing)

This revised plan incorporates feedback from all project documents, addresses potential ambiguities, explicitly details image handling and OpenAI analysis steps, and aligns with specified requirements and guidelines, providing a clearer roadmap for development. Remember to verify the MCP command in Phase 1.
