# Claims Management Platform

A full-stack **Claims Management Platform** built with **React.js**, **Node.js (Express.js)**, and **MongoDB**. The application provides separate interfaces for **Patients** to submit insurance claims and **Insurers** to review, approve, or reject those claims.

---

## Features

### Patient Portal

- User Registration & Login (JWT Authentication)
- Submit a New Claim
- Upload Supporting Documents
- View Submitted Claims
- Track Claim Status (Pending, Approved, Rejected)
- View Approved Amount (if approved)
- View Insurer Comments

### Insurer Portal

- Secure Login
- View All Claims
- Filter Claims by Status
- View Uploaded Documents
- Approve or Reject Claims
- Add Approved Amount
- Leave Comments for Patients

---

## Tech Stack

### Frontend

- React.js
- React Router DOM
- Axios
- Tailwind CSS

### Backend

- Node.js
- Express.js
- JWT Authentication
- Multer (File Upload)
- Cloudinary (Document Storage)

### Database

- MongoDB Atlas
- Mongoose

---

## Project Structure

```text
ClaimCore/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   └── .env
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

# Installation

## 1. Clone Repository

```bash
git clone https://github.com/Abhi-7-github/ClaimCore.git
cd ClaimCore
```

---

# Backend Setup

Navigate to backend

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file inside the backend folder.

```env

PORT=8080

MONGO_URI=your_mongodb_connection_string
CLIENT_ORIGIN=http://localhost:5173

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

PUBLIC_BASE_URL=http://localhost:8080
MAX_FILE_SIZE=10485760

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_FOLDER=ClaimCore
```

Start the backend server

```bash
npm start
```

Backend runs on

```
http://localhost:8080
```

---

# Frontend Setup

Navigate to client folder

```bash
cd client
```

Install dependencies

```bash
npm install
```

Create `.env`

```env
VITE_API_URL=http://localhost:8080/api
```

Run the frontend

```bash
npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# Authentication

The application uses **JWT (JSON Web Token)** authentication.

### Login

```
POST /api/auth/login
```

Response

```json
{
    "success": true,
    "token": "YOUR_JWT_TOKEN"
}
```

For all protected APIs, include the following header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

# API Endpoints

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Register a new patient |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get logged-in user profile |

---

## Claims

| Method | Endpoint | Access |
|---------|----------|--------|
| POST | `/api/claims` | Patient |
| GET | `/api/claims` | Patient |
| GET | `/api/claims/:id` | Patient / Insurer |
| PUT | `/api/claims/:id` | Insurer |
| DELETE | `/api/claims/:id` | Patient (Optional) |

---

# Sample Login

## Patient

```json
{
    "email": "patient@example.com",
    "password": "Patient@123"
}
```

## Insurer

```json
{
    "email": "insurer@example.com",
    "password": "insurer@123"
}
```

---

# File Upload

Claim documents are uploaded using **multipart/form-data**.

Supported file formats

- PDF
- JPG
- JPEG
- PNG

Maximum file size

```
10 MB
```

Uploaded documents are stored securely in **Cloudinary**.

---

# Running the Project

Open two terminals.

### Terminal 1

```bash
cd backend
npm run dev
```

### Terminal 2

```bash
cd client
npm install
npm run dev
```

Visit

```
Frontend
http://localhost:5173

Backend
http://localhost:8080
```

---

# Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Backend server port |
| MONGO_URI | MongoDB Atlas connection string |
| JWT_SECRET | Secret used to sign JWT |
| JWT_EXPIRES_IN | JWT expiration time |
| PUBLIC_BASE_URL | Backend base URL |
| MAX_FILE_SIZE | Maximum upload size (bytes) |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API Key |
| CLOUDINARY_API_SECRET | Cloudinary API Secret |
| CLOUDINARY_FOLDER | Cloudinary folder for uploaded documents |

---

# Future Improvements

- Email Notifications
- Admin Dashboard
- Claim History Timeline
- Pagination
- Search Functionality
- Sorting & Advanced Filters
- Unit Testing
- Docker Support
- Role-Based Access Control
- Refresh Token Authentication

---

# Author

**Kollepara Jaya Ratna Abhiram**

GitHub: https://github.com/Abhi-7-github/ClaimCore

---

# Assignment

This project was developed as part of the **3-Day Claims Management Platform Assignment**, implementing:

- Patient claim submission portal
- Insurer claim management portal
- JWT Authentication
- REST APIs
- MongoDB Database
- File Upload Support
- Responsive React Frontend
- Express.js Backend