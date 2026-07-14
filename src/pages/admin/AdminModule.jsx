import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { PageHeader, Panel, StatCard, Badge } from "../../components/UI";
import { Skeleton } from "../../components/Skeleton";

const MODULES = {
  trainers: {
    title: "Trainers",
    description: "Manage trainer profiles, assignments, and availability.",
    stats: [
      { label: "Total Trainers", value: 8 },
      { label: "Active Today", value: 5 },
      { label: "Sessions", value: 24 },
      { label: "Online", value: 4 },
    ],
  },
  "diet-plans": {
    title: "Diet Plans",
    description: "Create personalized diet plans and assign them to members.",
    stats: [
      { label: "Plans", value: 12 },
      { label: "Assigned", value: 19 },
      { label: "Compliance", value: "86%" },
      { label: "Pending Review", value: 3 },
    ],
  },
  "workout-plans": {
    title: "Workout Plans",
    description: "Build structured workout programs by category and goal.",
    stats: [
      { label: "Programs", value: 18 },
      { label: "Active", value: 11 },
      { label: "Completion", value: "72%" },
      { label: "Videos", value: 42 },
    ],
  },
  attendance: {
    title: "Attendance",
    description: "Track check-ins, monthly attendance, and trends.",
    stats: [
      { label: "Today", value: 31 },
      { label: "This Month", value: 438 },
      { label: "On Time", value: "91%" },
      { label: "Absent", value: 6 },
    ],
  },
  "progress-tracking": {
    title: "Progress Tracking",
    description: "Monitor weight, BMI, body fat, and transformation photos.",
    stats: [
      { label: "Active Logs", value: 126 },
      { label: "Updated Today", value: 14 },
      { label: "Photos", value: 78 },
      { label: "Goals Met", value: "63%" },
    ],
  },
  feedback: {
    title: "Feedback",
    description: "Review member feedback, complaints, and feature requests.",
    stats: [
      { label: "Unread", value: 4 },
      { label: "Resolved", value: 28 },
      { label: "Open", value: 6 },
      { label: "SLA", value: "2h" },
    ],
  },
  "fees-management": {
    title: "Fees Management",
    description: "Track due dates, payment status, invoices, and reminders.",
    stats: [
      { label: "Pending", value: "$18,400" },
      { label: "Paid", value: "$64,120" },
      { label: "Overdue", value: 7 },
      { label: "Invoices", value: 52 },
    ],
  },
  notifications: {
    title: "Notifications",
    description: "Send targeted announcements, reminders, and updates.",
    stats: [
      { label: "Sent Today", value: 18 },
      { label: "Scheduled", value: 5 },
      { label: "Delivered", value: "98%" },
      { label: "Read Rate", value: "74%" },
    ],
  },
  reports: {
    title: "Reports",
    description: "Generate downloadable member, attendance, fee, and revenue reports.",
    stats: [
      { label: "Generated", value: 37 },
      { label: "PDF", value: 22 },
      { label: "Excel", value: 15 },
      { label: "Exports", value: "Ready" },
    ],
  },
  analytics: {
    title: "Analytics",
    description: "Explore trends for growth, attendance, revenue, and compliance.",
    stats: [
      { label: "Growth", value: "14%" },
      { label: "Revenue", value: "+9%" },
      { label: "Attendance", value: "92%" },
      { label: "Completion", value: "76%" },
    ],
  },
  settings: {
    title: "Settings",
    description: "Update gym profile, themes, accounts, backups, and preferences.",
    stats: [
      { label: "Gym Name", value: "SRW FITZONE" },
      { label: "Trainers", value: 6 },
      { label: "Admins", value: 2 },
      { label: "Backup", value: "Auto" },
    ],
  },
};

const CHARTS = [
  "Member Growth",
  "Revenue",
  "Attendance",
  "Workout Progress",
  "Membership Plans",
  "Fee Collection",
];

export default function AdminModule() {
  const { section = "" } = useParams();
  const data = MODULES[section] || {
    title: "Admin Module",
    description: "Polished workspace for gym operations.",
    stats: [],
  };

  const bars = useMemo(() => [72, 52, 84, 66, 90, 58, 78, 64], []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.title}
        subtitle={data.description}
        right={<Badge tone="accent">Live workspace</Badge>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {data.stats.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-5">
        <Panel className="backdrop-blur-xl" style={{ background: "rgba(26, 21, 18, 0.78)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Module Snapshot</h2>
            <Badge>Auto-refresh</Badge>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-28 mt-4" />
          </div>
        </Panel>

        <Panel className="backdrop-blur-xl" style={{ background: "rgba(26, 21, 18, 0.78)" }}>
          <h2 className="font-bold text-lg mb-4">Live Charts</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {CHARTS.map((item) => (
              <div
                key={item}
                className="rounded-xl border px-3 py-2 text-sm"
                style={{ background: "rgba(31, 26, 22, 0.7)", borderColor: "var(--color-border)" }}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="flex items-end gap-2 h-40">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-t-xl"
                  style={{ height: `${h}%`, minHeight: 24, background: "linear-gradient(180deg, var(--color-accent), var(--color-accent-2))" }}
                />
                <span className="mono text-[10px]" style={{ color: "var(--color-muted)" }}>
                  Q{i + 1}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
