import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/UI";

export default function MemberSignup() {
  const { memberSignup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    Promise.resolve(memberSignup(form))
      .then((res) => { if (res.ok) navigate("/portal"); else setError(res.error); })
      .catch((err) => setError(err.message));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--color-accent)" }}>
            <Dumbbell size={18} color="#fff" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">SRW FITZONE</span>
        </Link>

        <div className="rounded-2xl border p-8" style={{ background: "var(--color-panel)", borderColor: "var(--color-border)" }}>
          <h1 className="text-2xl font-extrabold mb-1">Join as a member</h1>
          <p className="mb-6" style={{ color: "var(--color-muted)" }}>
            Create your account to start tracking your fitness journey.
          </p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <Input label="Full name" value={form.name} onChange={update("name")} required />
            <Input label="Email" type="email" value={form.email} onChange={update("email")} required />
            <Input label="Phone" value={form.phone} onChange={update("phone")} />
            <Input label="Password" type="password" value={form.password} onChange={update("password")} required minLength={4} />
            {error && <p className="text-sm" style={{ color: "#ff6a6a" }}>{error}</p>}
            <Button type="submit" className="w-full mt-2">Create Account</Button>
          </form>

          <p className="text-sm text-center mt-5" style={{ color: "var(--color-muted)" }}>
            Already a member?{" "}
            <Link to="/login" className="font-semibold" style={{ color: "var(--color-accent)" }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
