import React, { useEffect, useMemo, useState } from "react";
import { api, getUser } from "../api";
import { format } from "date-fns";
import {
  FiSettings, FiBookOpen, FiCalendar, FiBell, FiPlus, FiTrash2,
  FiEdit2, FiSave, FiX, FiClock, FiMapPin, FiRefreshCw,
  FiUsers, FiUserPlus, FiShield, FiMail, FiKey, FiSearch
} from "react-icons/fi";

export default function Admin() {
  const u = getUser();
  const [tab, setTab] = useState("courses");

  const [courses, setCourses] = useState([]);
  const [courseForm, setCourseForm] = useState({ name: "", code: "", description: "" });
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editingCourse, setEditingCourse] = useState({ name: "", code: "", description: "" });

  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({
    title: "", date: "", time: "", location: "", description: "", courseId: "",
  });
  const [editingEventId, setEditingEventId] = useState(null);
  const [editingEvent, setEditingEvent] = useState({
    title: "", date: "", time: "", location: "", description: "", courseId: "",
  });

  const [notifications, setNotifications] = useState([]);
  const [ntfForm, setNtfForm] = useState({ title: "", message: "" });

  const [users, setUsers] = useState([]);
  const [qInput, setQInput] = useState("");
  const [uSearch, setUSearch] = useState("");
  const [newUser, setNewUser] = useState({ fullName: "", email: "", password: "", role: "student" });
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUser, setEditingUser] = useState({ fullName: "", email: "", role: "student" });

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setUSearch(qInput.trim()), 300);
    return () => clearTimeout(t);
  }, [qInput]);

  function toISO(dateStr, timeStr) {
    if (!dateStr) return null;
    const ts = timeStr ? `${dateStr}T${timeStr}:00` : `${dateStr}T00:00:00`;
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  function resetEventForm() { setEventForm({ title: "", date: "", time: "", location: "", description: "", courseId: "" }); }
  function resetCourseForm() { setCourseForm({ name: "", code: "", description: "" }); }
  function resetNtfForm() { setNtfForm({ title: "", message: "" }); }

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const reqs = [api.get("/courses")];
        if (tab === "events") reqs.push(api.get("/events"));
        if (tab === "notifications") reqs.push(api.get("/notifications"));
        if (tab === "accounts") reqs.push(api.get("/users", { params: { q: uSearch || undefined } }));

        const res = await Promise.all(reqs);
        if (!alive) return;

        setCourses(res[0].data || []);
        if (tab === "events") setEvents(res[1]?.data || []);
        if (tab === "notifications") setNotifications(res[1]?.data || []);
        if (tab === "accounts") setUsers(res[1]?.data || []);
      } catch (e) {
        setErr("Dështoi ngarkimi i të dhënave.");
      } finally {
        alive && setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [tab, uSearch]);

  async function createCourse(e) {
    e.preventDefault();
    setErr("");
    try {
      const { name, code, description } = courseForm;
      if (!name || !code) return setErr("Emri dhe Kodi janë të detyrueshëm.");
      await api.post("/courses", { name, code, description });
      resetCourseForm();
      const { data } = await api.get("/courses");
      setCourses(data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Krijimi i lëndës dështoi.");
    }
  }
  function startEditCourse(c) {
    setEditingCourseId(c.id);
    setEditingCourse({ name: c.name, code: c.code, description: c.description || "" });
  }
  async function saveCourse(e) {
    e.preventDefault();
    if (!editingCourseId) return;
    setErr("");
    try {
      await api.put(`/courses/${editingCourseId}`, editingCourse);
      setEditingCourseId(null);
      const { data } = await api.get("/courses");
      setCourses(data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Përditësimi i lëndës dështoi.");
    }
  }
  async function deleteCourse(id) {
    if (!confirm("Fshi këtë lëndë?")) return;
    setErr("");
    try {
      await api.delete(`/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setErr(e?.response?.data?.error || "Fshirja e lëndës dështoi.");
    }
  }

  async function createEvent(e) {
    e.preventDefault();
    setErr("");
    const iso = toISO(eventForm.date, eventForm.time);
    if (!eventForm.title || !iso) return setErr("Titulli dhe Data/Koha janë të detyrueshme.");
    try {
      const body = {
        title: eventForm.title,
        description: eventForm.description || undefined,
        date: iso,
        location: eventForm.location || undefined,
        courseId: eventForm.courseId ? Number(eventForm.courseId) : undefined,
      };
      await api.post("/events", body);
      resetEventForm();
      const { data } = await api.get("/events");
      setEvents(data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Krijimi i ngjarjes dështoi.");
    }
  }
  function startEditEvent(ev) {
    const d = new Date(ev.date);
    const date = d.toISOString().slice(0, 10);
    const time = d.toTimeString().slice(0, 5);
    setEditingEventId(ev.id);
    setEditingEvent({
      title: ev.title,
      description: ev.description || "",
      date,
      time,
      location: ev.location || "",
      courseId: ev.courseId ? String(ev.courseId) : "",
    });
  }
  async function saveEvent(e) {
    e.preventDefault();
    if (!editingEventId) return;
    setErr("");
    const iso = toISO(editingEvent.date, editingEvent.time);
    if (!editingEvent.title || !iso) return setErr("Titulli dhe Data/Koha janë të detyrueshme.");
    try {
      const body = {
        title: editingEvent.title,
        description: editingEvent.description || undefined,
        date: iso,
        location: editingEvent.location || undefined,
        courseId: editingEvent.courseId ? Number(editingEvent.courseId) : null,
      };
      await api.put(`/events/${editingEventId}`, body);
      setEditingEventId(null);
      const { data } = await api.get("/events");
      setEvents(data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Përditësimi i ngjarjes dështoi.");
    }
  }
  async function deleteEvent(id) {
    if (!confirm("Fshi këtë ngjarje?")) return;
    setErr("");
    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      setErr(e?.response?.data?.error || "Fshirja e ngjarjes dështoi.");
    }
  }

  async function createNotification(e) {
    e.preventDefault();
    setErr("");
    try {
      const body = {
        title: ntfForm.title.trim(),
        message: ntfForm.message.trim(),
      };
      if (!body.title || !body.message) {
        setErr("Titulli dhe Mesazhi janë të detyrueshëm.");
        return;
      }
      await api.post("/notifications", body);
      resetNtfForm();
      const { data } = await api.get("/notifications");
      setNotifications(data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Krijimi i njoftimit dështoi.");
    }
  }
  async function deleteNotification(id) {
    if (!confirm("Fshi këtë njoftim?")) return;
    setErr("");
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => (n._id || n.id) !== id));
    } catch (e) {
      setErr(e?.response?.data?.error || "Fshirja e njoftimit dështoi.");
    }
  }

  async function createUser(e) {
    e.preventDefault();
    setErr("");
    try {
      const body = {
        fullName: newUser.fullName.trim(),
        email: newUser.email.trim(),
        password: newUser.password.trim(),
        role: newUser.role,
      };
      if (!body.fullName || !body.email || !body.password) {
        setErr("Emri, email dhe fjalëkalimi kërkohen.");
        return;
      }
      await api.post("/users", body);
      setNewUser({ fullName: "", email: "", password: "", role: "student" });
      const { data } = await api.get("/users", { params: { q: uSearch || undefined } });
      setUsers(data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Krijimi i përdoruesit dështoi.");
    }
  }
  function startEditUser(usr) {
    setEditingUserId(usr.id);
    setEditingUser({ fullName: usr.fullName, email: usr.email, role: usr.role });
  }
  async function saveUser(e) {
    e.preventDefault();
    if (!editingUserId) return;
    setErr("");
    try {
      await api.put(`/users/${editingUserId}`, editingUser);
      setEditingUserId(null);
      const { data } = await api.get("/users", { params: { q: uSearch || undefined } });
      setUsers(data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Përditësimi dështoi.");
    }
  }
  async function resetPassword(id) {
    const pw = prompt("Shkruaj fjalëkalimin e ri:");
    if (!pw) return;
    try {
      await api.patch(`/users/${id}/password`, { password: pw });
      alert("Fjalëkalimi u ndryshua.");
    } catch (e) {
      alert(e?.response?.data?.error || "Ndryshimi i fjalëkalimit dështoi.");
    }
  }
  async function deleteUser(id) {
    if (!confirm("Fshi këtë përdorues?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(x => x.id !== id));
    } catch (e) {
      setErr(e?.response?.data?.error || "Fshirja dështoi.");
    }
  }

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return (events || [])
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .filter((e) => new Date(e.date) >= now);
  }, [events]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <header className="rounded-2xl p-6 bg-gradient-to-r from-slate-900 to-indigo-700 text-white shadow">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-xl"><FiSettings className="text-2xl" /></div>
          <div>
            <h1 className="text-2xl font-bold">Paneli i Administratorit</h1>
            <p className="text-white/80 text-sm">Mirë se erdhe, {u?.fullName}. Menaxho lëndët, provimet & konsultimet, njoftimet dhe accountet.</p>
          </div>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        <TabButton active={tab==="courses"} onClick={()=>setTab("courses")} icon={<FiBookOpen/>}>Lëndët</TabButton>
        <TabButton active={tab==="events"} onClick={()=>setTab("events")} icon={<FiCalendar/>}>Provime & Konsultime</TabButton>
        <TabButton active={tab==="notifications"} onClick={()=>setTab("notifications")} icon={<FiBell/>}>Njoftime</TabButton>
        <TabButton active={tab==="accounts"} onClick={()=>setTab("accounts")} icon={<FiUsers/>}>Accountet</TabButton>
        <button
          onClick={()=>window.location.reload()}
          className="ml-auto inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border hover:bg-slate-50"
          title="Rifresko"
        >
          <FiRefreshCw/> Rifresko
        </button>
      </div>

      {err && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {err}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_,i)=> <div key={i} className="h-40 rounded-2xl border bg-white animate-pulse"/>)}
          </div>
        ) : (
          <>
            {tab === "courses" && (
              <section className="grid gap-6 md:grid-cols-2">
                <Card title="Krijo Lëndë" icon={<FiPlus/>}>
                  <form onSubmit={createCourse} className="grid gap-3">
                    <input className="border rounded-lg px-3 py-2" placeholder="Emri i Lëndës" value={courseForm.name} onChange={e=>setCourseForm({...courseForm, name:e.target.value})}/>
                    <input className="border rounded-lg px-3 py-2" placeholder="Kodi p.sh. PR101" value={courseForm.code} onChange={e=>setCourseForm({...courseForm, code:e.target.value})}/>
                    <textarea className="border rounded-lg px-3 py-2" placeholder="Përshkrimi (opsional)" value={courseForm.description} onChange={e=>setCourseForm({...courseForm, description:e.target.value})}/>
                    <div className="flex justify-end">
                      <button className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"><FiPlus/> Krijo</button>
                    </div>
                  </form>
                </Card>

                <Card title="Lista e Lëndëve" icon={<FiBookOpen/>}>
                  {courses.length === 0 ? (
                    <Empty msg="S’ka lëndë." />
                  ) : (
                    <div className="max-h-96 overflow-y-auto pr-1">
                      <ul className="divide-y">
                        {courses.map(c => (
                          <li key={c.id} className="py-3">
                            {editingCourseId === c.id ? (
                              <form onSubmit={saveCourse} className="grid gap-2">
                                <input className="border rounded px-3 py-2" value={editingCourse.name} onChange={e=>setEditingCourse({...editingCourse,name:e.target.value})}/>
                                <input className="border rounded px-3 py-2" value={editingCourse.code} onChange={e=>setEditingCourse({...editingCourse,code:e.target.value})}/>
                                <textarea className="border rounded px-3 py-2" value={editingCourse.description} onChange={e=>setEditingCourse({...editingCourse,description:e.target.value})}/>
                                <div className="flex gap-2 justify-end">
                                  <button className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700"><FiSave/> Ruaj</button>
                                  <button type="button" onClick={()=>setEditingCourseId(null)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border"><FiX/> Anulo</button>
                                </div>
                              </form>
                            ) : (
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-semibold">{c.name}</div>
                                  <div className="text-xs text-slate-500">{c.code}</div>
                                  {c.description && <div className="text-sm text-slate-700 mt-1">{c.description}</div>}
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={()=>startEditCourse(c)} className="p-2 rounded-lg border hover:bg-slate-50" title="Edito"><FiEdit2/></button>
                                  <button onClick={()=>deleteCourse(c.id)} className="p-2 rounded-lg border hover:bg-red-50 text-red-600" title="Fshi"><FiTrash2/></button>
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </section>
            )}

            {tab === "events" && (
              <section className="grid gap-6 md:grid-cols-2">
                <Card title="Shto Provim/Konsultim" icon={<FiPlus/>}>
                  <form onSubmit={createEvent} className="grid gap-3">
                    <input className="border rounded-lg px-3 py-2" placeholder="Titulli" value={eventForm.title} onChange={e=>setEventForm({...eventForm, title:e.target.value})}/>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="date" className="border rounded-lg px-3 py-2" value={eventForm.date} onChange={e=>setEventForm({...eventForm, date:e.target.value})}/>
                      <input type="time" className="border rounded-lg px-3 py-2" value={eventForm.time} onChange={e=>setEventForm({...eventForm, time:e.target.value})}/>
                    </div>
                    <input className="border rounded-lg px-3 py-2" placeholder="Lokacioni (ops.)" value={eventForm.location} onChange={e=>setEventForm({...eventForm, location:e.target.value})}/>
                    <select className="border rounded-lg px-3 py-2" value={eventForm.courseId} onChange={e=>setEventForm({...eventForm, courseId:e.target.value})}>
                      <option value="">— Pa lëndë —</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                    </select>
                    <textarea className="border rounded-lg px-3 py-2" placeholder="Përshkrimi (ops.)" value={eventForm.description} onChange={e=>setEventForm({...eventForm, description:e.target.value})}/>
                    <div className="flex justify-end">
                      <button className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"><FiPlus/> Shto</button>
                    </div>
                  </form>
                </Card>

                <Card title="Aktive (të ardhshme)" icon={<FiCalendar/>}>
                  {upcomingEvents.length === 0 ? (
                    <Empty msg="S’ka ngjarje të ardhshme." />
                  ) : (
                    <div className="max-h-96 overflow-y-auto pr-1">
                      <ul className="divide-y">
                        {upcomingEvents.map(e => {
                          const d = new Date(e.date);
                          const course = courses.find(c => c.id === e.courseId);
                          return (
                            <li key={e.id} className="py-3">
                              {editingEventId === e.id ? (
                                <form onSubmit={saveEvent} className="grid gap-2">
                                  <input className="border rounded px-3 py-2" value={editingEvent.title} onChange={ev=>setEditingEvent({...editingEvent, title: ev.target.value})}/>
                                  <div className="grid grid-cols-2 gap-2">
                                    <input type="date" className="border rounded px-3 py-2" value={editingEvent.date} onChange={ev=>setEditingEvent({...editingEvent, date: ev.target.value})}/>
                                    <input type="time" className="border rounded px-3 py-2" value={editingEvent.time} onChange={ev=>setEditingEvent({...editingEvent, time: ev.target.value})}/>
                                  </div>
                                  <input className="border rounded px-3 py-2" placeholder="Lokacion" value={editingEvent.location} onChange={ev=>setEditingEvent({...editingEvent, location: ev.target.value})}/>
                                  <select className="border rounded px-3 py-2" value={editingEvent.courseId} onChange={ev=>setEditingEvent({...editingEvent, courseId: ev.target.value})}>
                                    <option value="">— Pa lëndë —</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                                  </select>
                                  <textarea className="border rounded px-3 py-2" placeholder="Përshkrimi" value={editingEvent.description} onChange={ev=>setEditingEvent({...editingEvent, description: ev.target.value})}/>
                                  <div className="flex gap-2 justify-end">
                                    <button className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700"><FiSave/> Ruaj</button>
                                    <button type="button" onClick={()=>setEditingEventId(null)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border"><FiX/> Anulo</button>
                                  </div>
                                </form>
                              ) : (
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="font-semibold">{e.title}</div>
                                    <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap gap-3">
                                      <span className="inline-flex items-center gap-1"><FiClock/>{format(d,"MMM d, yyyy HH:mm")}</span>
                                      {e.location && <span className="inline-flex items-center gap-1"><FiMapPin/>{e.location}</span>}
                                    </div>
                                    {(course?.name || course?.code) && (
                                      <div className="text-xs text-indigo-700 bg-indigo-50 inline-flex items-center gap-1 px-2 py-0.5 rounded mt-2">
                                        <FiBookOpen/>{course.name}{course.code?` (${course.code})`:""}
                                      </div>
                                    )}
                                    {e.description && <div className="text-sm text-slate-700 mt-2">{e.description}</div>}
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={()=>startEditEvent(e)} className="p-2 rounded-lg border hover:bg-slate-50" title="Edito"><FiEdit2/></button>
                                    <button onClick={()=>deleteEvent(e.id)} className="p-2 rounded-lg border hover:bg-red-50 text-red-600" title="Fshi"><FiTrash2/></button>
                                  </div>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </Card>
              </section>
            )}

            {tab === "notifications" && (
              <section className="grid gap-6 md:grid-cols-2">
                <Card title="Krijo Njoftim" icon={<FiPlus/>}>
                  <form onSubmit={createNotification} className="grid gap-3">
                    <input className="border rounded-lg px-3 py-2" placeholder="Titulli" value={ntfForm.title} onChange={e=>setNtfForm({...ntfForm, title:e.target.value})}/>
                    <input className="border rounded-lg px-3 py-2" placeholder="Mesazhi" value={ntfForm.message} onChange={e=>setNtfForm({...ntfForm, message:e.target.value})}/>
                    <div className="flex justify-end">
                      <button className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"><FiPlus/> Publiko</button>
                    </div>
                  </form>
                </Card>

                <Card title="Lista e Njoftimeve" icon={<FiBell/>}>
                  {notifications.length === 0 ? (
                    <Empty msg="S’ka njoftime." />
                  ) : (
                    <div className="max-h-96 overflow-y-auto pr-1">
                      <ul className="divide-y">
                        {notifications.map(n => (
                          <li key={n._id || n.id} className="py-3 flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold">{n.title}</div>
                              <div className="text-sm text-slate-700">{n.message}</div>
                              <div className="text-xs text-slate-500 mt-1">
                                {format(new Date(n.createdAt), "MMM d, yyyy HH:mm")}
                              </div>
                            </div>
                            <button onClick={()=>deleteNotification(n._id || n.id)} className="p-2 rounded-lg border hover:bg-red-50 text-red-600" title="Fshi">
                              <FiTrash2/>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </section>
            )}

            {tab === "accounts" && (
              <section className="grid gap-6 md:grid-cols-2">
                <Card title="Shto Përdorues" icon={<FiUserPlus/>}>
                  <form onSubmit={createUser} className="grid gap-3">
                    <input
                      className="border rounded-lg px-3 py-2"
                      placeholder="Emri i plotë"
                      value={newUser.fullName}
                      onChange={e=>setNewUser({...newUser, fullName: e.target.value})}
                    />
                    <input
                      className="border rounded-lg px-3 py-2"
                      type="email"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={e=>setNewUser({...newUser, email: e.target.value})}
                    />
                    <input
                      className="border rounded-lg px-3 py-2"
                      type="password"
                      placeholder="Fjalëkalim i përkohshëm"
                      value={newUser.password}
                      onChange={e=>setNewUser({...newUser, password: e.target.value})}
                    />
                    <select
                      className="border rounded-lg px-3 py-2"
                      value={newUser.role}
                      onChange={e=>setNewUser({...newUser, role: e.target.value})}
                    >
                      <option value="student">student</option>
                      <option value="admin">admin</option>
                    </select>
                    <div className="flex justify-end">
                      <button className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                        <FiPlus/> Krijo
                      </button>
                    </div>
                  </form>
                </Card>

                <Card title="Lista e Përdoruesve" icon={<FiUsers/>}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="relative flex-1">
                      <FiSearch className="absolute left-3 top-3 text-gray-400" />
                      <input
                        className="w-full pl-10 pr-3 py-2 border rounded-lg"
                        placeholder="Kërko emër ose email…"
                        value={qInput}
                        onChange={e=>setQInput(e.target.value)}
                      />
                    </div>
                  </div>

                  {users.length === 0 ? (
                    <Empty msg="S’ka përdorues." />
                  ) : (
                    <div className="max-h-96 overflow-y-auto pr-1">
                      <ul className="divide-y">
                        {users.map(usr => (
                          <li key={usr.id} className="py-3">
                            {editingUserId === usr.id ? (
                              <form onSubmit={saveUser} className="grid gap-2">
                                <input
                                  className="border rounded px-3 py-2"
                                  value={editingUser.fullName}
                                  onChange={e=>setEditingUser({...editingUser, fullName: e.target.value})}
                                />
                                <input
                                  className="border rounded px-3 py-2"
                                  type="email"
                                  value={editingUser.email}
                                  onChange={e=>setEditingUser({...editingUser, email: e.target.value})}
                                />
                                <select
                                  className="border rounded px-3 py-2"
                                  value={editingUser.role}
                                  onChange={e=>setEditingUser({...editingUser, role: e.target.value})}
                                >
                                  <option value="student">student</option>
                                  <option value="admin">admin</option>
                                </select>
                                <div className="flex gap-2 justify-end">
                                  <button className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700">
                                    <FiSave/> Ruaj
                                  </button>
                                  <button type="button" onClick={()=>setEditingUserId(null)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border">
                                    <FiX/> Anulo
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-semibold">{usr.fullName}</div>
                                  <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <FiMail/>{usr.email} • <FiShield/>{usr.role}
                                  </div>
                                  
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={()=>startEditUser(usr)}
                                    className="p-2 rounded-lg border hover:bg-slate-50" title="Edito"
                                  >
                                    <FiEdit2/>
                                  </button>
                                  <button
                                    onClick={()=>resetPassword(usr.id)}
                                    className="p-2 rounded-lg border hover:bg-slate-50" title="Reset fjalëkalimi"
                                  >
                                    <FiKey/>
                                  </button>
                                  <button
                                    onClick={()=>deleteUser(usr.id)}
                                    className="p-2 rounded-lg border hover:bg-red-50 text-red-600" title="Fshi"
                                  >
                                    <FiTrash2/>
                                  </button>
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
        active ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-50"
      }`}
    >
      {icon}{children}
    </button>
  );
}

function Card({ title, icon, children }) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-slate-100 text-slate-700">{icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Empty({ msg }) {
  return (
    <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">{msg}</div>
  );
}