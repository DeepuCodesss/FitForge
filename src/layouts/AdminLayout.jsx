import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  UserCheck,
  Salad,
  CalendarDays,
  ChartSpline,
  MessageSquare,
  ReceiptText,
  Bell,
  FileBarChart2,
  LineChart,
  Settings,
  LogOut,
  Dumbbell as DumbbellIcon,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/admin/members", label: "Members", icon: Users },
  { to: "/admin/trainers", label: "Trainers", icon: UserCheck },
  { to: "/admin/diet-plans", label: "Diet Plans", icon: Salad },
  { to: "/admin/workout-plans", label: "Workout Plans", icon: DumbbellIcon },
  { to: "/admin/attendance", label: "Attendance", icon: CalendarDays },
  { to: "/admin/progress-tracking", label: "Progress Tracking", icon: ChartSpline },
  { to: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { to: "/admin/fees-management", label: "Fees Management", icon: ReceiptText },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/reports", label: "Reports", icon: FileBarChart2 },
  { to: "/admin/analytics", label: "Analytics", icon: LineChart },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--color-bg)" }}>
      <aside
        className="w-[310px] shrink-0 hidden lg:flex flex-col justify-between px-5 py-6 border-r sticky top-0 h-screen backdrop-blur-xl"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background: "linear-gradient(180deg, rgba(17,14,12,0.82), rgba(17,14,12,0.58))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div>
          <div className="flex items-center gap-2.5 mb-10 px-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-2))" }}>
              <DumbbellIcon size={18} color="#fff" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">SRW FITZONE</span>
          </div>

          <nav className="flex flex-col gap-1.5">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[15px] font-medium transition-all duration-200 hover:translate-x-0.5"
                style={({ isActive }) => ({
                  background: isActive ? "linear-gradient(135deg, var(--color-accent), var(--color-accent-2))" : "transparent",
                  color: isActive ? "#fff" : "var(--color-text)",
                })}
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t pt-5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <p className="font-bold text-[15px]">Admin</p>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>Gym operations</p>
          <button onClick={handleLogout} className="flex items-center gap-2 mt-4 text-[15px] font-semibold hover:opacity-80">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="flex items-center justify-between px-6 md:px-10 h-[76px] border-b shrink-0 sticky top-0 z-20 backdrop-blur-xl"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            background: "rgba(15, 13, 12, 0.66)",
          }}
        >
          <span className="mono text-xs tracking-widest uppercase" style={{ color: "var(--color-muted)" }}>
            admin portal
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
