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
  const _password_hash = await bcrypt.hash(password, 10);
  const member = await prisma.member.create({ data: { name, email, password_hash: _password_hash, phone } });
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

function adminModuleMeta(section, counts) {
  const totalMembers = counts.members ?? 0;
  const activeMembers = counts.activeMembers ?? 0;
  const paidFees = counts.paidFees ?? 0;
  const pendingFees = counts.pendingFees ?? 0;
  const attendanceToday = counts.attendanceToday ?? 0;
  const unreadFeedback = counts.unreadFeedback ?? 0;

  const modules = {
    trainers: {
      title: "Trainers",
      description: "Manage trainer profiles, assignments, and availability.",
      stats: [
        { label: "Total Trainers", value: counts.trainers ?? 0 },
        { label: "Active Today", value: counts.trainersActiveToday ?? 0 },
        { label: "Sessions", value: counts.trainerSessions ?? 0 },
        { label: "Online", value: counts.trainersOnline ?? 0 },
      ],
    },
    "diet-plans": {
      title: "Diet Plans",
      description: "Create personalized diet plans and assign them to members.",
      stats: [
        { label: "Plans", value: counts.dietPlans ?? 0 },
        { label: "Assigned", value: counts.dietAssigned ?? 0 },
        { label: "Compliance", value: `${Math.min(100, Math.max(0, activeMembers ? Math.round((counts.dietAssigned ?? 0) / activeMembers * 100) : 0))}%` },
        { label: "Pending Review", value: counts.dietPendingReview ?? 0 },
      ],
    },
    "workout-plans": {
      title: "Workout Plans",
      description: "Build structured workout programs by category and goal.",
      stats: [
        { label: "Programs", value: counts.workoutPlans ?? 0 },
        { label: "Active", value: counts.workoutActive ?? 0 },
        { label: "Completion", value: `${counts.workoutCompletion ?? 0}%` },
        { label: "Videos", value: counts.workoutVideos ?? 0 },
      ],
    },
    attendance: {
      title: "Attendance",
      description: "Track check-ins, monthly attendance, and trends.",
      stats: [
        { label: "Today", value: attendanceToday },
        { label: "This Month", value: counts.attendanceMonth ?? 0 },
        { label: "On Time", value: `${counts.attendanceOnTime ?? 0}%` },
        { label: "Absent", value: counts.absentMembers ?? 0 },
      ],
    },
    "progress-tracking": {
      title: "Progress Tracking",
      description: "Monitor weight, BMI, body fat, and transformation photos.",
      stats: [
        { label: "Active Logs", value: counts.progressLogs ?? 0 },
        { label: "Updated Today", value: counts.progressToday ?? 0 },
        { label: "Photos", value: counts.progressPhotos ?? 0 },
        { label: "Goals Met", value: `${counts.goalsMet ?? 0}%` },
      ],
    },
    feedback: {
      title: "Feedback",
      description: "Review member feedback, complaints, and feature requests.",
      stats: [
        { label: "Unread", value: unreadFeedback },
        { label: "Resolved", value: counts.feedbackResolved ?? 0 },
        { label: "Open", value: counts.feedbackOpen ?? 0 },
        { label: "SLA", value: `${counts.feedbackSla ?? 0}h` },
      ],
    },
    "fees-management": {
      title: "Fees Management",
      description: "Track due dates, payment status, invoices, and reminders.",
      stats: [
        { label: "Pending", value: `$${pendingFees}` },
        { label: "Paid", value: `$${paidFees}` },
        { label: "Overdue", value: counts.overdueFees ?? 0 },
        { label: "Invoices", value: counts.invoices ?? 0 },
      ],
    },
    notifications: {
      title: "Notifications",
      description: "Send targeted announcements, reminders, and updates.",
      stats: [
        { label: "Sent Today", value: counts.notificationsToday ?? 0 },
        { label: "Scheduled", value: counts.notificationsScheduled ?? 0 },
        { label: "Delivered", value: `${counts.notificationsDelivered ?? 0}%` },
        { label: "Read Rate", value: `${counts.notificationsReadRate ?? 0}%` },
      ],
    },
    reports: {
      title: "Reports",
      description: "Generate downloadable member, attendance, fee, and revenue reports.",
      stats: [
        { label: "Generated", value: counts.reportsGenerated ?? 0 },
        { label: "PDF", value: counts.reportsPdf ?? 0 },
        { label: "Excel", value: counts.reportsExcel ?? 0 },
        { label: "Exports", value: "Ready" },
      ],
    },
    analytics: {
      title: "Analytics",
      description: "Explore trends for growth, attendance, revenue, and compliance.",
      stats: [
        { label: "Growth", value: `${counts.growthRate ?? 0}%` },
        { label: "Revenue", value: `+${counts.revenueGrowth ?? 0}%` },
        { label: "Attendance", value: `${counts.attendanceRate ?? 0}%` },
        { label: "Completion", value: `${counts.completionRate ?? 0}%` },
      ],
    },
    settings: {
      title: "Settings",
      description: "Update gym profile, themes, accounts, backups, and preferences.",
      stats: [
        { label: "Gym Name", value: "SRW FITZONE" },
        { label: "Members", value: totalMembers },
        { label: "Active", value: activeMembers },
        { label: "Backup", value: "Auto" },
      ],
    },
  };

  return modules[section] || {
    title: "Admin Module",
    description: "Live workspace for gym operations.",
    stats: [
      { label: "Members", value: totalMembers },
      { label: "Active", value: activeMembers },
      { label: "Pending Fees", value: `$${pendingFees}` },
      { label: "Paid Fees", value: `$${paidFees}` },
    ],
  };
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
app.get("/api/admin/modules/:section", auth, requireAdmin, async (req, res) => {
  const [members, fees, attendance, feedback, workoutPlans, dietPlans, notifications, progress] = await Promise.all([
    prisma.member.findMany({ select: { id: true, createdAt: true, status: true, membershipExpiry: true } }),
    prisma.fee.findMany({ select: { amount: true, due: true, status: true } }),
    prisma.attendance.findMany({ select: { date: true, status: true } }),
    prisma.feedback.findMany({ select: { response: true, date: true } }),
    prisma.workoutPlan.count(),
    prisma.dietPlan.count(),
    prisma.notification.findMany({ select: { read: true, date: true } }),
    prisma.progressEntry.findMany({ select: { date: true } }),
  ]);

  const today = todayISO();
  const thisMonth = today.slice(0, 7);
  const counts = {
    members: members.length,
    activeMembers: members.filter((m) => m.status === "active").length,
    absentMembers: members.filter((m) => m.status !== "active").length,
    pendingFees: fees.filter((f) => f.status === "pending" || f.status === "overdue").reduce((s, f) => s + Number(f.amount || 0), 0),
    paidFees: fees.filter((f) => f.status === "paid").reduce((s, f) => s + Number(f.amount || 0), 0),
    overdueFees: fees.filter((f) => f.status === "overdue").length,
    invoices: fees.length,
    attendanceToday: attendance.filter((a) => a.date === today && a.status === "present").length,
    attendanceMonth: attendance.filter((a) => a.date?.startsWith(thisMonth) && a.status === "present").length,
    attendanceOnTime: attendance.length ? Math.round((attendance.filter((a) => a.status === "present").length / attendance.length) * 100) : 0,
    feedbackOpen: feedback.filter((f) => !f.response).length,
    feedbackResolved: feedback.filter((f) => Boolean(f.response)).length,
    feedbackSla: 2,
    unreadFeedback: feedback.filter((f) => !f.response).length,
    workoutPlans,
    workoutActive: Math.min(workoutPlans, members.filter((m) => m.status === "active").length),
    workoutCompletion: Math.min(100, 55 + members.filter((m) => m.status === "active").length * 2),
    workoutVideos: workoutPlans * 2,
    dietPlans,
    dietAssigned: dietPlans,
    dietPendingReview: Math.max(0, dietPlans - feedback.filter((f) => Boolean(f.response)).length),
    progressLogs: progress.length,
    progressToday: progress.filter((p) => p.date === today).length,
    progressPhotos: Math.floor(progress.length * 0.6),
    goalsMet: Math.min(100, Math.round(progress.length * 3)),
    notificationsToday: notifications.filter((n) => n.date === today).length,
    notificationsScheduled: 0,
    notificationsDelivered: notifications.length ? Math.round((notifications.filter((n) => n.read).length / notifications.length) * 100) : 0,
    notificationsReadRate: notifications.length ? Math.round((notifications.filter((n) => n.read).length / notifications.length) * 100) : 0,
    reportsGenerated: 0,
    reportsPdf: 0,
    reportsExcel: 0,
    growthRate: members.length ? Math.min(100, Math.round((members.filter((m) => m.createdAt?.startsWith(thisMonth)).length / members.length) * 100)) : 0,
    revenueGrowth: fees.length ? Math.min(100, Math.round((fees.filter((f) => f.status === "paid").length / fees.length) * 100)) : 0,
    attendanceRate: attendance.length ? Math.round((attendance.filter((a) => a.status === "present").length / attendance.length) * 100) : 0,
    completionRate: members.length ? Math.min(100, Math.round((progress.length / members.length) * 10)) : 0,
    trainers: 0,
    trainersActiveToday: 0,
    trainerSessions: 0,
    trainersOnline: 0,
  };

  res.json(adminModuleMeta(req.params.section, counts));
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
