
import { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  ChartNoAxesCombined,
  Timer,
  Plus,
  Trash2,
  Check,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Clock3,
  Menu,
  X,
  Pencil,
  LoaderCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { api } from "./services/api";
import type {
  Task,
  StudyEvent,
  StudySession,
  DashboardData,
} from "./types";

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatMinutes = (n: number) =>
  `${Math.floor(n / 60)}h ${n % 60}m`;

const prettyDate = (s: string) =>
  new Date(`${s}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/tasks", label: "Task Manager", icon: ListTodo },
    { to: "/events", label: "Exam & Deadline Tracker", icon: CalendarDays },
    { to: "/progress", label: "Study Progress", icon: ChartNoAxesCombined },
    { to: "/focus", label: "Focus Mode", icon: Timer },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] md:flex">
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#151b2d] text-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500">
            <BookOpen size={22} />
          </div>

          <div>
            <div className="font-bold tracking-tight">Student Hub</div>
            <div className="text-xs text-slate-400">Command Center</div>
          </div>

          <button
            className="ml-auto md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <div className="px-4 pt-7 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Workspace
        </div>

        <nav className="flex-1 space-y-1 px-3 py-3">
          {nav.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                    isActive
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-950/30"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

       
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 hover:bg-slate-100 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu />
            </button>

            <div>
              <div className="text-sm font-semibold text-slate-800">
                Your workspace
              </div>
              <div className="text-xs text-slate-500">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="rounded-full bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700">
            Study smarter
          </div>
        </header>

        <div className="mx-auto max-w-[1440px] p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/focus" element={<FocusPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: typeof Clock3;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
          <Icon size={19} />
        </div>
      </div>
      <div className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="mt-2 text-xs text-slate-500">{note}</div>
    </div>
  );
}

function useToast() {
  const [message, setMessage] = useState("");

  const notify = (s: string) => {
    setMessage(s);
    window.setTimeout(() => setMessage(""), 3000);
  };

  return { message, notify };
}

function Toast({ message }: { message: string }) {
  return message ? (
    <div
      role="status"
      className="fixed bottom-5 right-5 z-[100] rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"
    >
      {message}
    </div>
  ) : null;
}

function Loading() {
  return (
    <div className="flex items-center gap-3 py-20 text-slate-500">
      <LoaderCircle className="animate-spin" />
      Loading your data...
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function ErrorPanel({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div role="alert" className="card">
      <p className="text-sm text-rose-600">{message}</p>
      <button className="btn btn-secondary mt-4" onClick={retry}>
        Try again
      </button>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const r = await api.get("/dashboard");
      setData(r.data.data);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load dashboard.",
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <ErrorPanel message={error} retry={load} />;
  if (!data) return <Loading />;

  const chartData = data.weeklyStudyHours.map((d) => ({
    ...d,
    day: prettyDate(d.date),
  }));

  return (
    <>
      <PageTitle
        title="Dashboard"
        subtitle="A clear view of your tasks, deadlines, and study habits."
        action={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/tasks")}
          >
            <Plus size={17} /> Add a task
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's tasks"
          value={data.todayTasks.total}
          note={`${data.todayTasks.pending} still pending`}
          icon={ListTodo}
        />
        <StatCard
          label="Completed today"
          value={data.todayTasks.completed}
          note={
            data.todayTasks.total
              ? `${Math.round(
                  (data.todayTasks.completed / data.todayTasks.total) * 100,
                )}% of today's tasks`
              : "No tasks due today"
          }
          icon={Check}
        />
        <StatCard
          label="Study time today"
          value={formatMinutes(data.todayStudyMinutes)}
          note="From saved study sessions"
          icon={Clock3}
        />
        <StatCard
          label="Total study time"
          value={`${data.overallStudyHours}h`}
          note="Across all recorded sessions"
          icon={ChartNoAxesCombined}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="card">
          <div className="mb-5">
            <h2 className="font-bold text-slate-900">
              Weekly study activity
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Hours recorded over the last seven days
            </p>
          </div>

          {chartData.every((d) => d.hours === 0) ? (
            <Empty message="Your study chart will appear after you record a session." />
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals />
                  <Tooltip />
                  <Bar
                    dataKey="hours"
                    name="Study hours"
                    fill="#7667f8"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Upcoming deadlines</h2>
            <button
              className="text-sm font-semibold text-violet-600"
              onClick={() => navigate("/events")}
            >
              View all
            </button>
          </div>

          {data.upcomingEvents.length === 0 ? (
            <Empty message="No upcoming events. Add an exam or deadline to stay prepared." />
          ) : (
            <div className="space-y-3">
              {data.upcomingEvents.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <div className="rounded-lg bg-white p-2 text-violet-600">
                    <CalendarDays size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {e.title}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {e.subject} · {e.category}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs font-semibold text-slate-600">
                    {prettyDate(e.event_date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="card mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Today's tasks</h2>
          <button
            className="text-sm font-semibold text-violet-600"
            onClick={() => navigate("/tasks")}
          >
            Manage tasks
          </button>
        </div>

        {data.todayTasksPreview.length === 0 ? (
          <Empty message="Nothing scheduled for today. Add a task to get started." />
        ) : (
          <div className="space-y-3">
            {data.todayTasksPreview.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg ${
                    t.completed
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {t.completed ? <Check size={17} /> : <ListTodo size={17} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className={`truncate text-sm font-semibold ${
                      t.completed
                        ? "text-slate-400 line-through"
                        : "text-slate-800"
                    }`}
                  >
                    {t.title}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {t.subject}
                  </div>
                </div>
                <span className="text-xs text-slate-500">
                  {t.due_time || "Today"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("due_date");
  const [editing, setEditing] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { message, notify } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/tasks", {
        params: { filter, search, sort },
      });
      setTasks(r.data.data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load tasks.");
    } finally {
      setLoading(false);
    }
  }, [filter, search, sort]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const body = {
      title: String(fd.get("title") ?? "").trim(),
      subject: String(fd.get("subject") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim() || null,
      due_date: String(fd.get("due_date") ?? ""),
      due_time: String(fd.get("due_time") ?? "") || null,
      priority: String(fd.get("priority") ?? "Medium"),
      completed: editing ? Boolean(editing.completed) : false,
    };

    try {
      // FIX: ID 0 means a new task, so create it with POST.
      if (editing && editing.id > 0) {
        await api.put(`/tasks/${editing.id}`, body);
      } else {
        await api.post("/tasks", body);
      }

      setEditing(null);
      await load();
      notify(
        editing && editing.id > 0 ? "Task updated." : "Task created.",
      );
    } catch (e) {
      notify(e instanceof Error ? e.message : "Unable to save task.");
    }
  }

  async function toggle(t: Task) {
    try {
      await api.patch(`/tasks/${t.id}/complete`, {
        completed: !t.completed,
      });
      await load();
      notify(t.completed ? "Task marked pending." : "Task completed.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Update failed.");
    }
  }

  async function remove(t: Task) {
    if (!window.confirm(`Delete "${t.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/tasks/${t.id}`);
      await load();
      notify("Task deleted.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  return (
    <>
      <PageTitle
        title="Task Manager"
        subtitle="Organize assignments and everyday study tasks."
        action={
          <button
            className="btn btn-primary"
            onClick={() =>
              setEditing({
                id: 0,
                title: "",
                description: "",
                subject: "",
                due_date: today(),
                due_time: "",
                priority: "Medium",
                completed: 0,
              })
            }
          >
            <Plus size={17} /> New task
          </button>
        }
      />

      <div className="card mb-5 grid gap-3 md:grid-cols-3">
        <input
          className="field"
          aria-label="Search tasks"
          placeholder="Search title or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="field"
          aria-label="Filter tasks"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All tasks</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>

        <select
          className="field"
          aria-label="Sort tasks"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="due_date">Sort by due date</option>
          <option value="priority">Sort by priority</option>
        </select>
      </div>

      {editing && (
        <form
          key={editing.id || "new-task"}
          className="card mb-5 grid gap-3 md:grid-cols-2"
          onSubmit={save}
        >
          <h2 className="font-bold md:col-span-2">
            {editing.id > 0 ? "Edit task" : "Create a task"}
          </h2>

          <input
            name="title"
            className="field"
            placeholder="Task title"
            defaultValue={editing.title}
            required
            maxLength={200}
          />

          <input
            name="subject"
            className="field"
            placeholder="Subject (e.g. Physics)"
            defaultValue={editing.subject}
            required
            maxLength={100}
          />

          <input
            name="due_date"
            className="field"
            type="date"
            defaultValue={editing.due_date || today()}
            required
          />

          <input
            name="due_time"
            className="field"
            type="time"
            defaultValue={editing.due_time || ""}
          />

          <select
            name="priority"
            className="field"
            defaultValue={editing.priority}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <textarea
            name="description"
            className="field"
            placeholder="Optional description"
            defaultValue={editing.description || ""}
            rows={2}
          />

          <div className="flex gap-2 md:col-span-2">
            <button className="btn btn-primary" type="submit">
              Save task
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error ? (
        <ErrorPanel message={error} retry={load} />
      ) : loading ? (
        <Loading />
      ) : tasks.length === 0 ? (
        <Empty message="No tasks match your filters. Create a task to get started." />
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="card flex flex-wrap items-center gap-3"
            >
              <button
                aria-label={t.completed ? "Mark pending" : "Mark complete"}
                onClick={() => void toggle(t)}
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${
                  t.completed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 text-slate-400 hover:border-violet-400"
                }`}
              >
                {t.completed ? <Check size={18} /> : null}
              </button>

              <div className="min-w-[160px] flex-1">
                <div
                  className={`font-semibold ${
                    t.completed
                      ? "text-slate-400 line-through"
                      : "text-slate-800"
                  }`}
                >
                  {t.title}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {t.subject} · {prettyDate(t.due_date)} {t.due_time || ""}
                </div>
                {t.description && (
                  <div className="mt-1 text-sm text-slate-500">
                    {t.description}
                  </div>
                )}
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  t.priority === "High"
                    ? "bg-rose-50 text-rose-600"
                    : t.priority === "Medium"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {t.priority}
              </span>

              <button
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Edit task"
                onClick={() => setEditing(t)}
              >
                <Pencil size={17} />
              </button>

              <button
                className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                aria-label="Delete task"
                onClick={() => void remove(t)}
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}

      <Toast message={message} />
    </>
  );
}

function EventsPage() {
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [editing, setEditing] = useState<StudyEvent | null>(null);
  const [filter, setFilter] = useState("upcoming");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { message, notify } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/events", { params: { filter } });
      setEvents(r.data.data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load events.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const body = {
      title: String(fd.get("title") ?? "").trim(),
      subject: String(fd.get("subject") ?? "").trim(),
      category: String(fd.get("category") ?? "Exam"),
      event_date: String(fd.get("event_date") ?? ""),
      event_time: String(fd.get("event_time") ?? "") || null,
      description: String(fd.get("description") ?? "").trim() || null,
    };

    try {
      if (editing && editing.id > 0) {
        await api.put(`/events/${editing.id}`, body);
      } else {
        await api.post("/events", body);
      }

      setEditing(null);
      await load();
      notify("Event saved.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Unable to save event.");
    }
  }

  async function remove(ev: StudyEvent) {
    if (!window.confirm(`Delete "${ev.title}"?`)) return;

    try {
      await api.delete(`/events/${ev.id}`);
      await load();
      notify("Event deleted.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Unable to delete event.");
    }
  }

  function remaining(date: string) {
    const [y, m, d] = date.split("-").map(Number);
    const target = new Date(y, m - 1, d);
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const days = Math.round(
      (target.getTime() - start.getTime()) / 86400000,
    );

    return days < 0
      ? "Overdue"
      : days === 0
        ? "Today"
        : days === 1
          ? "Tomorrow"
          : `${days} days remaining`;
  }

  return (
    <>
      <PageTitle
        title="Exam & Deadline Tracker"
        subtitle="Keep exams, tests, and assignments in sight."
        action={
          <button
            className="btn btn-primary"
            onClick={() =>
              setEditing({
                id: 0,
                title: "",
                subject: "",
                category: "Exam",
                event_date: today(),
                event_time: "",
                description: "",
              })
            }
          >
            <Plus size={17} /> Add event
          </button>
        }
      />

      <div className="mb-5 flex gap-2">
        {["upcoming", "past", "all"].map((f) => (
          <button
            key={f}
            className={`btn ${
              filter === f ? "btn-primary" : "btn-secondary"
            }`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "past" ? "Past" : "Upcoming"}
          </button>
        ))}
      </div>

      {editing && (
        <form
          key={editing.id || "new-event"}
          className="card mb-5 grid gap-3 md:grid-cols-2"
          onSubmit={save}
        >
          <h2 className="font-bold md:col-span-2">
            {editing.id > 0 ? "Edit event" : "New event"}
          </h2>

          <input
            name="title"
            className="field"
            placeholder="Event title"
            defaultValue={editing.title}
            required
          />

          <input
            name="subject"
            className="field"
            placeholder="Subject"
            defaultValue={editing.subject}
            required
          />

          <select
            name="category"
            className="field"
            defaultValue={editing.category}
          >
            <option>Exam</option>
            <option>Test</option>
            <option>Assignment</option>
            <option>Other</option>
          </select>

          <input
            name="event_date"
            className="field"
            type="date"
            defaultValue={editing.event_date || today()}
            required
          />

          <input
            name="event_time"
            className="field"
            type="time"
            defaultValue={editing.event_time || ""}
          />

          <textarea
            name="description"
            className="field"
            placeholder="Optional description"
            defaultValue={editing.description || ""}
          />

          <div className="flex gap-2 md:col-span-2">
            <button className="btn btn-primary" type="submit">
              Save event
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {error ? (
        <ErrorPanel message={error} retry={load} />
      ) : loading ? (
        <Loading />
      ) : events.length === 0 ? (
        <Empty message="No events here. Add an exam, test, or deadline." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {events.map((ev) => (
            <div className="card" key={ev.id}>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                  <CalendarDays />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900">{ev.title}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {ev.subject} · {ev.category}
                  </div>
                  <div className="mt-3 text-sm">
                    {prettyDate(ev.event_date)} {ev.event_time || ""}
                  </div>
                  <div
                    className={`mt-2 text-xs font-semibold ${
                      remaining(ev.event_date) === "Overdue"
                        ? "text-rose-600"
                        : "text-violet-600"
                    }`}
                  >
                    {remaining(ev.event_date)}
                  </div>
                  {ev.description && (
                    <p className="mt-2 text-sm text-slate-500">
                      {ev.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-1">
                  <button
                    aria-label="Edit event"
                    className="rounded-lg p-2 hover:bg-slate-100"
                    onClick={() => setEditing(ev)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    aria-label="Delete event"
                    className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                    onClick={() => void remove(ev)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Toast message={message} />
    </>
  );
}

function ProgressPage() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [weekly, setWeekly] = useState<
    { date: string; hours: number }[]
  >([]);
  const [subjects, setSubjects] = useState<
    { subject: string; minutes: number; hours: number; sessions: number }[]
  >([]);
  const [editing, setEditing] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { message, notify } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, w, sub] = await Promise.all([
        api.get("/study-sessions"),
        api.get("/stats/weekly"),
        api.get("/stats/subjects"),
      ]);
      setSessions(s.data.data);
      setWeekly(w.data.data);
      setSubjects(sub.data.data);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load study progress.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const hours = Number(fd.get("hours") || 0);
    const minutes = Number(fd.get("minutes") || 0);
    const duration = hours * 60 + minutes;

    if (
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 1440
    ) {
      notify("Enter a duration between 1 minute and 24 hours.");
      return;
    }

    const body = {
      subject: String(fd.get("subject") ?? "").trim(),
      study_date: String(fd.get("study_date") ?? ""),
      duration_minutes: duration,
      description: String(fd.get("description") ?? "").trim() || null,
      source: "manual",
    };

    try {
      if (editing && editing.id > 0) {
        await api.put(`/study-sessions/${editing.id}`, body);
      } else {
        await api.post("/study-sessions", body);
      }

      setEditing(null);
      await load();
      notify("Study session saved.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Unable to save session.");
    }
  }

  async function remove(s: StudySession) {
    if (!window.confirm("Delete this study session?")) return;

    try {
      await api.delete(`/study-sessions/${s.id}`);
      await load();
      notify("Session deleted.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  const totalMinutes = sessions.reduce(
    (sum, s) => sum + s.duration_minutes,
    0,
  );

  const chartData = weekly.map((d) => ({
    ...d,
    day: prettyDate(d.date),
  }));

  const pieData = subjects.map((s) => ({
    name: s.subject,
    value: s.minutes,
  }));

  const pieColors = [
    "#7667f8",
    "#16a085",
    "#f59e0b",
    "#ec4899",
    "#0ea5e9",
    "#8b5cf6",
  ];

  return (
    <>
      <PageTitle
        title="Study Progress"
        subtitle="Understand how your study time is adding up."
        action={
          <button
            className="btn btn-primary"
            onClick={() =>
              setEditing({
                id: 0,
                subject: "",
                study_date: today(),
                duration_minutes: 60,
                description: "",
                source: "manual",
              })
            }
          >
            <Plus size={17} /> Record session
          </button>
        }
      />

      {error ? (
        <ErrorPanel message={error} retry={load} />
      ) : loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total study time"
              value={formatMinutes(totalMinutes)}
              note="Across recorded sessions"
              icon={Clock3}
            />
            <StatCard
              label="Study sessions"
              value={sessions.length}
              note="Saved sessions"
              icon={BookOpen}
            />
            <StatCard
              label="Subjects studied"
              value={subjects.length}
              note="Subjects with study records"
              icon={ChartNoAxesCombined}
            />
          </div>

          {editing && (
            <form
              key={editing.id || "new-session"}
              className="card mt-6 grid gap-3 md:grid-cols-2"
              onSubmit={save}
            >
              <h2 className="font-bold md:col-span-2">
                {editing.id > 0
                  ? "Edit study session"
                  : "Record study session"}
              </h2>

              <input
                name="subject"
                className="field"
                placeholder="Subject"
                defaultValue={editing.subject}
                required
              />

              <input
                name="study_date"
                className="field"
                type="date"
                defaultValue={editing.study_date || today()}
                required
              />

              <label className="text-sm text-slate-600">
                Hours
                <input
                  name="hours"
                  className="field mt-1"
                  type="number"
                  min="0"
                  max="24"
                  defaultValue={Math.floor(
                    editing.duration_minutes / 60,
                  )}
                />
              </label>

              <label className="text-sm text-slate-600">
                Minutes
                <input
                  name="minutes"
                  className="field mt-1"
                  type="number"
                  min="0"
                  max="59"
                  defaultValue={editing.duration_minutes % 60}
                />
              </label>

              <textarea
                name="description"
                className="field md:col-span-2"
                placeholder="Optional session description"
                defaultValue={editing.description || ""}
              />

              <div className="flex gap-2 md:col-span-2">
                <button className="btn btn-primary" type="submit">
                  Save session
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="card">
              <h2 className="font-bold">Study hours · last 7 days</h2>
              <p className="mb-5 mt-1 text-sm text-slate-500">
                Daily recorded study time
              </p>

              {chartData.every((d) => d.hours === 0) ? (
                <Empty message="Record a session to start your weekly chart." />
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="hours"
                        name="Hours"
                        fill="#7667f8"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="card">
              <h2 className="font-bold">Study time by subject</h2>
              <p className="mb-5 mt-1 text-sm text-slate-500">
                Distribution of recorded minutes
              </p>

              {pieData.length === 0 ? (
                <Empty message="Subject statistics will appear after your first session." />
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                        innerRadius={48}
                        paddingAngle={3}
                      >
                        {pieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={pieColors[i % pieColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v} min`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>

          <section className="card mt-6">
            <h2 className="mb-4 font-bold">Study session history</h2>

            {sessions.length === 0 ? (
              <Empty message="No study sessions recorded yet." />
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3"
                  >
                    <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
                      <BookOpen size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{s.subject}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {prettyDate(s.study_date)} ·{" "}
                        {formatMinutes(s.duration_minutes)}
                      </div>
                      {s.description && (
                        <div className="mt-1 text-sm text-slate-500">
                          {s.description}
                        </div>
                      )}
                    </div>

                    <button
                      className="rounded-lg p-2 hover:bg-slate-100"
                      aria-label="Edit session"
                      onClick={() => setEditing(s)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                      aria-label="Delete session"
                      onClick={() => void remove(s)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <Toast message={message} />
    </>
  );
}

interface FocusState {
  duration: number;
  remaining: number;
  status: "idle" | "running" | "paused" | "completed";
  deadline: number | null;
  subject: string;
  saved: boolean;
  sessionId: string | null;
}

const initialFocus: FocusState = {
  duration: 25 * 60,
  remaining: 25 * 60,
  status: "idle",
  deadline: null,
  subject: "General",
  saved: false,
  sessionId: null,
};

function FocusPage() {
  const [focus, setFocus] = useState<FocusState>(() => {
    try {
      const raw = localStorage.getItem("student-focus-state");

      if (raw) {
        const s = JSON.parse(raw) as FocusState;

        if (s.status === "running" && s.deadline) {
          s.remaining = Math.max(
            0,
            Math.ceil((s.deadline - Date.now()) / 1000),
          );

          if (s.remaining === 0) {
            s.status = "completed";
            s.deadline = null;
          }
        }

        return s;
      }
    } catch {
      // Use default state if saved data is invalid.
    }

    return initialFocus;
  });

  const [now, setNow] = useState(Date.now());
  const [saving, setSaving] = useState(false);
  const { message, notify } = useToast();

  useEffect(() => {
    localStorage.setItem("student-focus-state", JSON.stringify(focus));
  }, [focus]);

  useEffect(() => {
    if (focus.status !== "running") return;

    const id = window.setInterval(() => setNow(Date.now()), 250);

    return () => window.clearInterval(id);
  }, [focus.status]);

  const remaining =
    focus.status === "running" && focus.deadline
      ? Math.max(0, Math.ceil((focus.deadline - now) / 1000))
      : focus.remaining;

  useEffect(() => {
    if (focus.status === "running" && remaining === 0) {
      setFocus((f) => ({
        ...f,
        remaining: 0,
        status: "completed",
        deadline: null,
      }));

      try {
        if (
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification("Focus session complete", {
            body: "Your focus timer has finished.",
          });
        }

        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();

        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.frequency.value = 660;
        gain.gain.value = 0.08;
        oscillator.start();
        oscillator.stop(audio.currentTime + 0.25);
        oscillator.onended = () => void audio.close();
      } catch {
        // Audio or notification permissions may be unavailable.
      }
    }
  }, [focus.status, remaining]);

  const clock = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(
    remaining % 60,
  ).padStart(2, "0")}`;

  const progress =
    focus.duration > 0
      ? (focus.duration - remaining) / focus.duration
      : 0;

  function selectDuration(minutes: number) {
    if (focus.status === "running") return;

    setFocus({
      ...initialFocus,
      duration: minutes * 60,
      remaining: minutes * 60,
      subject: focus.subject,
    });
  }

  function start() {
    if (focus.status === "completed" || focus.remaining === 0) return;

    if (
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      void Notification.requestPermission();
    }

    setFocus((f) => ({
      ...f,
      status: "running",
      deadline: Date.now() + f.remaining * 1000,
    }));
  }

  function pause() {
    setFocus((f) => ({
      ...f,
      status: "paused",
      remaining,
      deadline: null,
    }));
  }

  function reset() {
    setFocus((f) => ({
      ...f,
      remaining: f.duration,
      status: "idle",
      deadline: null,
      saved: false,
      sessionId: null,
    }));
  }

  async function saveSession() {
    if (focus.status !== "completed" || focus.saved || saving) return;

    setSaving(true);

    try {
      const key = focus.sessionId ?? crypto.randomUUID();

      const savedKeys = JSON.parse(
        localStorage.getItem("student-focus-saved") ?? "[]",
      ) as string[];

      if (savedKeys.includes(key)) {
        setFocus((f) => ({
          ...f,
          saved: true,
          sessionId: key,
        }));
        notify("This session has already been saved.");
        return;
      }

      const activeMinutes = Math.floor(focus.duration / 60);

      if (activeMinutes < 1) {
        notify("Session is too short to save.");
        return;
      }

      await api.post("/study-sessions", {
        subject: focus.subject.trim() || "General",
        study_date: today(),
        duration_minutes: activeMinutes,
        description: "Completed focus timer",
        source: "focus",
      });

      localStorage.setItem(
        "student-focus-saved",
        JSON.stringify([...savedKeys, key]),
      );

      setFocus((f) => ({
        ...f,
        saved: true,
        sessionId: key,
      }));

      notify("Focus session saved to Study Progress.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Unable to save session.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageTitle
        title="Focus Mode"
        subtitle="Set a timer, silence distractions, and focus on one subject."
      />

      <div className="mx-auto max-w-3xl">
        <div className="card overflow-hidden">
          <div className="flex flex-wrap justify-center gap-2">
            {[25, 45, 60].map((n) => (
              <button
                key={n}
                disabled={focus.status === "running"}
                onClick={() => selectDuration(n)}
                className={`btn ${
                  focus.duration === n * 60
                    ? "btn-primary"
                    : "btn-secondary"
                }`}
              >
                {n} minutes
              </button>
            ))}
          </div>

          <div
            className="relative mx-auto my-9 grid h-64 w-64 place-items-center rounded-full"
            style={{
              background: `conic-gradient(#7667f8 ${
                progress * 360
              }deg, #edf0f7 ${progress * 360}deg)`,
            }}
          >
            <div className="grid h-[224px] w-[224px] place-items-center rounded-full bg-white">
              <div className="text-center">
                <div className="font-mono text-6xl font-bold tracking-tight text-slate-900">
                  {clock}
                </div>
                <div className="mt-3 text-sm font-medium capitalize text-slate-500">
                  {focus.status === "idle"
                    ? "Ready to focus"
                    : focus.status}
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mb-5 max-w-sm">
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Subject for this session
            </label>
            <input
              className="field"
              value={focus.subject}
              disabled={focus.status === "running"}
              maxLength={100}
              onChange={(e) =>
                setFocus((f) => ({
                  ...f,
                  subject: e.target.value,
                }))
              }
              placeholder="e.g. Mathematics"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {(focus.status === "idle" ||
              focus.status === "paused") && (
              <button
                className="btn btn-primary min-w-28"
                onClick={start}
              >
                <Play size={17} />
                {focus.status === "paused" ? "Resume" : "Start"}
              </button>
            )}

            {focus.status === "running" && (
              <button
                className="btn btn-primary min-w-28"
                onClick={pause}
              >
                <Pause size={17} />
                Pause
              </button>
            )}

            <button
              className="btn btn-secondary min-w-28"
              onClick={reset}
            >
              <RotateCcw size={17} />
              Reset
            </button>
          </div>

          {focus.status === "completed" && (
            <div className="mt-6 rounded-xl bg-emerald-50 p-5 text-center">
              <div className="font-bold text-emerald-800">
                Focus session completed!
              </div>
              <p className="mt-1 text-sm text-emerald-700">
                Save your completed session to your study history.
              </p>
              <button
                disabled={focus.saved || saving}
                className="btn btn-primary mt-4"
                onClick={() => void saveSession()}
              >
                {saving
                  ? "Saving..."
                  : focus.saved
                    ? "Session saved"
                    : "Save to Study Progress"}
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            The timer uses timestamps so it can recover after navigation or
            refresh. Save a completed session to include it in your analytics.
          </p>
        </div>
      </div>

      <Toast message={message} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
