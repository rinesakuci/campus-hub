import { useEffect, useState } from "react";
import { api } from "../api";

export default function Admin(){
  const [courses,setCourses] = useState([]);
  const [name,setName]=useState("");
  const [code,setCode]=useState("");
  const [description,setDescription]=useState("");

  const [evTitle,setEvTitle]=useState("");
  const [evDate,setEvDate]=useState("");
  const [evCourseId,setEvCourseId]=useState("");

  function load(){ api.get("/courses").then(r=>setCourses(r.data)); }
  useEffect(()=>{ load(); },[]);

  async function createCourse(e){
    e.preventDefault();
    await api.post("/courses", { name, code, description });
    setName(""); setCode(""); setDescription("");
    load();
  }

  async function createEvent(e){
    e.preventDefault();
    await api.post("/events", { title: evTitle, date: evDate, courseId: evCourseId? Number(evCourseId): undefined });
    setEvTitle(""); setEvDate(""); setEvCourseId("");
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold mb-3">Kurse</h2>
        <ul className="space-y-2 mb-4">
          {courses.map(c=> <li key={c.id} className="p-3 bg-white rounded border">{c.name} <span className="text-slate-500">({c.code})</span></li>)}
        </ul>
        <form onSubmit={createCourse} className="bg-white p-4 rounded border grid gap-2 md:grid-cols-3">
          <input className="border p-2 rounded" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="border p-2 rounded" placeholder="Code" value={code} onChange={e=>setCode(e.target.value)} />
          <input className="border p-2 rounded md:col-span-2" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
          <button className="bg-black text-white px-4 py-2 rounded md:col-span-1">Shto Kurs</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Evente</h2>
        <form onSubmit={createEvent} className="bg-white p-4 rounded border grid gap-2 md:grid-cols-3">
          <input className="border p-2 rounded" placeholder="Title" value={evTitle} onChange={e=>setEvTitle(e.target.value)} />
          <input className="border p-2 rounded" type="datetime-local" value={evDate} onChange={e=>setEvDate(e.target.value)} />
          <input className="border p-2 rounded" placeholder="Course ID (ops.)" value={evCourseId} onChange={e=>setEvCourseId(e.target.value)} />
          <button className="bg-black text-white px-4 py-2 rounded md:col-span-1">Shto Event</button>
        </form>
      </section>
    </div>
  );
}