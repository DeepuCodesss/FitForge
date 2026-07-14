// FitForge data layer — a small localStorage-backed "database".
// Everything here is real client-side persistence: data survives reloads,
// is scoped per-browser, and is fully editable through the UI.

const DB_KEY = "fitforge_db_v1";
const SESSION_KEY = "fitforge_session_v1";

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function seedDB() {
  const demoMemberId = "mem_deepak";
  const db = {
    admin: { email: "admin@fitforge.com", password: "admin123", name: "Admin" },
    members: [
      {
        id: demoMemberId,
        name: "Deepak Kumar",
        email: "deeepak@gmail.com",
        password: "demo1234",
        phone: "09350432714",
        address: "",
        goal: "",
        height: "",
        currentWeight: "",
        targetWeight: "",
        bodyFat: "",
        membershipExpiry: "",
        plan: "Basic",
        status: "active",
        createdAt: todayISO(),
      },
    ],
    attendance: [
      { id: uid("att"), memberId: demoMemberId, date: todayISO(), status: "present" },
    ],
    fees: [
      { id: uid("fee"), memberId: demoMemberId, amount: 454, due: todayISO(), status: "paid" },
    ],
    workoutPlans: {},
    dietPlans: {},
    progress: { [demoMemberId]: [] },
    notifications: { [demoMemberId]: [] },
    feedback: [],
  };
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}

export function getDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) return seedDB();
  try {
    return JSON.parse(raw);
  } catch {
    return seedDB();
  }
}

export function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function resetDB() {
  return seedDB();
}

// ---------- session ----------

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(session) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

// ---------- auth ----------

export function loginMember(email, password) {
  const db = getDB();
  const member = db.members.find(
    (m) => m.email.toLowerCase() === email.toLowerCase() && m.password === password
  );
  if (!member) return { ok: false, error: "Invalid email or password." };
  setSession({ role: "member", id: member.id });
  return { ok: true, member };
}

export function signupMember({ name, email, password, phone }) {
  const db = getDB();
  if (db.members.some((m) => m.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const member = {
    id: uid("mem"),
    name,
    email,
    password,
    phone: phone || "",
    address: "",
    goal: "",
    height: "",
    currentWeight: "",
    targetWeight: "",
    bodyFat: "",
    membershipExpiry: "",
    plan: "Basic",
    status: "active",
    createdAt: todayISO(),
  };
  db.members.push(member);
  db.progress[member.id] = [];
  db.notifications[member.id] = [
    {
      id: uid("ntf"),
      title: "Welcome to FitForge",
      message: "Your account has been created. Complete your profile to get personalized plans.",
      date: todayISO(),
      read: false,
    },
  ];
  saveDB(db);
  setSession({ role: "member", id: member.id });
  return { ok: true, member };
}

export function loginAdmin(email, password) {
  const db = getDB();
  if (db.admin.email.toLowerCase() === email.toLowerCase() && db.admin.password === password) {
    setSession({ role: "admin" });
    return { ok: true };
  }
  return { ok: false, error: "Invalid admin credentials." };
}

export function logout() {
  setSession(null);
}

// ---------- members ----------

export function getMember(memberId) {
  const db = getDB();
  return db.members.find((m) => m.id === memberId) || null;
}

export function updateMember(memberId, patch) {
  const db = getDB();
  const idx = db.members.findIndex((m) => m.id === memberId);
  if (idx === -1) return null;
  db.members[idx] = { ...db.members[idx], ...patch };
  saveDB(db);
  return db.members[idx];
}

export function listMembers() {
  return getDB().members;
}

export function deleteMember(memberId) {
  const db = getDB();
  db.members = db.members.filter((m) => m.id !== memberId);
  db.attendance = db.attendance.filter((a) => a.memberId !== memberId);
  db.fees = db.fees.filter((f) => f.memberId !== memberId);
  delete db.workoutPlans[memberId];
  delete db.dietPlans[memberId];
  delete db.progress[memberId];
  delete db.notifications[memberId];
  db.feedback = db.feedback.filter((f) => f.memberId !== memberId);
  saveDB(db);
}

// ---------- attendance ----------

export function getAttendance(memberId) {
  return getDB().attendance.filter((a) => a.memberId === memberId).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function markAttendance(memberId, date = todayISO(), status = "present") {
  const db = getDB();
  const existing = db.attendance.find((a) => a.memberId === memberId && a.date === date);
  if (existing) {
    existing.status = status;
  } else {
    db.attendance.push({ id: uid("att"), memberId, date, status });
  }
  saveDB(db);
  return getAttendance(memberId);
}

export function attendanceThisMonth(memberId) {
  const ym = todayISO().slice(0, 7);
  return getAttendance(memberId).filter((a) => a.date.startsWith(ym) && a.status === "present").length;
}

// ---------- fees ----------

export function getFees(memberId) {
  return getDB().fees.filter((f) => f.memberId === memberId).sort((a, b) => (a.due < b.due ? 1 : -1));
}

export function addFee(memberId, amount, due, status = "pending") {
  const db = getDB();
  db.fees.push({ id: uid("fee"), memberId, amount: Number(amount), due, status });
  saveDB(db);
  return getFees(memberId);
}

export function markFeePaid(feeId) {
  const db = getDB();
  const fee = db.fees.find((f) => f.id === feeId);
  if (fee) fee.status = "paid";
  saveDB(db);
}

export function feeSummary(memberId) {
  const fees = getFees(memberId);
  const pending = fees.filter((f) => f.status === "pending").reduce((s, f) => s + f.amount, 0);
  const paid = fees.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);
  return { pending, paid };
}

// ---------- workout plans ----------

export function getWorkoutPlan(memberId) {
  return getDB().workoutPlans[memberId] || null;
}

export function setWorkoutPlan(memberId, plan) {
  const db = getDB();
  db.workoutPlans[memberId] = plan;
  saveDB(db);
}

// ---------- diet plans ----------

export function getDietPlan(memberId) {
  return getDB().dietPlans[memberId] || null;
}

export function setDietPlan(memberId, plan) {
  const db = getDB();
  db.dietPlans[memberId] = plan;
  saveDB(db);
}

// ---------- progress ----------

export function getProgress(memberId) {
  const db = getDB();
  return (db.progress[memberId] || []).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function addProgress(memberId, entry) {
  const db = getDB();
  if (!db.progress[memberId]) db.progress[memberId] = [];
  db.progress[memberId].push({ id: uid("prg"), date: todayISO(), ...entry });
  saveDB(db);
  return getProgress(memberId);
}

// ---------- notifications ----------

export function getNotifications(memberId) {
  const db = getDB();
  return (db.notifications[memberId] || []).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function addNotification(memberId, title, message) {
  const db = getDB();
  if (!db.notifications[memberId]) db.notifications[memberId] = [];
  db.notifications[memberId].unshift({ id: uid("ntf"), title, message, date: todayISO(), read: false });
  saveDB(db);
}

export function markNotificationRead(memberId, notifId) {
  const db = getDB();
  const list = db.notifications[memberId] || [];
  const n = list.find((x) => x.id === notifId);
  if (n) n.read = true;
  saveDB(db);
}

// ---------- feedback ----------

export function getFeedback(memberId) {
  return getDB().feedback.filter((f) => f.memberId === memberId).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function allFeedback() {
  return getDB().feedback.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function addFeedback(memberId, message) {
  const db = getDB();
  db.feedback.push({ id: uid("fbk"), memberId, message, date: todayISO(), response: "" });
  saveDB(db);
}

export function respondFeedback(feedbackId, response) {
  const db = getDB();
  const f = db.feedback.find((x) => x.id === feedbackId);
  if (f) f.response = response;
  saveDB(db);
}

export { todayISO, uid };
