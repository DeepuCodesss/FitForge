import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Panel, PageHeader, Badge, Input, Select, Button, Textarea } from "../../components/UI";
import {
  getMember,
  updateMember,
  deleteMember,
  getAttendance,
  markAttendance,
  getFees,
  addFee,
  markFeePaid,
  feeSummary,
  getWorkoutPlan,
  setWorkoutPlan,
  getDietPlan,
  setDietPlan,
  addNotification,
  getFeedback,
  todayISO,
} from "../../lib/store";

const EMPTY_WORKOUT = { title: "", days: [] };
const EMPTY_DIET = { title: "", meals: [] };

export default function AdminMemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [profileForm, setProfileForm] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, paid: 0 });
  const [workoutDraft, setWorkoutDraft] = useState(EMPTY_WORKOUT);
  const [dietDraft, setDietDraft] = useState(EMPTY_DIET);
  const [feedback, setFeedback] = useState([]);
  const [feeAmount, setFeeAmount] = useState("");
  const [feeDue, setFeeDue] = useState(todayISO());
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const [
        loadedMember,
        loadedAttendance,
        loadedFees,
        loadedSummary,
        loadedWorkout,
        loadedDiet,
        loadedFeedback,
      ] = await Promise.all([
        getMember(id),
        getAttendance(id),
        getFees(id),
        feeSummary(id),
        getWorkoutPlan(id),
        getDietPlan(id),
        getFeedback(id),
      ]);
      if (!alive) return;
      if (!loadedMember) {
        setMember(null);
        return;
      }
      setMember(loadedMember);
      setProfileForm(loadedMember);
      setAttendance(Array.isArray(loadedAttendance) ? loadedAttendance : []);
      setFees(Array.isArray(loadedFees) ? loadedFees : []);
      setSummary(loadedSummary || { pending: 0, paid: 0 });
      setWorkoutDraft(loadedWorkout || EMPTY_WORKOUT);
      setDietDraft(loadedDiet || EMPTY_DIET);
      setFeedback(Array.isArray(loadedFeedback) ? loadedFeedback : []);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (!member || !profileForm) {
    return (
      <div>
        <p style={{ color: "var(--color-muted)" }}>Member not found.</p>
        <Link to="/admin/members" style={{ color: "var(--color-accent)" }}>
          Back to members
        </Link>
      </div>
    );
  }

  const saveProfile = async (e) => {
    e.preventDefault();
    const updated = await updateMember(id, profileForm);
    setMember(updated.member);
    setProfileForm(updated.member);
  };

  const removeMember = async () => {
    if (confirm(`Delete ${member.name}? This cannot be undone.`)) {
      await deleteMember(id);
      navigate("/admin/members");
    }
  };

  const checkInToday = async () => {
    const item = await markAttendance(id, todayISO(), "present");
    setAttendance((items) => [item, ...items]);
  };

  const submitFee = async (e) => {
    e.preventDefault();
    if (!feeAmount) return;
    const item = await addFee(id, feeAmount, feeDue, "pending");
    setFeeAmount("");
    setFees((items) => [item, ...items]);
    setSummary((s) => ({ ...s, pending: s.pending + Number(feeAmount) }));
  };

  const payFee = async (feeId) => {
    const item = await markFeePaid(feeId);
    setFees((items) => items.map((f) => (f.id === feeId ? item : f)));
  };

  const sendNotif = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim()) return;
    await addNotification(id, notifTitle.trim(), notifMsg.trim());
    setNotifTitle("");
    setNotifMsg("");
  };

  const saveWorkout = async () => {
    const item = await setWorkoutPlan(id, workoutDraft);
    setWorkoutDraft(item || EMPTY_WORKOUT);
  };

  const saveDiet = async () => {
    const item = await setDietPlan(id, dietDraft);
    setDietDraft(item || EMPTY_DIET);
  };

  const addDay = () => setWorkoutDraft((w) => ({ ...w, days: [...w.days, { day: `Day ${w.days.length + 1}`, exercises: [] }] }));
  const addExercise = (dIdx) =>
    setWorkoutDraft((w) => {
      const days = [...w.days];
      days[dIdx] = { ...days[dIdx], exercises: [...days[dIdx].exercises, { name: "", sets: 3, reps: 10 }] };
      return { ...w, days };
    });
  const updateDay = (dIdx, key, val) =>
    setWorkoutDraft((w) => {
      const days = [...w.days];
      days[dIdx] = { ...days[dIdx], [key]: val };
      return { ...w, days };
    });
  const updateExercise = (dIdx, eIdx, key, val) =>
    setWorkoutDraft((w) => {
      const days = [...w.days];
      const exercises = [...days[dIdx].exercises];
      exercises[eIdx] = { ...exercises[eIdx], [key]: val };
      days[dIdx] = { ...days[dIdx], exercises };
      return { ...w, days };
    });
  const removeDay = (dIdx) => setWorkoutDraft((w) => ({ ...w, days: w.days.filter((_, i) => i !== dIdx) }));
  const removeExercise = (dIdx, eIdx) =>
    setWorkoutDraft((w) => {
      const days = [...w.days];
      days[dIdx] = { ...days[dIdx], exercises: days[dIdx].exercises.filter((_, i) => i !== eIdx) };
      return { ...w, days };
    });

  const addMeal = () => setDietDraft((d) => ({ ...d, meals: [...d.meals, { name: "", items: "", calories: "" }] }));
  const updateMeal = (mIdx, key, val) =>
    setDietDraft((d) => {
      const meals = [...d.meals];
      meals[mIdx] = { ...meals[mIdx], [key]: val };
      return { ...d, meals };
    });
  const removeMeal = (mIdx) => setDietDraft((d) => ({ ...d, meals: d.meals.filter((_, i) => i !== mIdx) }));

  return (
    <div>
      <Link to="/admin/members" className="inline-flex items-center gap-1.5 text-sm mb-4 hover:opacity-80" style={{ color: "var(--color-muted)" }}>
        <ArrowLeft size={14} /> Back to members
      </Link>

      <PageHeader
        title={member.name}
        subtitle={member.email}
        right={
          <div className="flex gap-2">
            <Badge tone={member.status === "active" ? "accent" : "default"}>{member.status}</Badge>
            <Button variant="ghost" onClick={removeMember}>
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel>
          <h2 className="font-bold text-lg mb-4">Profile</h2>
          <form onSubmit={saveProfile} className="grid grid-cols-2 gap-4">
            <Input label="Name" value={profileForm.name || ""} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
            <Input label="Phone" value={profileForm.phone || ""} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} />
            <Select label="Plan" value={profileForm.plan || "Basic"} onChange={(e) => setProfileForm((f) => ({ ...f, plan: e.target.value }))}>
              <option>Basic</option>
              <option>Standard</option>
              <option>Premium</option>
            </Select>
            <Select label="Status" value={profileForm.status || "active"} onChange={(e) => setProfileForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </Select>
            <Input label="Height (cm)" value={profileForm.height || ""} onChange={(e) => setProfileForm((f) => ({ ...f, height: e.target.value }))} />
            <Input label="Current Weight (kg)" value={profileForm.currentWeight || ""} onChange={(e) => setProfileForm((f) => ({ ...f, currentWeight: e.target.value }))} />
            <Input label="Target Weight (kg)" value={profileForm.targetWeight || ""} onChange={(e) => setProfileForm((f) => ({ ...f, targetWeight: e.target.value }))} />
            <Input label="Goal" value={profileForm.goal || ""} onChange={(e) => setProfileForm((f) => ({ ...f, goal: e.target.value }))} />
            <Input label="Membership Expiry" type="date" value={profileForm.membershipExpiry || ""} onChange={(e) => setProfileForm((f) => ({ ...f, membershipExpiry: e.target.value }))} />
            <Button type="submit" className="col-span-2">
              Save Profile
            </Button>
          </form>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Attendance</h2>
            <Button variant="outline" onClick={checkInToday}>
              Mark Present Today
            </Button>
          </div>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {attendance.length === 0 && <p style={{ color: "var(--color-muted)" }}>No records yet.</p>}
            {attendance.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                <span className="mono text-sm">{a.date}</span>
                <Badge tone="accent">{a.status}</Badge>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="font-bold text-lg mb-1">Fees</h2>
          <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
            Pending ${summary.pending} · Paid ${summary.paid}
          </p>
          <form onSubmit={submitFee} className="flex gap-3 mb-4 flex-wrap items-end">
            <Input label="Amount" type="number" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} className="w-28" />
            <Input label="Due date" type="date" value={feeDue} onChange={(e) => setFeeDue(e.target.value)} />
            <Button type="submit">Add Fee</Button>
          </form>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {fees.map((f) => (
              <div key={f.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                <div>
                  <p className="font-semibold">${f.amount}</p>
                  <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                    due {f.due}
                  </p>
                </div>
                {f.status === "paid" ? (
                  <Badge tone="accent">paid</Badge>
                ) : (
                  <Button variant="outline" onClick={() => payFee(f.id)}>
                    Mark Paid
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="font-bold text-lg mb-4">Send Notification</h2>
          <form onSubmit={sendNotif} className="flex flex-col gap-3">
            <Input label="Title" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} />
            <Textarea label="Message" rows={3} value={notifMsg} onChange={(e) => setNotifMsg(e.target.value)} />
            <Button type="submit" className="self-start">
              Send
            </Button>
          </form>
        </Panel>

        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Workout Plan</h2>
            <Button variant="outline" onClick={saveWorkout}>
              Save Plan
            </Button>
          </div>
          <Input label="Plan title" value={workoutDraft.title || ""} onChange={(e) => setWorkoutDraft((w) => ({ ...w, title: e.target.value }))} className="mb-4" />
          <div className="flex flex-col gap-4">
            {(workoutDraft.days || []).map((d, dIdx) => (
              <div key={dIdx} className="rounded-xl border p-4" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <Input value={d.day || ""} onChange={(e) => updateDay(dIdx, "day", e.target.value)} className="flex-1" />
                  <button type="button" onClick={() => removeDay(dIdx)} className="p-2 rounded-lg hover:bg-[var(--color-panel-2)]">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {(d.exercises || []).map((ex, eIdx) => (
                    <div key={eIdx} className="flex gap-2 items-center">
                      <Input placeholder="Exercise" value={ex.name || ""} onChange={(e) => updateExercise(dIdx, eIdx, "name", e.target.value)} className="flex-1" />
                      <Input placeholder="Sets" type="number" value={ex.sets || ""} onChange={(e) => updateExercise(dIdx, eIdx, "sets", e.target.value)} className="w-20" />
                      <Input placeholder="Reps" type="number" value={ex.reps || ""} onChange={(e) => updateExercise(dIdx, eIdx, "reps", e.target.value)} className="w-20" />
                      <button type="button" onClick={() => removeExercise(dIdx, eIdx)} className="p-2 rounded-lg hover:bg-[var(--color-panel-2)]">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => addExercise(dIdx)} className="flex items-center gap-1.5 text-sm font-semibold mt-3" style={{ color: "var(--color-accent)" }}>
                  <Plus size={14} /> Add exercise
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addDay} className="flex items-center gap-1.5 text-sm font-semibold mt-4" style={{ color: "var(--color-accent)" }}>
            <Plus size={14} /> Add day
          </button>
        </Panel>

        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Diet Plan</h2>
            <Button variant="outline" onClick={saveDiet}>
              Save Plan
            </Button>
          </div>
          <Input label="Plan title" value={dietDraft.title || ""} onChange={(e) => setDietDraft((d) => ({ ...d, title: e.target.value }))} className="mb-4" />
          <div className="flex flex-col gap-3">
            {(dietDraft.meals || []).map((m, mIdx) => (
              <div key={mIdx} className="flex gap-2 items-center">
                <Input placeholder="Meal name" value={m.name || ""} onChange={(e) => updateMeal(mIdx, "name", e.target.value)} className="w-40" />
                <Input placeholder="Items (comma separated)" value={m.items || ""} onChange={(e) => updateMeal(mIdx, "items", e.target.value)} className="flex-1" />
                <Input placeholder="kcal" type="number" value={m.calories || ""} onChange={(e) => updateMeal(mIdx, "calories", e.target.value)} className="w-24" />
                <button type="button" onClick={() => removeMeal(mIdx)} className="p-2 rounded-lg hover:bg-[var(--color-panel-2)]">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addMeal} className="flex items-center gap-1.5 text-sm font-semibold mt-4" style={{ color: "var(--color-accent)" }}>
            <Plus size={14} /> Add meal
          </button>
        </Panel>

        {feedback.length > 0 && (
          <Panel className="lg:col-span-2">
            <h2 className="font-bold text-lg mb-4">Feedback from this member</h2>
            <div className="flex flex-col gap-3">
              {feedback.map((f) => (
                <div key={f.id} className="py-2 border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                  <p className="mono text-xs" style={{ color: "var(--color-muted)" }}>
                    {f.date}
                  </p>
                  <p className="mt-1">{f.message}</p>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
