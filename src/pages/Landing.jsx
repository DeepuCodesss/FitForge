import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, ArrowRight } from "lucide-react";
import { API_URL, healthCheck } from "../lib/api";
import { Badge } from "../components/UI";

export default function Landing() {
  const [health, setHealth] = useState({ status: "checking", error: "" });

  useEffect(() => {
    let alive = true;
    healthCheck()
      .then(() => alive && setHealth({ status: "connected", error: "" }))
      .catch((err) => alive && setHealth({ status: "offline", error: err.message }));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--color-bg)" }}>
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 md:px-14 py-6">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--color-accent)" }}
          >
            <Dumbbell size={18} color="#fff" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">SRW FITZONE</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/login" className="text-[15px] font-medium hover:opacity-80 px-2">
            Member Login
          </Link>
          <Link
            to="/admin/login"
            className="text-[15px] font-semibold rounded-full border px-5 py-2 hover:bg-[var(--color-panel-2)]"
            style={{ borderColor: "var(--color-border)" }}
          >
            Admin
          </Link>
        </nav>
      </header>

      <main className="relative z-10 px-6 md:px-14 pt-16 md:pt-24 pb-24 max-w-4xl">
        <p
          className="mono text-xs md:text-sm tracking-[0.25em] uppercase mb-6"
          style={{ color: "var(--color-muted)" }}
        >
          Complete gym management system
        </p>
        <div className="mb-6">
          <Badge tone={health.status === "connected" ? "accent" : "default"}>
            Backend {health.status === "checking" ? "checking" : health.status}
          </Badge>
          <p className="mt-2 text-sm" style={{ color: "var(--color-muted)" }}>
            API URL: {API_URL || "not set"}
          </p>
          {health.error && (
            <p className="mt-1 text-sm" style={{ color: "#ff8a80" }}>
              {health.error}
            </p>
          )}
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight">
          Forge <span style={{ color: "var(--color-accent)" }}>stronger</span>
          <br />
          members.
          <br />
          Run a <span className="italic font-medium">smarter</span>{" "}
          <span className="font-extrabold">gym.</span>
        </h1>

        <p className="mt-8 text-lg max-w-xl leading-relaxed" style={{ color: "var(--color-muted)" }}>
          One platform for members, trainers, workouts, diet plans, attendance, fees, progress
          tracking &amp; analytics — with a beautiful admin dashboard and dedicated member portal.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            to="/signup"
            className="flex items-center gap-2 rounded-full font-semibold px-6 py-3.5 hover:opacity-90"
            style={{ background: "var(--color-accent)", color: "#fff" }}
          >
            Join as Member
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/admin/login"
            className="rounded-full font-semibold px-6 py-3.5 border hover:bg-[var(--color-panel-2)]"
            style={{ borderColor: "var(--color-border)" }}
          >
            Admin Portal
          </Link>
        </div>
      </main>
    </div>
  );
}
