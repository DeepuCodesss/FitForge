import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { PageHeader, Panel, Input, Button } from "../../components/UI";
import { updateMember } from "../../lib/store";

export default function Settings() {
  const { member, refreshMember, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState(member?.name || "");
  const [email, setEmail] = useState(member?.email || "");
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);

  if (!member) return null;

  const saveAccount = (e) => {
    e.preventDefault();
    const patch = { name, email };
    if (password) patch.password = password;
    updateMember(member.id, patch);
    refreshMember();
    setPassword("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account preferences" />

      <div className="flex flex-col gap-6 max-w-xl">
        <Panel>
          <h2 className="font-bold text-lg mb-4">Account</h2>
          <form onSubmit={saveAccount} className="flex flex-col gap-4">
            <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="New password" type="password" placeholder="Leave blank to keep current" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" className="self-start">Save Changes</Button>
            {saved && <p className="text-sm" style={{ color: "var(--color-accent)" }}>Saved.</p>}
          </form>
        </Panel>

        <Panel className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Appearance</h2>
            <p style={{ color: "var(--color-muted)" }} className="text-sm mt-1">
              Currently using {theme} mode
            </p>
          </div>
          <Button variant="outline" onClick={toggleTheme}>
            Switch to {theme === "dark" ? "Light" : "Dark"}
          </Button>
        </Panel>

        <Panel className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Log out</h2>
            <p style={{ color: "var(--color-muted)" }} className="text-sm mt-1">
              End your current session on this device
            </p>
          </div>
          <Button variant="ghost" onClick={logout}>Logout</Button>
        </Panel>
      </div>
    </div>
  );
}
