# RowGram Setup Instructions

## Environment Configuration

### 1. Backend Setup

1. Copy the example environment file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Update `backend/.env` with your credentials:
   - Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
   - Generate a strong random string for `SESSION_SECRET`

### 2. Frontend Setup

1. Copy the example environment file:
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```

2. Update `frontend/.env.local` with:
   - Same `GOOGLE_CLIENT_ID` as your backend
   - Correct backend API URL (usually `http://localhost:8080`)

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Identity Services API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `http://localhost:5173` (frontend dev server)
   - `http://localhost:8080` (backend server)

## Security Notes

- **Never commit `.env` files** - they are in `.gitignore`
- **Never share your Google Client Secret** publicly
- **Use strong random strings** for session secrets in production
- **Rotate credentials** regularly in production environments

## Database Setup

1. Ensure MySQL is running
2. Run the database schema files in order:
   ```bash
   mysql -u root -p < backend/database/schema.sql
   mysql -u root -p < backend/database/auth_schema.sql
   ```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development servers:
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend (in new terminal)
   cd frontend && npm run dev
   ```