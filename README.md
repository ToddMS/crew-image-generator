# Crew Image Generator Monorepo

A full-stack application for generating crew lineup images with a React frontend and Node.js backend.

## Project Structure

```
crew-image-generator-monorepo/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + TypeScript
├── package.json       # Root package.json for monorepo scripts
└── README.md         # This file
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. Install dependencies for all projects:
```bash
npm run install:all
```

### Development

Start both projects individually in separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will start at `http://localhost:8080`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will start at `http://localhost:5173`

Or start both with concurrently:
```bash
npm run dev
```

### Building

Build both projects:
```bash
npm run build
```

Or build individually:
```bash
npm run build:frontend
npm run build:backend
```

## Frontend

React application built with:
- TypeScript
- Vite
- Material-UI
- React Icons

## Backend

Node.js API built with:
- Express
- TypeScript
- Image generation capabilities

## Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both projects
- `npm run install:all` - Install dependencies for all projects
- `npm run clean` - Clean node_modules from all projects