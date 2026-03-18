# Workflow of App Authentication

Below is a complete, step-by-step workflow of the authorization system
in your app. This covers the full-stack authentication process,
including registration, login, logout, session persistence, route
protection, and error handling.

I'll break it down by user actions and internal processes, referencing
the relevant files and components.

------------------------------------------------------------------------

# Key Components Involved

## Frontend

-   auth.context.jsx -- Provides global auth state (user, loading) and
    wraps the app.
-   useAuth.js -- Hook for auth actions (login, register, logout).
-   api.auth.js -- API calls to backend.
-   Login.jsx / Register.jsx -- UI forms.
-   Protected.jsx -- Component that guards routes.
-   app.routes.jsx -- Defines routes with protection.

## Backend

-   auth.controller.js -- Handles logic for register, login, logout,
    getme.
-   auth.routes.js -- Defines API endpoints.
-   auth.middleware.js -- Verifies JWT tokens for protected routes.
-   user.model.js -- MongoDB schema for users.
-   blacklist.model.js -- For logout (blacklists tokens).

The system uses JWT tokens stored in HTTP-only cookies for security,
with bcrypt for password hashing and MongoDB for user storage.

------------------------------------------------------------------------

# 1. App Startup / Session Persistence (Automatic Login Check)

Trigger: When the app loads or refreshes.

## Frontend Process

Authprovider (in auth.context.jsx) mounts and runs useEffect.

-   loading starts as true, user as null
-   Calls getme() API (via fetchUser function)

If successful: - Sets user to the returned user data - Sets loading to
false

If failed (e.g., no/invalid cookie): - Sets user to null - Sets loading
to false

## Backend Process

Receives GET /api/auth/get-me with cookie.

auth.middleware.js verifies the JWT token: - Decodes token - Checks
expiry - Fetches user from DB

If valid, req.user is set with user details.

If invalid, returns 401 error.

getmecontroller uses req.user.\_id to query the user and returns:

{ user: { \_id, username, email } }

Outcome: User is automatically "logged in" if cookie is valid.

------------------------------------------------------------------------

# 2. User Registration

Trigger: User visits /register, fills form, and submits.

## Frontend Process (Register.jsx)

Calls handleRegister from useAuth hook.

Steps: 1. Sets loading to true 2. Sends POST to /api/auth/register with
{ username, email, password } 3. On success: - Sets user state -
Navigates to / 4. On error: - Logs it 5. Sets loading to false

## Backend Process

registerusercontroller:

-   Validates input
-   Checks if username/email exists in DB
-   Hashes password with bcrypt
-   Creates user in DB

Generates JWT token (expires in 1 day) and sets HTTP-only cookie.

Returns:

{ user: { \_id, username, email } }

Outcome: User is registered, logged in, and redirected to home.

------------------------------------------------------------------------

# 3. User Login

Trigger: User visits /login, enters credentials, and submits.

## Frontend Process (Login.jsx)

Calls handlelogin from useAuth hook.

Steps: 1. Sets loading to true 2. Sends POST to /api/auth/login with {
email, password } 3. On success: - Sets user state - Navigates to / 4.
On error: - Logs it 5. Sets loading to false

## Backend Process

loginusercontroller:

-   Validates input
-   Finds user by email
-   Compares password with bcrypt

If valid: - Generates JWT token - Sets HTTP-only cookie

Returns:

{ user: { \_id, username, email } }

Outcome: User is logged in and redirected to home.

------------------------------------------------------------------------

# 4. Accessing Protected Routes

Routes like / are wrapped in:

`<Protected>`{=html} `<content>`{=html} `</Protected>`{=html}

Protected checks useAuth():

-   If loading is true → shows "Loading......"
-   If loading is false and user is null → redirects to /login
-   If loading is false and user exists → renders the children

Outcome: Authenticated users see content; others are redirected.

------------------------------------------------------------------------

# 5. User Logout

Trigger: User clicks logout.

## Frontend Process

Calls handlelogout.

Steps: 1. Sets loading to true 2. Sends GET to /api/auth/logout 3. On
success → sets user to null 4. On error → logs it 5. Sets loading to
false

## Backend Process

logoutusercontroller:

-   Gets token from cookie
-   Adds token to blacklist
-   Clears cookie

Outcome: User is logged out and must re-login.

------------------------------------------------------------------------

# 6. Middleware and Security

### JWT Verification

auth.middleware.js checks cookie for token, verifies signature and
expiry, and ensures it is not blacklisted.

If valid → req.user is set.\
If invalid → 401 error.

### Cookies

-   HTTP-only
-   Secure
-   Sent automatically with withCredentials: true

### Password Security

Passwords hashed with bcrypt (10 rounds).

### Error Handling

Frontend logs errors.\
Backend returns 400/401 for bad requests.

------------------------------------------------------------------------

# Potential Issues and Notes

-   No Error UI -- errors are logged but not shown to users.
-   Loading States -- prevents UI flicker during async operations.
-   Session Expiry -- tokens expire in 1 day.
-   Blacklist -- logout invalidates tokens.
-   Testing -- use browser dev tools to inspect cookies.

------------------------------------------------------------------------

This workflow ensures secure, persistent authentication.

------------------------------------------------------------------------

# AI Interview Report Generation Workflow

Below is a complete, step-by-step workflow of the AI-powered interview report generation system in your app. This covers the process of generating personalized interview reports using AI, including file upload, data processing, AI inference, and database storage.

I'll break it down by user actions and internal processes, referencing the relevant files and components.

------------------------------------------------------------------------

# Key Components Involved

## Backend

-   interview.controller.js -- Handles the logic for generating interview reports, including file parsing and AI integration.
-   interview.routes.js -- Defines the API endpoint for interview report generation.
-   ai.service.js -- AI service using Google GenAI (Gemini) to generate structured interview reports.
-   interviewReport.model.js -- MongoDB schema for storing interview reports.
-   file.middleware.js -- Multer middleware for handling file uploads (PDF resumes).
-   auth.middleware.js -- Ensures the user is authenticated before generating reports.

The system uses Google GenAI for AI inference, Zod for schema validation, pdf-parse for extracting text from PDFs, and MongoDB for persistence.

------------------------------------------------------------------------

# 1. User Submits Interview Report Request

Trigger: User uploads a resume (PDF), provides job description and self-description, and submits the form.

## Frontend Process

(Assuming a form component exists that sends a POST request to /api/interview/)

-   User selects PDF resume file
-   Enters job description (string) and self-description (string)
-   Submits form with multipart/form-data (resume as file, others as body)

## Backend Process

Receives POST /api/interview/ with authenticated user (via auth.middleware.js), file upload (via file.middleware.js), and body data.

interview.controller.js - generateInterviewReportcontroller function:

Arguments:
-   req.file: The uploaded PDF resume (buffer)
-   req.body: { jobDescription: string, selfDescription: string }
-   req.user: Authenticated user object (from middleware)

Steps:
1. Parses the PDF resume using pdf-parse:
   - Input: Uint8Array.from(req.file.buffer)
   - Returns: Object with .text property containing extracted text

2. Calls generateInterviewReport from ai.service.js:
   - Arguments: { resume: string (extracted text), jobDescription: string, selfDescription: string }
   - Returns: Promise resolving to interview report object

3. Creates a new interview report document in MongoDB:
   - Uses interviewReport.model.js schema
   - Fields: user (ObjectId), resume (string), jobDescription (string), selfDescription (string), plus AI-generated fields
   - Returns: Created document

Returns JSON response:
-   Status: 201
-   Body: { message: "Interview report generated successfully", interviwereport: <created document> }

Outcome: Interview report is generated, stored, and returned to the user.

------------------------------------------------------------------------

# 2. AI Service Processing (generateInterviewReport Function)

Located in ai.service.js

Function Signature:
async function generateInterviewReport({ resume, selfDescription, jobDescription })

Arguments:
-   resume: string (extracted text from PDF)
-   selfDescription: string (user's self-description)
-   jobDescription: string (job requirements)

Process:
1. Constructs a prompt string combining resume, selfDescription, and jobDescription
2. Uses Google GenAI (gemini-3-flash-preview model) to generate content
3. Configures response with JSON schema validation using Zod
4. Parses the AI response as JSON

Returns: Object matching interviewReportSchema (Zod schema):
{
    matchScore: number (0-100),
    technicalQuestions: Array<{
        question: string,
        intention: string,
        answer: string
    }>,
    behavioralQuestions: Array<{
        question: string,
        intention: string,
        answer: string
    }>,
    skillGaps: Array<{
        skill: string,
        severity: "low" | "medium" | "high"
    }>,
    preparationPlan: Array<{
        day: number,
        focus: string,
        tasks: string[]
    }>,
    title: string
}

------------------------------------------------------------------------

# 3. Database Storage (InterviewReport Model)

Located in interviewReport.model.js

Schema Fields:
-   jobDescription: String (required)
-   resume: String
-   selfDescription: String
-   matchScore: Number (0-100)
-   technicalQuestions: Array of objects (question, intention, answer)
-   behavioralQuestions: Array of objects (question, intention, answer)
-   skillGaps: Array of objects (skill, severity)
-   preparationPlan: Array of objects (day, focus, tasks)
-   user: ObjectId (ref: 'User')
-   timestamps: true

Creation: interviewReportModel.create({ ...data })

Returns: Mongoose document with _id, createdAt, updatedAt, etc.

------------------------------------------------------------------------

# 4. File Upload Handling (File Middleware)

Located in file.middleware.js

Uses Multer with memory storage:
-   Limits: fileSize: 3MB
-   Stores file in memory as buffer

Applied via upload.single('resume') in routes.

Provides req.file with buffer property for PDF parsing.

------------------------------------------------------------------------

# 5. Route Definition

Located in interview.routes.js

Route: POST /
-   Middleware: authmiddleware.authUser (requires authentication)
-   Middleware: upload.single('resume') (handles file upload)
-   Handler: generateInterviewReportcontroller

Endpoint: /api/interview/ (assuming base path in server.js)

------------------------------------------------------------------------

# Potential Issues and Notes

-   PDF Parsing: Relies on pdf-parse; may fail with complex PDFs or images.
-   AI Response: Depends on Google GenAI API; requires GEMINI_API_KEY env var.
-   File Size: Limited to 3MB; larger files will be rejected.
-   Schema Validation: Zod ensures structured output; AI may occasionally deviate.
-   Authentication: Route is protected; unauthenticated requests return 401.
-   Database: Stores full report; consider indexing for performance.
-   Error Handling: Basic; add try-catch for AI failures or DB errors.

------------------------------------------------------------------------

This workflow enables AI-generated, personalized interview preparation reports.

------------------------------------------------------------------------

# Project Architecture & Directory Structure

This project is a Full-Stack Web Application built using React (Frontend) and Node.js/Express (Backend) with MongoDB.

## Backend (Node.js + Express)
The backend is a RESTful API built with Express, organized using the MVC (Model-View-Controller) architecture.

### Tech Stack:
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (using Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) stored in HTTP-only cookies
- **AI Integration:** Google GenAI (Gemini API) for processing resumes
- **PDF Handling:** `multer` (for upload in memory) + `pdf-parse` (for text extraction) + `puppeteer` (for generating PDF reports)

### Key Directories:
- `/src/config/` - Database connection and configuration files.
- `/src/controllers/` - Contains the core business logic (e.g., handling requests and formatting responses for auth and interviews).
- `/src/middleware/` - Express middleware functions (e.g., `auth.middleware.js` to protect routes, `file.middleware.js` for handling file uploads).
- `/src/models/` - Mongoose schemas defining the structure of MongoDB documents (`user.model.js`, `interviewReport.model.js`).
- `/src/routes/` - Maps HTTP API endpoints to controller functions.
- `/src/services/` - External services and heavy logic (e.g., `ai.service.js` connecting to Gemini).

------------------------------------------------------------------------

## Frontend (React + Vite)
The frontend is a single-page application (SPA) built with React and bundled using Vite for fast development.

### Tech Stack:
- **Framework:** React 19
- **Bundler:** Vite
- **Routing:** React Router
- **Styling:** SCSS (Sass) for component-level styling
- **API Client:** Axios for making HTTP requests to the backend
- **State Management:** React Context API (e.g., `auth.context.jsx`, `interview.context.jsx`)

### Key Directories & Concepts:
- `/src/features/` - The app uses a "Feature-Sliced" or modular architecture where code is grouped by feature rather than type.
  - `/features/auth/` - Contains all components, pages, hooks, services, and context related to User Authentication.
  - `/features/interview/` - Contains everything related to generating and viewing AI Interview reports.
- **Inside each Feature:**
  - `/components/` - Reusable UI components specific to the feature.
  - `/pages/` - Full screen React components representing routes (e.g., `Home.jsx`, `interview.jsx`, `Login.jsx`).
  - `/hooks/` - Custom React hooks (e.g., `useAuth.js`, `useinterview.js`) to abstract away complex logic from components.
  - `/services/` - Axios API caller files defining how to talk to the backend endpoints (e.g., `interview.api.js`).
  - `/style/` - Directory containing specific SCSS files imported into components.

## How They Connect
1. The **Frontend** runs locally on your machine.
2. The **Backend** runs on port `3000`.
3. The frontend `Axios` instance is configured with `withCredentials: true` and a `baseURL` pointing to the backend, enabling it to securely receive and automatically send HTTP-only JWT cookies for authentication.
