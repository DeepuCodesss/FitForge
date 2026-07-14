# Render Deployment

1. Create a free PostgreSQL database on **Neon** or **Supabase**.
2. Copy the connection string and keep it ready for `DATABASE_URL`.
3. Create a Web Service from this repo with root directory `server`.
3. Set environment variables on the Web Service:
   - `DATABASE_URL` from Neon or Supabase
   - `JWT_SECRET` to a long random string
   - `CORS_ORIGIN` to the Render static site URL, for example `https://fitforge-web.onrender.com`
   - `PORT` to `3001` or leave Render default
4. Build command:
   - `npm install && npx prisma generate && npx prisma db push`
5. Start command:
   - `node server.js`
6. Create a Static Site for the frontend.
7. Set `VITE_API_URL` to the Render backend URL.
8. Build command for the frontend:
   - `npm install && npm run build`
9. Publish directory:
   - `dist`
10. On first deploy, run the seed command in the server service:
   - `npx prisma db seed`

### Important

- The static site must be built with `VITE_API_URL` set. If this is missing,
  the frontend falls back to `http://localhost:3001` in development only.
- `CORS_ORIGIN` should match the static site URL. The backend now trims a
  trailing slash, so either `https://example.onrender.com` or
  `https://example.onrender.com/` will work.
- The backend and frontend are separate Render services, so they do not connect
  automatically just because both are live.

### Neon setup

1. Sign up at Neon and create a new project.
2. Open the database connection settings.
3. Copy the pooled or direct PostgreSQL connection string.
4. Paste that string into Render as `DATABASE_URL`.
5. If Neon gives you multiple connection strings, use the direct one first for simplicity.

The demo logins are:

- `admin@fitforge.com` / `admin123`
- `deeepak@gmail.com` / `demo1234`
