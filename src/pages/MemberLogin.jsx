import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/UI";

export default function MemberLogin() {
  const { memberLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("deeepak@gmail.com");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    Promise.resolve(memberLogin(email, password))
      .then((res) => {
        if (res.ok) navigate("/portal");
        else setError(res.error);
      })
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
          <h1 className="text-2xl font-extrabold mb-1">Welcome back</h1>
          <p className="mb-6" style={{ color: "var(--color-muted)" }}>
            Log in to your member portal.
          </p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-sm" style={{ color: "#ff6a6a" }}>{error}</p>}
            <Button type="submit" className="w-full mt-2">Log In</Button>
          </form>

          <p className="text-sm text-center mt-5" style={{ color: "var(--color-muted)" }}>
            New here?{" "}
            <Link to="/signup" className="font-semibold" style={{ color: "var(--color-accent)" }}>
              Create an account
            </Link>
          </p>
          <p className="text-xs text-center mt-4" style={{ color: "var(--color-muted)" }}>
            Demo login is pre-filled — just hit Log In.
          </p>
        </div>
      </div>
    </div>
  );
}
