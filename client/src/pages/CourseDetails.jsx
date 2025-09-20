import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { format, isAfter } from "date-fns";
import {
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiArrowLeft,
  FiAlertCircle
} from "react-icons/fi";

export default function CourseDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.get(`/courses/${id}`);
        if (!mounted) return;
        setCourse(data);
      } catch (e) {
        if (e?.response?.status === 404) setErr("Lënda nuk u gjet.");
        else if (e?.response?.status === 401) nav("/login", { replace: true });
        else setErr("Dështoi ngarkimi i lëndës.");
      } finally {
        mounted && setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id, nav]);

  const stats = useMemo(() => {
    if (!course) return { a: 0, upcomingEvents: 0 };
    const now = new Date();
    const upcomingEvents = course.events?.filter((ev) => isAfter(new Date(ev.date), now)) || [];
    return {
      a: course.assignments?.length || 0,
      upcomingEvents: upcomingEvents.length
    };
  }, [course]);

  const sortedAssignments = useMemo(() => {
    if (!course?.assignments) return [];
    const now = new Date();
    return [...course.assignments].sort((a, b) => {
      const aOver = !isAfter(new Date(a.dueAt), now);
      const bOver = !isAfter(new Date(b.dueAt), now);
      if (aOver !== bOver) return aOver - bOver;
      return new Date(a.dueAt) - new Date(b.dueAt);
    });
  }, [course]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 bg-gray-200 rounded" />
          <div className="bg-white rounded-2xl shadow p-5 sm:p-6 border">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gray-200 h-14 w-14 sm:h-16 sm:w-16" />
              <div className="flex-1 space-y-3">
                <div className="h-7 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl bg-gray-200 h-14 sm:h-16" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 border h-40" />
          <div className="bg-white rounded-2xl shadow p-5 border h-40" />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <button
          onClick={() => nav(-1)}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 sm:mb-6"
        >
          <FiArrowLeft /> Kthehu mbrapa
        </button>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 sm:p-6 text-center">
          <FiAlertCircle className="text-red-500 text-3xl sm:text-4xl mx-auto mb-2 sm:mb-3" />
          <h2 className="text-lg sm:text-xl font-semibold text-red-800 mb-1 sm:mb-2">Gabim</h2>
          <p className="text-red-600 text-sm sm:text-base">{err}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Provoni përsëri
          </button>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const activeEvents =
    course.events?.filter((ev) => isAfter(new Date(ev.date), new Date())) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => nav(-1)}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
        >
          <FiArrowLeft /> <span className="hidden xs:inline">Kthehu mbrapa</span>
        </button>
      </div>

      <div className="mt-4 sm:mt-6 bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <FiBookOpen className="text-2xl sm:text-3xl" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
              {course.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Kodi:{" "}
              <span className="font-medium text-indigo-700 break-all">{course.code}</span>
            </p>
            {course.description && (
              <p className="text-gray-700 mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">
                {course.description}
              </p>
            )}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat
                label="Detyra"
                value={stats.a}
                icon={<FiBookOpen className="inline mb-0.5" />}
              />
              <Stat
                label="Provime & Konsultime"
                value={stats.upcomingEvents}
                icon={<FiCalendar className="inline mb-0.5" />}
              />
            </div>
          </div>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-800">
            <FiCalendar className="text-emerald-600" />
            Provime & Konsultime aktive
          </h2>
          <Link
            to="/events"
            className="text-sm sm:text-[15px] text-emerald-700 hover:text-emerald-900 hover:underline inline-flex items-center"
          >
            Shiko të gjitha
            <span className="ml-1 inline-block rotate-180">
              <FiArrowLeft size={14} />
            </span>
          </Link>
        </div>

        {activeEvents.length ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {activeEvents.map((ev) => {
              const eventDate = new Date(ev.date);
              return (
                <li
                  key={ev.id}
                  onClick={() => nav(`/events/${ev.id}`)}
                  className="bg-white border border-emerald-100 rounded-xl p-4 transition-all cursor-pointer hover:shadow-md hover:border-emerald-200 focus-within:ring-2 focus-within:ring-emerald-300"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && nav(`/events/${ev.id}`)
                  }
                >
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg line-clamp-2">
                    {ev.title}
                  </h3>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-1">
                      <FiClock className="text-gray-400 shrink-0" />
                      <span className="truncate">
                        {format(eventDate, "EEEE, d MMMM yyyy 'në' HH:mm")}
                      </span>
                    </div>
                    {ev.location && (
                      <div className="flex items-center gap-1">
                        <FiMapPin className="text-gray-400 shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    )}
                  </div>
                  {ev.description && (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      {ev.description}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 sm:p-6 text-center">
            <FiCalendar className="text-gray-400 text-2xl mx-auto mb-2" />
            <p className="text-gray-500 text-sm sm:text-base">
              S'ka provime/konsultime aktive për këtë lëndë.
            </p>
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-800">
            <FiBookOpen className="text-violet-600" />
            Detyrat
          </h2>
          <Link
            to="/assignments"
            className="text-sm sm:text-[15px] text-violet-700 hover:text-violet-900 hover:underline inline-flex items-center"
          >
            Shiko të gjitha
            <span className="ml-1 inline-block rotate-180">
              <FiArrowLeft size={14} />
            </span>
          </Link>
        </div>

        {sortedAssignments.length ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {sortedAssignments.map((a) => {
              const due = new Date(a.dueAt);
              const isOverdue = !isAfter(due, new Date());
              return (
                <li
                  key={a.id}
                  onClick={() => nav(`/assignments/${a.id}`)}
                  className={`bg-white border rounded-xl p-4 transition-all cursor-pointer hover:shadow-md hover:translate-y-[-2px] focus-within:ring-2 ${
                    isOverdue
                      ? "border-rose-100 hover:border-rose-200 focus-within:ring-rose-300"
                      : "border-violet-100 hover:border-violet-200 focus-within:ring-violet-300"
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && nav(`/assignments/${a.id}`)
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg line-clamp-2">
                      {a.title}
                    </h3>
                    <span
                      className={`shrink-0 text-[11px] sm:text-xs px-2 py-1 rounded-full ${
                        isOverdue ? "bg-rose-100 text-rose-800" : "bg-violet-100 text-violet-800"
                      }`}
                    >
                      {isOverdue ? "Skaduar" : "Aktiv"}
                    </span>
                  </div>
                  <div
                    className={`mt-2 text-sm flex items-center gap-1 ${
                      isOverdue ? "text-rose-600" : "text-gray-600"
                    }`}
                  >
                    <FiClock className="shrink-0" />
                    <span className="truncate">
                      Afati: {format(due, "EEEE, d MMMM yyyy 'në' HH:mm")}
                    </span>
                  </div>
                  {a.description && (
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{a.description}</p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 sm:p-6 text-center">
            <FiBookOpen className="text-gray-400 text-2xl mx-auto mb-2" />
            <p className="text-gray-500 text-sm sm:text-base">S'ka detyra për këtë lëndë.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 text-center p-3 sm:p-4">
      <div className="text-xl sm:text-2xl font-bold text-indigo-600 flex items-center justify-center gap-2">
        {value} {icon}
      </div>
      <div className="text-[11px] sm:text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
}
