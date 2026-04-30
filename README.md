# NearFix Frontend

Next.js frontend for NearFix using TypeScript, App Router, Tailwind CSS, and npm.

## Local Setup

```powershell
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment

Create `.env.local` when you need local overrides:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## Scripts

- `npm run dev` starts the local development server.
- `npm run lint` runs ESLint.
- `npm run build` creates a production build.
