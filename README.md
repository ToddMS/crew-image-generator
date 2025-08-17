# Crew Image Generator

A full-stack application for generating custom rowing crew images with dynamic templates, boat configurations, and team management features.

## 🏗️ Architecture

This is a **monorepo** containing both frontend and backend applications:

```
crew-image-generator/
├── frontend/          # React TypeScript app
├── backend/           # Node.js Express API
├── .github/workflows/ # CI/CD pipelines
└── README.md         # This file
```

## 🚀 Live Deployments

- **Frontend**: [GitHub Pages](https://toddms.github.io/crew-image-generator)
- **Backend API**: [Render](https://crew-image-generator-backend.onrender.com)

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **CSS Modules** for styling
- **Context API** for state management

### Backend  
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** database
- **Google OAuth** authentication
- **Canvas API** for image generation

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (for backend)

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

## 📦 Deployment

### Frontend (GitHub Pages)
Automatically deploys from `main` branch via GitHub Actions.

### Backend (Render)
1. Connect your GitHub repo to Render
2. Set **Root Directory** to `backend`
3. Configure environment variables (see `backend/RENDER_DEPLOYMENT.md`)

## 🔧 Development Workflow

1. **Make changes** to frontend or backend
2. **Commit changes** to main branch
3. **GitHub Actions** automatically:
   - Builds and tests both applications
   - Deploys frontend to GitHub Pages
   - Validates backend (Render auto-deploys)

## 📁 Project Structure

- `frontend/` - React application with crew management UI
- `backend/` - Express API with image generation and data persistence
- `.github/workflows/` - CI/CD configuration
- `backend/RENDER_DEPLOYMENT.md` - Detailed deployment guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request
