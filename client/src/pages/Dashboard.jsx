import { useMemo, useState, useEffect } from "react";
import { format, differenceInCalendarDays, isBefore } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { api, getUser } from "../api";
import {
  FiCalendar,
  FiBookOpen,
  FiBell,
  FiClock,
  FiMapPin,
} from "react-icons/fi";
import DashboardCard from "../components/DashboardCard";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const [ev, asg, nots] = await Promise.all([
          api.get("/events"),
          api.get("/assignments", { params: { days: 30 } }),
          api.get("/notifications"),
        ]);
        if (!mounted) return;
        setEvents(Array.isArray(ev.data) ? ev.data : []);
        setAssignments(Array.isArray(asg.data) ? asg.data : []);
        setNotifications(Array.isArray(nots.data) ? nots.data : []);
      } catch (err) {
        if (err?.response?.status === 401) {
          nav("/login", { replace: true });
          return;
        }
        console.error("Dashboard load error", err);
      } finally {
        mounted && setIsLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [nav]);

  const user = getUser();

  const stats = useMemo(() => {
    const today = new Date();
    const upcomingEvents = events.filter((e) => new Date(e.date) >= today);
    const overdueAssignments = assignments.filter((a) => isBefore(new Date(a.dueAt), today));
    const dueSoonAssignments = assignments.filter((a) => {
      const d = differenceInCalendarDays(new Date(a.dueAt), today);
      return d >= 0 && d <= 7;
    });
    return {
      upcomingCount: upcomingEvents.length,
      overdueCount: overdueAssignments.length,
      dueSoonCount: dueSoonAssignments.length,
      notifCount: notifications.length,
    };
  }, [events, assignments, notifications]);

  return (
    <div className="min-h-[100dvh]">
      <div className="container mx-auto px-4 py-8">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-xl">
          <div className="absolute -top-10 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-14 -left-14 h-56 w-56 rounded-full bg-black/10 blur-2xl" />
          <div className="relative z-10 p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-sm md:text-base text-white/80">Paneli i Studentit</p>
                <h1 className="mt-1 text-3xl md:text-4xl font-extrabold tracking-tight">
                  Mirë se erdhe{user?`, ${user.fullName}`:""}! <span className="inline-block">👋</span>
                </h1>
                <p className="mt-2 max-w-2xl text-white/90">
                  Menaxho ngjarjet, detyrat dhe njoftimet në një vend.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/assignments"
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/20 transition"
                >
                  <FiBookOpen className="text-lg" /> Detyrat
                </Link>
                <Link
                  to="/notifications"
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/20 transition"
                >
                  <FiBell className="text-lg" /> Njoftimet
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<FiCalendar />} label="Ngjarje të ardhshme" value={stats.upcomingCount} />
          <StatCard icon={<FiBookOpen />} label="Detyrat brenda 7 ditëve" value={stats.dueSoonCount} />
          <StatCard icon={<FiBell />} label="Njoftime" value={stats.notifCount} />
        </section>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          <DashboardCard title="Njoftime të Rëndësishme" icon={<FiBell className="text-3xl text-rose-500" />}>
            {isLoading ? <SkeletonList rows={3} /> : (
              notifications.length ? (
                <ul className="space-y-4">
                  {notifications.map((notif) => (
                    <li key={notif._id || notif.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <h3 className="font-semibold text-slate-800">{notif.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{notif.message}</p>
                      <span className="text-xs text-slate-500">{format(new Date(notif.createdAt), "MMM d, yyyy")}</span>
                    </li>
                  ))}
                </ul>
              ) : <div className="text-sm text-slate-500">S’ka njoftime.</div>
            )}
          </DashboardCard>

          <DashboardCard title="Ngjarjet e Ardhshme" icon={<FiCalendar className="text-3xl text-emerald-500" />}>
            {isLoading ? <SkeletonList rows={2} /> : (
              events.length ? (
                <ul className="space-y-4">
                  {events.map((event) => (
                    <li key={event.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <h3 className="font-semibold text-slate-800">{event.title}</h3>
                      <p className="text-sm text-slate-600 flex items-center gap-1"><FiClock /> {format(new Date(event.date), "MMM d, yyyy HH:mm")}</p>
                      {event.location && <p className="text-xs text-slate-500 flex items-center gap-1"><FiMapPin /> {event.location}</p>}
                    </li>
                  ))}
                </ul>
              ) : <div className="text-sm text-slate-500">S’ka ngjarje të planifikuara.</div>
            )}
          </DashboardCard>

          <DashboardCard title="Detyrat e Afërta" icon={<FiBookOpen className="text-3xl text-violet-500" />}>
            {isLoading ? <SkeletonList rows={2} /> : (
              assignments.length ? (
                <ul className="space-y-4">
                  {assignments.map((a) => {
                    const due = new Date(a.dueAt);
                    return (
                      <li key={a.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <h3 className="font-semibold text-slate-800">{a.title}</h3>
                        <p className="text-sm text-slate-600 flex items-center gap-1"><FiClock /> Afati: {format(due, "MMM d, yyyy HH:mm")}</p>
                      </li>
                    );
                  })}
                </ul>
              ) : <div className="text-sm text-slate-500">S’ka detyra brenda intervalit.</div>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, tone = "default" }) {
  const tones = {
    default: "ring-slate-200 bg-white",
    warning: "ring-amber-200 bg-white",
  };
  return (
    <div className={`rounded-2xl p-5 shadow-sm ring-1 ${tones[tone]}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-700">{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SkeletonList({ rows }) {
  return (
    <ul className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
          <div className="h-4 w-2/3 bg-slate-200 rounded" />
          <div className="mt-2 h-3 w-1/2 bg-slate-200 rounded" />
        </li>
      ))}
    </ul>
  );
}