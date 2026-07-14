import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  User,
  CalendarCheck,
  Dumbbell,
  Utensils,
  LineChart,
  CreditCard,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const NAV = [
  { to: "/portal", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/portal/profile", label: "Profile", icon: User },
  { to: "/portal/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/portal/workout", label: "Workout Plan", icon: Dumbbell },
  { to: "/portal/diet", label: "Diet Plan", icon: Utensils },
  { to: "/portal/progress", label: "Progress", icon: LineChart },
  { to: "/portal/fees", label: "Fee Status", icon: CreditCard },
  { to: "/portal/notifications", label: "Notifications", icon: Bell },
  { to: "/portal/feedback", label: "Feedback", icon: MessageSquare },
  { to: "/portal/settings", label: "Settings", icon: Settings },
];

export default function MemberLayout() {
  const { member, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-bg)" }}>
      {/* Sidebar */}
      <aside
        className="w-[334px] shrink-0 hidden md:flex flex-col justify-between px-6 py-8 border-r"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-10 px-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--color-accent)" }}
            >
              <Dumbbell size={18} color="#fff" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">SRW FITZONE</span>
          </div>

          <nav className="flex flex-col gap-1.5">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                    isActive ? "text-white" : "hover:bg-[var(--color-panel-2)]"
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? "var(--color-accent)" : "transparent",
                  color: isActive ? "#fff" : "var(--color-text)",
                })}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <div className="border-t pt-5" style={{ borderColor: "var(--color-border)" }}>
            <p className="font-bold text-[15px]">{member?.name}</p>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              {member?.email}
            </p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 mt-4 text-[15px] font-semibold hover:opacity-80"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center justify-between px-6 md:px-10 h-[76px] border-b shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <span
            className="mono text-xs tracking-widest uppercase"
            style={{ color: "var(--color-muted)" }}
          >
            member portal
          </span>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--color-panel-2)]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>
        <main className="flex-1 px-6 md:px-10 py-8 md:py-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
