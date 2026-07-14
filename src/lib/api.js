const API_URL_RAW =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3001" : "https://fitforge-api.onrender.com");

export const API_URL = API_URL_RAW.replace(/\/$/, "");

async function request(path, options = {}) {
  if (!API_URL) throw new Error("Missing API URL");
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
}

export async function healthCheck() {
  if (!API_URL) throw new Error("Missing API URL");
  const res = await fetch(`${API_URL}/api/health`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return { ok: true, apiUrl: API_URL, ...data };
}

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const getSession = () => null;
export const setSession = () => {};
export const getDB = () => null;
export const saveDB = () => {};
export const resetDB = () => {};

export async function loginMember(email, password) {
  return request("/api/auth/member/login", { method: "POST", body: JSON.stringify({ email, password }) });
}
export async function signupMember(payload) {
  return request("/api/auth/member/signup", { method: "POST", body: JSON.stringify(payload) });
}
export async function loginAdmin(email, password) {
  return request("/api/auth/admin/login", { method: "POST", body: JSON.stringify({ email, password }) });
}
export async function logout() {
  return request("/api/auth/logout", { method: "POST" });
}
export async function me() {
  return request("/api/auth/me");
}
export async function getMember(memberId) { return request(`/api/admin/members/${memberId}`); }
export async function updateMember(memberId, patch) { return request(`/api/members/me`, { method: "PATCH", body: JSON.stringify(patch) }); }
export async function listMembers() { return request("/api/admin/members"); }
export async function deleteMember(memberId) { return request(`/api/admin/members/${memberId}`, { method: "DELETE" }); }
export async function getAttendance(memberId) { return request(`/api/members/${memberId}/attendance`); }
export async function markAttendance(memberId, date = todayISO(), status = "present") { return request(`/api/members/${memberId}/attendance`, { method: "POST", body: JSON.stringify({ date, status }) }); }
export async function attendanceThisMonth(memberId) { const records = await getAttendance(memberId); const ym = todayISO().slice(0, 7); return records.filter((a) => a.date.startsWith(ym) && a.status === "present").length; }
export async function getFees(memberId) { return request(`/api/members/${memberId}/fees`); }
export async function addFee(memberId, amount, due, status = "pending") { return request(`/api/members/${memberId}/fees`, { method: "POST", body: JSON.stringify({ amount, due, status }) }); }
export async function markFeePaid(feeId) { return request(`/api/fees/${feeId}`, { method: "PATCH", body: JSON.stringify({ status: "paid" }) }); }
export async function feeSummary(memberId) { const fees = await getFees(memberId); return { pending: fees.filter((f) => f.status === "pending").reduce((s, f) => s + Number(f.amount), 0), paid: fees.filter((f) => f.status === "paid").reduce((s, f) => s + Number(f.amount), 0) }; }
export async function getWorkoutPlan(memberId) { return request(`/api/members/${memberId}/workout-plan`); }
export async function setWorkoutPlan(memberId, plan) { return request(`/api/members/${memberId}/workout-plan`, { method: "PUT", body: JSON.stringify(plan) }); }
export async function getDietPlan(memberId) { return request(`/api/members/${memberId}/diet-plan`); }
export async function setDietPlan(memberId, plan) { return request(`/api/members/${memberId}/diet-plan`, { method: "PUT", body: JSON.stringify(plan) }); }
export async function getProgress(memberId) { return request(`/api/members/${memberId}/progress`); }
export async function addProgress(memberId, entry) { return request(`/api/members/${memberId}/progress`, { method: "POST", body: JSON.stringify(entry) }); }
export async function getNotifications(memberId) { return request(`/api/members/${memberId}/notifications`); }
export async function addNotification(memberId, title, message) { return request(`/api/members/${memberId}/notifications`, { method: "POST", body: JSON.stringify({ title, message }) }); }
export async function markNotificationRead(memberId, notifId) { return request(`/api/notifications/${notifId}`, { method: "PATCH", body: JSON.stringify({ read: true }) }); }
export async function getFeedback(memberId) { return request(`/api/members/${memberId}/feedback`); }
export async function allFeedback() { return request("/api/admin/feedback"); }
export async function addFeedback(memberId, message) { return request(`/api/members/${memberId}/feedback`, { method: "POST", body: JSON.stringify({ message }) }); }
export async function respondFeedback(feedbackId, response) { return request(`/api/feedback/${feedbackId}/respond`, { method: "PATCH", body: JSON.stringify({ response }) }); }

export function getApiBaseUrl() {
  return API_URL;
}
