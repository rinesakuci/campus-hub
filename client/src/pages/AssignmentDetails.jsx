import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api, getUser } from "../api";
import { format } from "date-fns";
import {
  FiArrowLeft,
  FiBookOpen,
  FiClock,
} from "react-icons/fi";
import CommentsPanel from "../components/CommentsPanel";

export default function AssignmentDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const u = getUser();

  const [a, setA] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.get(`/assignments/${id}`);
        if (!mounted) return;
        setA(data);

        if (data?.course?.id) {
          setCourse(data.course);
        } else if (data?.courseId) {
          try {
            const { data: c } = await api.get(`/courses/${data.courseId}`);
            if (mounted) setCourse(c);
          } catch {}
        }
      } catch (e) {
        if (e?.response?.status === 401) return nav("/login", { replace: true });
        if (e?.response?.status === 404) setErr("Detyra nuk u gjet.");
        else setErr("Nuk u ngarkua detyra.");
      } finally {
        mounted && setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id, nav]);

  const due = useMemo(() => (a ? new Date(a.dueAt) : null), [a]);

  if (loading) {
    return (
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <FiArrowLeft /> Kthehu mbrapa
        </button>
        <div className="mt-4 grid gap-4">
          <div className="rounded-2xl border bg-white p-6 animate-pulse h-36" />
          <div className="rounded-2xl border bg-white p-6 animate-pulse h-64" />
        </div>
      </div>
    );
  }

  if (err || !a) {
    return (
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <FiArrowLeft /> Kthehu mbrapa
        </button>
        <div className="mt-4 rounded-2xl border bg-white p-6 text-center">
          <p className="text-red-600 text-sm">{err || "Detyra nuk u gjet."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8 space-y-6">
      <button onClick={() => nav(-1)} className="flex cursor-pointer items-center gap-2 text-slate-600 hover:text-slate-900">
        <FiArrowLeft /> Kthehu mbrapa
      </button>

      <header className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{a.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {due && (
                <span className="inline-flex items-center gap-1 text-violet-700 bg-violet-50 px-2 py-1 rounded-full">
                  <FiClock /> Afati: {format(due, "MMM d, yyyy HH:mm")}
                </span>
              )}

              {course && (
                <Link
                  to={`/courses/${course.id}`}
                  className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full hover:underline"
                >
                  <FiBookOpen /> {course.name}{course.code ? ` (${course.code})` : ""}
                </Link>
              )}
            </div>

            {a.description && (
              <p className="mt-4 text-slate-700 leading-relaxed">{a.description}</p>
            )}
          </div>
        </div>
      </header>

      <CommentsPanel
        entityType="assignment"
        entityId={id}
        allowPost={Boolean(u)}
      />
    </div>
  );
}
