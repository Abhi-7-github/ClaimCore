# ClaimCore

ClaimCore is a claims management platform with a React frontend and a Node.js/Express backend.

## How to Run

### Backend

1. Open a terminal in the `backend` folder.
2. Install dependencies if needed:

```bash
npm install
```

3. Make sure `backend/.env` is configured.
4. Start the API:

```bash
npm run dev
```

The backend runs on `http://localhost:8080`.

### Backend Environment Variables

Create `backend/.env` with these variables:

```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/claimcore
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
PUBLIC_BASE_URL=http://localhost:8080
MAX_FILE_SIZE=10485760

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=claimcore-documents
```

Notes:

- `PORT` controls the backend port.
- `MONGO_URI` points to your MongoDB database.
- `JWT_SECRET` signs login tokens.
- `JWT_EXPIRES_IN` controls token lifetime.
- `PUBLIC_BASE_URL` is used when building local upload URLs.
- `MAX_FILE_SIZE` is the upload limit in bytes.
- `CLOUDINARY_*` values are optional. Leave them blank if you want to use local file uploads.

### Frontend

1. Open a second terminal in the `client` folder.
2. Install dependencies if needed:

```bash
npm install
```

3. Make sure `client/.env` contains:

```env
VITE_API_URL=http://localhost:8080/api
```

4. Start the React app:

```bash
npm run dev
```

## Dummy User Accounts

Use these sample accounts to test the application:

- Patient
  - Email: `patient1@gmail.com`
  - Password: `paitent@123`

- Insurer
  - Email: `insurer1@gmail.com`
  - Password: `insurer@123`

## Notes

- Patients can submit claims and view their own claim history.
- Insurers can review, filter, approve, and reject claims.
- Claim uploads use the `document` file field.
- The backend must be running before you log in or submit requests.
