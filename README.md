# SRW FITZONE - Gym Management System

A gym management web app with a marketing landing page, a member portal, and
an admin portal built with React, React Router, Tailwind CSS, Express, Prisma,
and PostgreSQL.

The current version uses a real backend API with cookie-based auth. That means:

- Signing up, logging in, editing your profile, checking in for attendance,
  logging progress entries, and sending feedback persist in the database.
- The admin portal can assign workout and diet plans, mark attendance, add
  fees, and send notifications to members.
- The frontend and backend must both be deployed and connected with the right
  environment variables.

## Demo logins

**Member portal** - `/login`
- Email: `deeepak@gmail.com`
- Password: `demo1234`

**Admin portal** - `/admin/login`
- Email: `Vannu123sh78@gmail.com`
- Password: `2e606836`

## Running it locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open the URL it prints, usually `http://localhost:5173`.

## Building for production

```bash
npm run build
```

This outputs a static site to `dist/`. The frontend must be built with
`VITE_API_URL` pointing to the live Render backend URL.

## What's inside

- `/` - Landing page
- `/login`, `/signup` - Member auth
- `/admin/login` - Admin auth
- `/portal` - Member portal: Dashboard, Profile, Attendance, Workout Plan,
  Diet Plan, Progress, Fee Status, Notifications, Feedback, Settings
- `/admin` - Admin portal: Overview, Members list, Member detail, Feedback
  inbox

## Tech stack

- React 19 + Vite
- React Router
- Tailwind CSS v4
- lucide-react icons
- Express + Prisma + PostgreSQL backend
