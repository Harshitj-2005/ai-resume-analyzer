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
