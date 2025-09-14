import { useEffect, useState } from "react";
import { api, getUser } from "../api";

export default function Events(){
  const [items,setItems]=useState([]);
  const [activeId,setActiveId]=useState(null);
  const [comments,setComments]=useState([]);
  const [text,setText]=useState("");
  const u = getUser();

  function load(){ api.get("/events").then(r=>setItems(r.data)); }
  useEffect(()=>{ load(); },[]);

  async function openComments(id){
    setActiveId(id);
    const { data } = await api.get(`/comments`, { params:{ entityType:"event", entityId:id } });
    setComments(data);
  }

  async function addComment(e){
    e.preventDefault();
    await api.post(`/comments`, { entityType:"event", entityId: activeId, text });
    setText("");
    openComments(activeId);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Events</h1>
      <ul className="space-y-2">
        {items.map(ev => (
          <li key={ev.id} className="p-3 bg-white rounded border">
            <div className="font-medium">{ev.title}</div>
            <div className="text-sm text-slate-600">{new Date(ev.date).toLocaleString()}</div>
            <div className="mt-2">
              <button onClick={()=>openComments(ev.id)} className="px-3 py-1.5 rounded border">Shiko Komentet</button>
            </div>
          </li>
        ))}
      </ul>

      {activeId && (
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">Komentet</h3>
          <ul className="space-y-2 mb-3">
            {comments.map(c => (
              <li key={c._id} className="border rounded p-2">
                <div className="text-sm"><span className="font-medium">{c.authorName}</span> • {new Date(c.createdAt).toLocaleString()}</div>
                <div className="text-sm text-slate-700">{c.text}</div>
              </li>
            ))}
          </ul>
          {u?.role === "student" && (
            <form onSubmit={addComment} className="flex gap-2">
              <input className="flex-1 border rounded p-2" placeholder="Shkruaj koment..." value={text} onChange={e=>setText(e.target.value)} />
              <button className="px-4 py-2 rounded bg-black text-white">Shto</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}