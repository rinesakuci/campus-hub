import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, getUser } from "../api";
import { format } from "date-fns";
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiBookOpen,
  FiAlertCircle
} from "react-icons/fi";
import CommentsPanel from "../components/CommentsPanel";

export default function EventDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const u = getUser();

  const [ev, setEv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.get(`/events/${id}`);
        if (!mounted) return;
        setEv(data);
      } catch (e) {
        if (e?.response?.status === 401) return nav("/login", { replace: true });
        setErr("Nuk u ngarkua ngjarja.");
      } finally {
        mounted && setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id, nav]);

  const courseLink = useMemo(() => {
    if (!ev) return null;
    if (ev.course?.id) return { id: ev.course.id, label: `${ev.course.name}${ev.course.code ? ` (${ev.course.code})` : ""}` };
    if (ev.courseId) return { id: ev.courseId, label: "Shko te lënda" };
    return null;
  }, [ev]);

  if (loading) {
    return (
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        <button 
          onClick={() => nav(-1)} 
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
        >
          <FiArrowLeft /> Kthehu mbrapa
        </button>
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 animate-pulse h-40" />
          <div className="rounded-2xl border border-gray-200 bg-white p-6 animate-pulse h-64" />
        </div>
      </div>
    );
  }

  if (err || !ev) {
    return (
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        <button 
          onClick={() => nav(-1)} 
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-6"
        >
          <FiArrowLeft /> Kthehu mbrapa
        </button>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <FiAlertCircle className="text-red-500 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Gabim</h2>
          <p className="text-red-600">{err || "Ngjarja nuk u gjet."}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Provoni përsëri
          </button>
        </div>
      </div>
    );
  }

  const dt = new Date(ev.date);
  const isPastEvent = new Date() > dt;

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8 space-y-6">
      <button 
        onClick={() => nav(-1)} 
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <FiArrowLeft /> Kthehu mbrapa
      </button>

      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{ev.title}</h1>
                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full ${
                    isPastEvent 
                      ? "bg-gray-100 text-gray-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    <FiCalendar size={14} /> {format(dt, "EEEE, d MMMM yyyy")}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800">
                    <FiClock size={14} /> {format(dt, "HH:mm")}
                  </span>
                  {ev.location && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-gray-800">
                      <FiMapPin size={14} /> {ev.location}
                    </span>
                  )}
                </div>
              </div>
              
              {isPastEvent && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  E kaluar
                </span>
              )}
            </div>

            {ev.description && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Përshkrimi</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {ev.description}
                </p>
              </div>
            )}
          </div>

          {courseLink && (
            <Link
              to={`/courses/${courseLink.id}`}
              className="self-start inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FiBookOpen size={16} />
              <span>{courseLink.label}</span>
            </Link>
          )}
        </div>
      </header>

      <CommentsPanel
        entityType="event"
        entityId={id}
        allowPost={Boolean(u)}
      />
    </div>
  );
}