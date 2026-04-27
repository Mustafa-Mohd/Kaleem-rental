# Kaleem Rent

A property rental management web application built with React, TypeScript, Vite, and Supabase.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js >= 18 & npm (or bun)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the frontend directory
cd kaleem-rent-main/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be running at `http://localhost:8080`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

## Environment Variables

Copy `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
frontend/
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Route-level page components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utilities and helpers
│   └── integrations/ # Supabase client setup
├── public/           # Static assets
└── supabase/         # Supabase migrations and config
```
