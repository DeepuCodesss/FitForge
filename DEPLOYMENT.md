# Render Deployment

1. Create a PostgreSQL database on Render.
2. Create a Web Service from this repo with root directory `server`.
3. Set environment variables on the Web Service:
   - `DATABASE_URL` from the Render Postgres connection string
   - `JWT_SECRET` to a long random string
   - `CORS_ORIGIN` to the frontend URL
   - `PORT` to `3001` or leave Render default
4. Build command:
   - `npm install && npx prisma generate && npx prisma migrate deploy`
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

The demo logins are:

- `admin@fitforge.com` / `admin123`
- `deeepak@gmail.com` / `demo1234`
