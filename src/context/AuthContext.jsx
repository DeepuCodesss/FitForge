import { createContext, useContext, useEffect, useState } from "react";
import * as api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const data = await api.me();
      setSession(data?.role ? { role: data.role, id: data.member?.id || data.admin?.id } : null);
      setMember(data?.member || null);
    } catch {
      setSession(null);
      setMember(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const memberLogin = async (email, password) =>
    api
      .loginMember(email, password)
      .then(async (res) => {
        setSession({ role: "member", id: res.member.id });
        setMember(res.member);
        setLoading(false);
        return { ok: true, member: res.member };
      })
      .catch((e) => ({ ok: false, error: e.message }));
  const memberSignup = async (payload) =>
    api
      .signupMember(payload)
      .then(async (res) => {
        setSession({ role: "member", id: res.member.id });
        setMember(res.member);
        setLoading(false);
        return { ok: true, member: res.member };
      })
      .catch((e) => ({ ok: false, error: e.message }));
  const adminLogin = async (email, password) => api.loginAdmin(email, password).then(async () => { await refreshSession(); return { ok: true }; }).catch((e) => ({ ok: false, error: e.message }));
  const logout = async () => {
    await api.logout();
    setSession(null);
    setMember(null);
    setLoading(false);
  };

  return <AuthContext.Provider value={{ session, member, loading, memberLogin, memberSignup, adminLogin, logout, refreshSession }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
