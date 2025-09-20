import { useEffect, useMemo, useState } from "react";
import { api, getUser } from "../api";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { format, isAfter } from "date-fns";
import {
  FiSearch,
  FiFilter,
  FiMapPin,
  FiClock,
  FiCalendar,
  FiArrowLeft,
  FiBookOpen,
  FiAlertCircle
} from "react-icons/fi";

export default function Events() {
  const nav = useNavigate();
  const u = getUser();

  // data
  const [events, setEvents] = useState([]);
  const [courses, setCourses] = useState([]);

  // ui state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [courseId, setCourseId] = useState("");
  const [tab, setTab] = useState("upcoming"); // upcoming | past

  const [params] = useSearchParams();

  // ngarko kurse + evente
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const cidFromQuery = params.get("courseId");
        if (cidFromQuery) setCourseId(cidFromQuery);

        const [ev, cs] = await Promise.all([
          api.get("/events", { params: { courseId: cidFromQuery || courseId || undefined } }),
          api.get("/courses"),
        ]);
        if (!mounted) return;
        setEvents(ev.data || []);
        setCourses(cs.data || []);
      } catch (e) {
        if (e?.response?.status === 401) nav("/login", { replace: true });
        else setError("Dështoi ngarkimi i të dhënave.");
      } finally {
        mounted && setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, nav, params]);

  // Enrich: siguro që çdo event të ketë e.course nëse backend s'e kthen
  const eventsWithCourse = useMemo(() => {
    if (!events?.length) return [];
    const byId = new Map(courses.map(c => [c.id, c]));
    return events.map(e => {
      if (e.course) return e;
      const c = e.courseId ? byId.get(e.courseId) : null;
      return c ? { ...e, course: c } : e;
    });
  }, [events, courses]);

  const filtered = useMemo(() => {
    const now = new Date();
    let list = eventsWithCourse;

    // kërkim
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(s) ||
          (e.description || "").toLowerCase().includes(s) ||
          (e.location || "").toLowerCase().includes(s) ||
          (e.course?.name || "").toLowerCase().includes(s) ||
          (e.course?.code || "").toLowerCase().includes(s)
      );
    }

    // ndarje kohore
    if (tab === "upcoming") {
      list = list.filter((e) => isAfter(new Date(e.date), now));
      list = list.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
      list = list.filter((e) => !isAfter(new Date(e.date), now));
      list = list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return list;
  }, [eventsWithCourse, q, tab]);

  if (error) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <button
          onClick={() => nav(-1)}
          className="text-blue-600 hover:text-blue-800 flex items-center mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Kthehu mbrapa
        </button>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <FiAlertCircle className="text-blue-500 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Gabim</h2>
          <p className="text-blue-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Provoni përsëri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Konsultime & Provime</h1>
          <p className="text-gray-600 mt-1">
            Orari i konsulimeve dhe provimeve sipas lëndës.
          </p>
        </div>

        <div className="inline-flex rounded-full overflow-hidden border border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === "upcoming" 
                ? "bg-blue-600 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setTab("upcoming")}
          >
            Të ardhshme
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === "past" 
                ? "bg-gray-800 text-white" 
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setTab("past")}
          >
            Të kaluara
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Kërko titull, përshkrim, lëndë ose lokacion…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <select
            className="flex-1 border border-gray-200 rounded-xl py-3 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">Të gjitha lëndët</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista e ngjarjeve */}
      <div className="mt-6">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl p-4 bg-white animate-pulse h-40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center bg-white border border-gray-200 rounded-2xl py-16">
            <FiCalendar className="text-gray-400 text-4xl mx-auto mb-3" />
            <p className="text-gray-500">S'ka ngjarje sipas filtrave të zgjedhur.</p>
            {(q || courseId) && (
              <button
                onClick={() => {
                  setQ("");
                  setCourseId("");
                }}
                className="mt-4 text-blue-600 hover:text-blue-800 hover:underline"
              >
                Fshini filtrat
              </button>
            )}
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((e) => {
              const dt = new Date(e.date);
              const course = e.course;

              return (
                <li
                  key={e.id}
                  className="group border border-gray-200 rounded-2xl p-4 bg-white hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
                  onClick={() => nav(`/events/${e.id}`)}
                  onKeyDown={(ev) =>
                    (ev.key === "Enter" || ev.key === " ") && nav(`/events/${e.id}`)
                  }
                  role="button"
                  tabIndex={0}
                  aria-label={`Shiko detajet për ${e.title}`}
                >
                  {/* Header me datë dhe titull */}
                  <div className="mb-3">
                    <div className={`text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                      tab === "upcoming" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      <FiCalendar size={12} /> {format(dt, "dd/MM/yyyy")}
                    </div>
                    <h3 className="mt-2 font-semibold text-gray-900 group-hover:text-blue-700 transition line-clamp-2">
                      {e.title}
                    </h3>
                  </div>

                  {/* Detajet e ngjarjes */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-2">
                      {e.location && (
                        <span className="inline-flex items-center gap-1">
                          <FiMapPin size={12} /> {e.location}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <FiClock size={12} /> {format(dt, "HH:mm")}
                      </span>
                    </div>

                    {e.description && (
                      <p className="text-sm text-gray-700 line-clamp-2">{e.description}</p>
                    )}
                  </div>

                  {/* Informacioni minimal i lëndës */}
                  {course && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FiBookOpen size={12} />
                        <span className="font-medium">{course.name}</span>
                        {course.code && <span>({course.code})</span>}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-blue-700 group-hover:text-blue-900 group-hover:underline">
                        Shiko detajet
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

    </div>
  );
}