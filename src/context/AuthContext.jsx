import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as store from "../lib/store";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(() => store.getSession());
  const [member, setMember] = useState(null);

  const refreshMember = useCallback(() => {
    const s = store.getSession();
    if (s && s.role === "member") {
      setMember(store.getMember(s.id));
    } else {
      setMember(null);
    }
  }, []);

  useEffect(() => {
    refreshMember();
  }, [session, refreshMember]);

  const memberLogin = (email, password) => {
    const res = store.loginMember(email, password);
    if (res.ok) {
      setSessionState(store.getSession());
    }
    return res;
  };

  const memberSignup = (payload) => {
    const res = store.signupMember(payload);
    if (res.ok) {
      setSessionState(store.getSession());
    }
    return res;
  };

  const adminLogin = (email, password) => {
    const res = store.loginAdmin(email, password);
    if (res.ok) {
      setSessionState(store.getSession());
    }
    return res;
  };

  const logout = () => {
    store.logout();
    setSessionState(null);
    setMember(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, member, memberLogin, memberSignup, adminLogin, logout, refreshMember }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
