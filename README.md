# FitForge — Gym Management System

A complete, working gym management web app: a marketing landing page, a member
portal, and an admin portal — built with React, React Router and Tailwind CSS.

This is a **real working app**, not a static mockup. It uses the browser's
localStorage as its database, so:

- Signing up, logging in, editing your profile, checking in for attendance,
  logging progress entries, sending feedback, etc. all actually persist.
- The **Admin Portal** can assign workout & diet plans, mark attendance, add
  fees, and send notifications to a member — and it shows up live on that
  member's side.
- Everything survives a page refresh (until you clear your browser's site data).

## Demo logins

**Member portal** — `/login`
- Email: `deeepak@gmail.com`
- Password: `demo1234`
(fields are pre-filled on the login screen)

**Admin portal** — `/admin/login`
- Email: `admin@fitforge.com`
- Password: `admin123`
(fields are pre-filled on the login screen)

You can also create a brand new member account from the landing page
("Join as Member").

## Running it locally

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Then open the URL it prints (usually `http://localhost:5173`).

## Building for production / deploying

```bash
npm run build
```

This outputs a static site to `dist/`. You can deploy that folder to any
static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages, or a plain
Nginx server) — no backend/server is required since all data lives in the
browser.

To preview the production build locally:

```bash
npm run preview
```

## What's inside

- `/` — Landing page
- `/login`, `/signup` — Member auth
- `/admin/login` — Admin auth
- `/portal` — Member portal: Dashboard, Profile, Attendance, Workout Plan,
  Diet Plan, Progress, Fee Status, Notifications, Feedback, Settings
- `/admin` — Admin portal: Overview, Members list, Member detail (edit
  profile, attendance, fees, assign workout/diet plans, send notifications),
  Feedback inbox

Data model & all "backend" logic lives in `src/lib/store.js` — swap this out
for real API calls if you want to connect it to an actual server/database
later; every page already calls through this one module.

## Tech stack

- React 19 + Vite
- React Router
- Tailwind CSS v4
- lucide-react icons
- localStorage as the persistence layer (no server required)
