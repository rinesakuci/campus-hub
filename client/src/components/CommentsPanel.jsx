import { useEffect, useState } from "react";
import { api, getUser } from "../api";
import { format } from "date-fns";
import { 
  FiMessageSquare, 
  FiSend, 
  FiUser, 
  FiAlertCircle,
  FiTrash2
} from "react-icons/fi";

export default function CommentsPanel({
  entityType,     // "event" | "assignment"
  entityId,       // number ose string
  allowPost = false,
  className = ""
}) {
  const currentUser = getUser();

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/comments", { params: { entityType, entityId } });
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr("Nuk u ngarkuan komentet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [entityType, entityId]);

  async function addComment(e) {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);
    setErr("");

    const optimistic = {
      _id: "tmp_" + Date.now(),
      userId: currentUser?.id,
      authorName: currentUser?.fullName || "Ju",
      text: text.trim(),
      createdAt: new Date().toISOString(),
      __optimistic: true
    };
    setComments((prev) => [optimistic, ...prev]);

    try {
      await api.post("/comments", {
        entityType,
        entityId: Number(entityId),
        text: text.trim(),
      });
      setText("");
      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || "Shtimi i komentit dështoi.");
      setComments((prev) => prev.filter((c) => c._id !== optimistic._id));
    } finally {
      setPosting(false);
    }
  }

  async function deleteComment(c) {
    setErr("");
    // Vetëm në UI: kontrollo të drejtën
    const canDelete = currentUser && (currentUser.role === "admin" || currentUser.id === c.userId);
    if (!canDelete) return;

    const prev = comments;
    setComments((list) => list.filter((x) => (x._id || x.id) !== (c._id || c.id)));

    try {
      await api.delete(`/comments/${c._id || c.id}`);
    } catch (e) {
      setErr(e?.response?.data?.error || "Fshirja dështoi.");
      setComments(prev); // rikthe listën
    }
  }

  return (
    <section className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          <FiMessageSquare className="text-lg" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Komentet</h2>
        {comments.length > 0 && (
          <span className="bg-blue-100 text-blue-800 text-sm px-2.5 py-0.5 rounded-full">
            {comments.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded mb-1 w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {comments.length > 0 ? (
            <ul className="space-y-4">
              {comments.map((c) => {
                const canDelete = currentUser && (currentUser.role === "admin" || currentUser.id === c.userId);
                const isTmp = c.__optimistic || (typeof c._id === "string" && c._id.startsWith("tmp_"));

                return (
                  <li 
                    key={c._id || c.id} 
                    className={`p-4 rounded-xl border transition-all ${
                      isTmp 
                        ? "border-blue-200 bg-blue-50 animate-pulse" 
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                        <FiUser size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">{c.authorName}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(c.createdAt), "d MMM yyyy 'në' HH:mm")}
                          </span>
                        </div>
                        <div className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                          {c.text}
                        </div>
                      </div>

                      {canDelete && !isTmp && (
                        <button
                          onClick={() => deleteComment(c)}
                          title="Fshi komentin"
                          className="ml-2 p-2 rounded-lg hover:bg-red-50 text-red-600 transition"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-8 border border-dashed border-gray-300 rounded-xl">
              <FiMessageSquare className="text-gray-400 text-3xl mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Ende s'ka komente.</p>
              <p className="text-gray-400 text-xs mt-1">Bëhu i pari që komenton!</p>
            </div>
          )}

          {allowPost && (
            <form onSubmit={addComment} className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                    <FiUser size={14} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {currentUser?.fullName || "Ju"}
                  </span>
                </div>
                
                <textarea
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  placeholder="Shkruaj komentin tuaj këtu..."
                  rows="3"
                  maxLength={500}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={posting}
                />
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${text.length > 450 ? 'text-amber-600' : 'text-gray-500'}`}>
                    {text.length}/500
                  </span>
                  
                  <button
                    type="submit"
                    disabled={posting || !text.trim()}
                    className="inline-flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {posting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Duke dërguar...</span>
                      </>
                    ) : (
                      <>
                        <FiSend size={16} />
                        <span>Posto komentin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {err && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
              <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" />
              <span>{err}</span>
            </div>
          )}
        </>
      )}
    </section>
  );
}
