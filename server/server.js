import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cookieParser());

function normalizeOrigin(origin) {
  return origin?.trim().replace(/\/$/, "");
}

const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map(normalizeOrigin).filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins?.length ? allowedOrigins : true,
    credentials: true,
  })
);

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const cookieOptions = { httpOnly: true, sameSite: "none", secure: true, path: "/" };
const todayISO = () => new Date().toISOString().slice(0, 10);

function signSession(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
function setAuthCookie(res, token) { res.cookie("fitforge_token", token, cookieOptions); }
function clearAuthCookie(res) { res.clearCookie("fitforge_token", cookieOptions); }
function auth(req, res, next) {
  const token = req.cookies.fitforge_token;
  if (!token) return res.status(401).json({ error: "Unauthenticated" });
  try { req.session = jwt.verify(token, JWT_SECRET); next(); } catch { return res.status(401).json({ error: "Unauthenticated" }); }
}
function requireAdmin(req, res, next) { return req.session?.role === "admin" ? next() : res.status(403).json({ error: "Forbidden" }); }
function requireMemberOrAdmin(req, res, next) {
  const { role, id } = req.session || {};
  if (role === "admin" || id === req.params.id || id === req.body.memberId) return next();
  return res.status(403).json({ error: "Forbidden" });
}

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.post("/api/auth/member/signup", async (req, res) => {
  const { name, email, password, phone = "" } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });
  const password_hash = await bcrypt.hash(password, 10);
  const member = await prisma.member.create({ data: { name, email, password_hash, phone } });
  setAuthCookie(res, signSession({ role: "member", id: member.id }));
  res.json({ member: sanitizeMember(member) });
});
app.post("/api/auth/member/login", async (req, res) => {
  const { email, password } = req.body;
  const member = await prisma.member.findUnique({ where: { email } });
  if (!member || !(await bcrypt.compare(password || "", member.password_hash))) return res.status(401).json({ error: "Invalid email or password." });
  setAuthCookie(res, signSession({ role: "member", id: member.id }));
  res.json({ member: sanitizeMember(member) });
});
app.post("/api/auth/admin/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !(await bcrypt.compare(password || "", admin.password_hash))) return res.status(401).json({ error: "Invalid admin credentials." });
  setAuthCookie(res, signSession({ role: "admin", id: admin.id }));
  res.json({ admin: { id: admin.id, email: admin.email, name: admin.name } });
});
app.post("/api/auth/logout", (_, res) => { clearAuthCookie(res); res.json({ ok: true }); });
app.get("/api/auth/me", auth, async (req, res) => {
  if (req.session.role === "admin") {
    const admin = await prisma.admin.findUnique({ where: { id: req.session.id } });
    return res.json({ role: "admin", admin: admin && { id: admin.id, email: admin.email, name: admin.name } });
  }
  const member = await prisma.member.findUnique({ where: { id: req.session.id }, include: includeMember() });
  res.json({ role: "member", member: sanitizeMember(member) });
});

function includeMember() { return { workoutPlan: true, dietPlan: true, attendance: true, fees: true, progressEntries: true, notifications: true, feedback: true }; }
function sanitizeMember(member) {
  if (!member) return null;
  const { password_hash, ...rest } = member;
  return rest;
}

app.patch("/api/members/me", auth, async (req, res) => {
  if (req.session.role !== "member") return res.status(403).json({ error: "Forbidden" });
  const member = await prisma.member.update({ where: { id: req.session.id }, data: req.body });
  res.json({ member: sanitizeMember(member) });
});

app.get("/api/admin/members", auth, requireAdmin, async (_, res) => {
  const members = await prisma.member.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ members: members.map(sanitizeMember) });
});
app.get("/api/admin/members/:id", auth, requireAdmin, async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { id: req.params.id },
    include: includeMember(),
  });
  if (!member) return res.status(404).json({ error: "Not found" });
  res.json({ member: sanitizeMember(member) });
});
app.patch("/api/admin/members/:id", auth, requireAdmin, async (req, res) => {
  const member = await prisma.member.update({ where: { id: req.params.id }, data: req.body });
  res.json({ member: sanitizeMember(member) });
});
app.delete("/api/admin/members/:id", auth, requireAdmin, async (req, res) => {
  await prisma.member.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

app.get("/api/members/:id/attendance", auth, requireMemberOrAdmin, async (req, res) => {
  const items = await prisma.attendance.findMany({ where: { memberId: req.params.id }, orderBy: { date: "desc" } });
  res.json(items);
});
app.post("/api/members/:id/attendance", auth, requireMemberOrAdmin, async (req, res) => {
  const item = await prisma.attendance.create({ data: { memberId: req.params.id, date: req.body.date || todayISO(), status: req.body.status || "present" } });
  res.json(item);
});
app.get("/api/members/:id/fees", auth, requireMemberOrAdmin, async (req, res) => {
  const items = await prisma.fee.findMany({ where: { memberId: req.params.id }, orderBy: { due: "desc" } });
  res.json(items);
});
app.post("/api/members/:id/fees", auth, requireAdmin, async (req, res) => {
  const item = await prisma.fee.create({ data: { memberId: req.params.id, amount: Number(req.body.amount), due: req.body.due, status: req.body.status || "pending" } });
  res.json(item);
});
app.patch("/api/fees/:id", auth, requireAdmin, async (req, res) => {
  const item = await prisma.fee.update({ where: { id: req.params.id }, data: { status: req.body.status || "paid" } });
  res.json(item);
});
app.get("/api/members/:id/workout-plan", auth, requireMemberOrAdmin, async (req, res) => {
  const item = await prisma.workoutPlan.findUnique({ where: { memberId: req.params.id } });
  res.json(item);
});
app.put("/api/members/:id/workout-plan", auth, requireAdmin, async (req, res) => {
  const item = await prisma.workoutPlan.upsert({ where: { memberId: req.params.id }, update: req.body, create: { memberId: req.params.id, ...req.body } });
  res.json(item);
});
app.get("/api/members/:id/diet-plan", auth, requireMemberOrAdmin, async (req, res) => {
  const item = await prisma.dietPlan.findUnique({ where: { memberId: req.params.id } });
  res.json(item);
});
app.put("/api/members/:id/diet-plan", auth, requireAdmin, async (req, res) => {
  const item = await prisma.dietPlan.upsert({ where: { memberId: req.params.id }, update: req.body, create: { memberId: req.params.id, ...req.body } });
  res.json(item);
});
app.get("/api/members/:id/progress", auth, requireMemberOrAdmin, async (req, res) => {
  const items = await prisma.progressEntry.findMany({ where: { memberId: req.params.id }, orderBy: { date: "desc" } });
  res.json(items);
});
app.post("/api/members/:id/progress", auth, requireMemberOrAdmin, async (req, res) => {
  const item = await prisma.progressEntry.create({ data: { memberId: req.params.id, date: req.body.date || todayISO(), weight: Number(req.body.weight), bodyFat: req.body.bodyFat == null ? null : Number(req.body.bodyFat), note: req.body.note || "" } });
  res.json(item);
});
app.get("/api/members/:id/notifications", auth, requireMemberOrAdmin, async (req, res) => {
  const items = await prisma.notification.findMany({ where: { memberId: req.params.id }, orderBy: { date: "desc" } });
  res.json(items);
});
app.post("/api/members/:id/notifications", auth, requireAdmin, async (req, res) => {
  const item = await prisma.notification.create({ data: { memberId: req.params.id, title: req.body.title, message: req.body.message, date: todayISO() } });
  res.json(item);
});
app.patch("/api/notifications/:id", auth, async (req, res) => {
  const item = await prisma.notification.update({ where: { id: req.params.id }, data: { read: Boolean(req.body.read) } });
  res.json(item);
});
app.get("/api/members/:id/feedback", auth, requireMemberOrAdmin, async (req, res) => {
  const items = await prisma.feedback.findMany({ where: { memberId: req.params.id }, orderBy: { date: "desc" } });
  res.json(items);
});
app.post("/api/members/:id/feedback", auth, requireMemberOrAdmin, async (req, res) => {
  const item = await prisma.feedback.create({ data: { memberId: req.params.id, message: req.body.message, date: todayISO() } });
  res.json(item);
});
app.get("/api/admin/feedback", auth, requireAdmin, async (_, res) => {
  const items = await prisma.feedback.findMany({ orderBy: { date: "desc" } });
  res.json(items);
});
app.patch("/api/feedback/:id/respond", auth, requireAdmin, async (req, res) => {
  const item = await prisma.feedback.update({ where: { id: req.params.id }, data: { response: req.body.response } });
  res.json(item);
});

async function ensureSeedData() {
  const adminEmail = "Vannu123sh78@gmail.com";
  const adminPassword = "2e606836";
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const adminCount = await prisma.admin.count();
  const memberCount = await prisma.member.count();
  if (adminCount === 0) {
    await prisma.admin.create({
      data: {
        email: adminEmail,
        name: "Admin",
        password_hash: adminHash,
      },
    });
  } else {
    await prisma.admin.upsert({
      where: { email: adminEmail },
      update: { password_hash: adminHash, name: "Admin" },
      create: {
        email: adminEmail,
        name: "Admin",
        password_hash: adminHash,
      },
    });
  }
  if (memberCount === 0) {
    const member = await prisma.member.create({
      data: {
        name: "Deepak Kumar",
        email: "deeepak@gmail.com",
        password_hash: await bcrypt.hash("demo1234", 10),
        phone: "09350432714",
        plan: "Basic",
        status: "active",
      },
    });
    await prisma.attendance.create({
      data: { memberId: member.id, date: todayISO(), status: "present" },
    });
    await prisma.notification.create({
      data: {
        memberId: member.id,
        title: "Welcome to SRW FITZONE",
        message: "Your account has been created. Complete your profile to get personalized plans.",
        date: todayISO(),
        read: false,
      },
    });
  }
}

const port = process.env.PORT || 3001;
ensureSeedData()
  .then(() => app.listen(port))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
