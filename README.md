# ClaimCore

ClaimCore is a claims management platform with a Node.js and Express backend, MongoDB persistence, JWT-based authentication, role-based access control, and multipart claim document uploads.

## Overview

The platform supports two roles only:

- patient
- insurer

Patients submit and view their own claims. Insurers review, filter, and update claims.

The backend code lives in [backend/](backend), while [server/](server) contains the package entry used to run the API in this workspace layout.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- multer
- Cloudinary with local upload fallback
- dotenv
- express-validator

## Folder Structure

```text
backend/
├── app.js
├── server.js
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── uploads/
├── utils/
└── validators/
```

## Installation

1. Install backend dependencies.

```bash
cd server
npm install
```

2. Create your environment file in `backend/.env`.

3. Start MongoDB locally or point `MONGO_URI` to a hosted database.

## Environment Variables

Use the following variables in `backend/.env`:

```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/claimcore
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
PUBLIC_BASE_URL=http://localhost:5000
MAX_FILE_SIZE=10485760

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=claimcore-documents
```

Notes:

- `CLOUDINARY_*` values are optional.
- If Cloudinary is not configured, claim documents are stored locally in `backend/uploads/`.
- `PUBLIC_BASE_URL` is used to build local document URLs.
- `MAX_FILE_SIZE` is the multer upload limit in bytes.

## Run Commands

From the [server/](server) directory:

```bash
npm run dev
```

```bash
npm start
```

Current script behavior:

- `npm run dev` starts the backend with `nodemon` watching `backend/`.
- `npm start` starts the same backend entrypoint through `nodemon` as configured in [server/package.json](server/package.json).

## Architecture

The backend follows a controller-service pattern:

- routes define request validation and access control
- controllers shape HTTP responses
- services contain business logic and database operations
- middleware handles auth, role checks, uploads, validation, and errors

## Authentication

### POST /api/auth/register

Registers a user.

Request body:

```json
{
	"name": "John Doe",
	"email": "john@example.com",
	"password": "Password123!",
	"role": "patient"
}
```

Validation:

- `name` is required
- `email` must be valid
- `password` must be at least 8 characters
- `role` must be `patient` or `insurer` when provided

Response includes a JWT token and the created user.

### POST /api/auth/login

Logs a user in with email and password.

Request body:

```json
{
	"email": "john@example.com",
	"password": "Password123!"
}
```

Response includes a JWT token and the authenticated user.

### GET /api/auth/profile

Returns the authenticated user profile.

Header:

```http
Authorization: Bearer <token>
```

## Claims Model

### User

- name
- email
- password
- role
- createdAt
- updatedAt

### Claim

- patient
- name
- email
- claimAmount
- description
- documentUrl
- status
- approvedAmount
- insurerComments
- submittedAt
- reviewedAt
- createdAt
- updatedAt

Status values:

- Pending
- Approved
- Rejected

## Patient APIs

All patient routes require a valid JWT for a user with the `patient` role.

### POST /api/claims

Submits a claim using `multipart/form-data`.

Fields:

- `name`
- `email`
- `claimAmount`
- `description`
- `document`

Example form-data:

```text
name=John Doe
email=john@example.com
claimAmount=1500
description=Medical reimbursement
document=<file>
```

Behavior:

- the uploaded document is stored in Cloudinary when configured
- otherwise the file is saved locally under `backend/uploads/`
- claim `status` defaults to `Pending`

### GET /api/claims/my

Returns the logged-in patient's claims, sorted by latest first.

## Insurer APIs

All insurer routes require a valid JWT for a user with the `insurer` role.

### GET /api/claims

Returns all claims with filtering and pagination.

Supported query parameters:

- `status`
- `minAmount`
- `maxAmount`
- `date`
- `search`
- `patientName`
- `page`
- `limit`

Example:

```http
GET /api/claims?status=Pending&minAmount=1000&maxAmount=5000&page=1&limit=10
```

### GET /api/claims/:id

Returns full claim details by claim ID.

### PUT /api/claims/:id

Updates a claim.

Request body:

```json
{
	"status": "Approved",
	"approvedAmount": 1200,
	"insurerComments": "Approved after document verification"
}
```

Behavior:

- `reviewedAt` is automatically updated whenever a claim is reviewed
- insurer-only access is enforced by middleware

## Middleware

- `authMiddleware` validates JWTs and attaches the authenticated user to `req.user`
- `roleMiddleware` enforces role-based authorization
- `uploadMiddleware` handles multipart claim document uploads
- `validateRequest` centralizes express-validator error handling
- `errorHandler` normalizes API errors and returns proper status codes

## Error Handling

The backend returns structured JSON errors with appropriate HTTP status codes:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Internal Server Error

## Response Format

Success responses use a consistent shape:

```json
{
	"success": true,
	"message": "...",
	"data": {}
}
```

## Health Check

The API exposes a simple health endpoint:

```http
GET /health
```

## Example Workflow

1. Register a patient.
2. Log in and copy the JWT token.
3. Submit a claim with a document.
4. Log in as an insurer.
5. List claims, inspect a claim, and update its status.

## Notes

- Passwords are hashed with bcrypt before storage.
- JWT payloads include `userId` and `role`.
- Claim submission requires a file field named `document`.
- Validation is applied to every implemented endpoint.