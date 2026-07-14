import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button, Input, Badge } from "../components/UI";
import { healthCheck } from "../lib/api";

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@fitforge.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [health, setHealth] = useState("checking");

  useEffect(() => {
    let alive = true;
    healthCheck()
      .then(() => alive && setHealth("connected"))
      .catch(() => alive && setHealth("offline"));
    return () => {
      alive = false;
    };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    Promise.resolve(adminLogin(email, password))
      .then((res) => { if (res.ok) navigate("/admin"); else setError(res.error); })
      .catch((err) => setError(err.message));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--color-accent)" }}>
            <Dumbbell size={18} color="#fff" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">FitForge</span>
        </Link>

        <div className="rounded-2xl border p-8" style={{ background: "var(--color-panel)", borderColor: "var(--color-border)" }}>
          <h1 className="text-2xl font-extrabold mb-1">Admin Portal</h1>
          <p className="mb-6" style={{ color: "var(--color-muted)" }}>
            Manage members, plans, attendance &amp; fees.
          </p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm" style={{ color: "#ff6a6a" }}>{error}</p>}
            <Button type="submit" className="w-full mt-2">Log In</Button>
          </form>
          <p className="text-xs text-center mt-5" style={{ color: "var(--color-muted)" }}>
            Demo admin credentials are pre-filled - just hit Log In.
          </p>
          <div className="mt-4 flex justify-center">
            <Badge tone={health === "connected" ? "accent" : "default"}>
              Backend {health === "checking" ? "checking" : health}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
