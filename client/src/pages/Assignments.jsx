import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, getUser } from "../api";
import Modal from "../components/Modal";
import { format, isAfter } from "date-fns";
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiBookOpen,
  FiClock,
  FiArrowLeft,
  FiAlertCircle,
  FiTrash2
} from "react-icons/fi";

export default function Assignments() {
  const nav = useNavigate();
  const u = getUser();

  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [courseId, setCourseId] = useState("");
  const [tab, setTab] = useState("upcoming");

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [cid, setCid] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [params] = useSearchParams();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const cidFromQuery = params.get("courseId");
        if (cidFromQuery) setCourseId(cidFromQuery);

        const [a, c] = await Promise.all([
          api.get("/assignments"),
          api.get("/courses"),
        ]);
        if (!mounted) return;
        setAssignments(a.data || []);
        setCourses(c.data || []);
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
  }, [nav, params]);

  const coursesById = useMemo(() => {
    const m = new Map();
    for (const c of courses) m.set(c.id, c);
    return m;
  }, [courses]);

  const filtered = useMemo(() => {
    const now = new Date();
    let list = assignments;

    if (courseId) {
      const cidNum = Number(courseId);
      list = list.filter(a => a.courseId === cidNum);
    }

    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.title?.toLowerCase().includes(s) ||
          (a.description || "").toLowerCase().includes(s) ||
          (coursesById.get(a.courseId)?.name || "").toLowerCase().includes(s) ||
          (coursesById.get(a.courseId)?.code || "").toLowerCase().includes(s)
      );
    }

    if (tab === "upcoming") {
      list = list.filter((a) => isAfter(new Date(a.dueAt), now));
      list = list.sort((x, y) => new Date(x.dueAt) - new Date(y.dueAt));
    } else {
      list = list.filter((a) => !isAfter(new Date(a.dueAt), now));
      list = list.sort((x, y) => new Date(y.dueAt) - new Date(x.dueAt));
    }

    return list;
  }, [assignments, q, tab, courseId, coursesById]);

  async function refreshList() {
    const { data } = await api.get("/assignments");
    setAssignments(data || []);
  }

  async function createAssignment(e) {
    e.preventDefault();
    if (!title.trim() || !cid || !dueAt) return;
    setSubmitting(true);
    try {
      await api.post("/assignments", {
        title: title.trim(),
        courseId: Number(cid),
        dueAt: new Date(dueAt).toISOString(),
        description: description?.trim() || undefined,
      });
      setOpen(false);
      setTitle("");
      setCid("");
      setDueAt("");
      setDescription("");
      await refreshList();
      setTab("upcoming");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || "Krijimi dështoi");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteAssignment(id) {
    if (!u || u.role !== "admin") return;
    const ok = confirm("A je i sigurt që do ta fshish këtë detyrë?");
    if (!ok) return;
    const prev = assignments;
    setAssignments(prev.filter(a => a.id !== id));
    try {
      await api.delete(`/assignments/${id}`);
    } catch (e) {
      alert(e?.response?.data?.error || "Fshirja dështoi");
      setAssignments(prev);
    }
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => nav(-1)}
          className="text-violet-600 hover:text-violet-800 flex items-center mb-6 transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Kthehu mbrapa
        </button>
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6 text-center">
          <FiAlertCircle className="text-violet-500 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-violet-800 mb-2">Gabim</h2>
          <p className="text-violet-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Provoni përsëri
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Detyrat</h1>
          <p className="text-gray-600 mt-1">
            Menaxho afatet dhe detyrat sipas lëndës.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full overflow-hidden border border-gray-200">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === "upcoming"
                  ? "bg-violet-600 text-white"
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

          {u?.role === "admin" && (
            <button
              onClick={() => setOpen(true)}
              className="ml-2 inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-xl shadow hover:from-violet-700 hover:to-indigo-700 transition"
            >
              <FiPlus /> Shto Detyrë
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="Kërko titull, përshkrim ose lëndë…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-400" />
          <select
            className="flex-1 border border-gray-200 rounded-xl py-3 px-3 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
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

      <div className="mt-6">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl p-4 bg-white animate-pulse h-40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center bg-white border border-gray-200 rounded-2xl py-16">
            <FiBookOpen className="text-gray-400 text-4xl mx-auto mb-3" />
            <p className="text-gray-500">S'ka detyra sipas filtrave të zgjedhur.</p>
            {(q || courseId) && (
              <button
                onClick={() => {
                  setQ("");
                  setCourseId("");
                }}
                className="mt-4 text-violet-600 hover:text-violet-800 hover:underline"
              >
                Fshini filtrat
              </button>
            )}
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => {
              const due = new Date(a.dueAt);
              const isUpcoming = isAfter(due, new Date());
              const course = coursesById.get(a.courseId);
              return (
                <li
                  key={a.id}
                  className={`group border rounded-2xl p-4 bg-white hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1 ${
                    isUpcoming ? "border-violet-100" : "border-rose-100"
                  }`}
                  onClick={() => nav(`/assignments/${a.id}`)}
                  onKeyDown={(ev) => (ev.key === "Enter" || ev.key === " ") && nav(`/assignments/${a.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                          isUpcoming ? "bg-violet-100 text-violet-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        <FiClock /> {format(due, "dd/MM/yyyy HH:mm")}
                      </div>
                      <h3 className="mt-2 font-semibold text-gray-900 group-hover:text-violet-700 transition line-clamp-2">
                        {a.title}
                      </h3>
                    </div>

                    {u?.role === "admin" && (
                      <button
                        title="Fshi detyrën"
                        onClick={(e) => { e.stopPropagation(); deleteAssignment(a.id); }}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                        aria-label="Fshi detyrën"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>

                  {course && (
                    <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">
                        <FiBookOpen size={12} /> {course.name}{course.code ? ` (${course.code})` : ""}
                      </span>
                    </div>
                  )}

                  {a.description && (
                    <p className="mt-2 text-sm text-gray-700 line-clamp-2">{a.description}</p>
                  )}

                  <div className="mt-3 flex justify-end">
                    <span className="text-xs font-medium text-violet-700 group-hover:text-violet-900 group-hover:underline">
                      Shiko detajet
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <div className="bg-white rounded-2xl w-full max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Krijo Detyrë</h3>
          </div>

          <form onSubmit={createAssignment} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titulli</label>
              <input
                className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="p.sh. Projekt React"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lënda</label>
              <select
                className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                required
              >
                <option value="">Zgjidh lëndën</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Afati</label>
              <input
                type="datetime-local"
                className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Përshkrimi (opsional)</label>
              <textarea
                className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Detajet e detyrës…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-violet-600 text-white px-4 py-3 rounded-lg hover:bg-violet-700 transition duration-300 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Duke krijuar..." : "Krijo Detyrën"}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}