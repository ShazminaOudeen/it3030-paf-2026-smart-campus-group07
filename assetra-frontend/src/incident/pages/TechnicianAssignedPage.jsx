import { useEffect, useState } from "react";
import { getAllTickets, updateTicketStatus } from "../api/ticketApi";
import { useAuth } from "../../shared/context/AuthContext";

// ── Inline API helpers (matching your TicketController routes) ──────────────
const API_BASE = "/api/tickets";

async function fetchComments(ticketId) {
  const res = await fetch(`${API_BASE}/${ticketId}/comments`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

async function postComment(ticketId, userId, content) {
  const res = await fetch(`${API_BASE}/${ticketId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-User-Id": userId },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to post comment");
  return res.json();
}

async function deleteCommentApi(commentId, userId) {
  const res = await fetch(`${API_BASE}/comments/${commentId}`, {
    method: "DELETE",
    headers: { "X-User-Id": userId },
  });
  if (!res.ok) throw new Error("Failed to delete comment");
}

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  IN_PROGRESS: { color: "bg-amber-500/15 text-amber-400 border-amber-500/25", dot: "bg-amber-400" },
  RESOLVED:    { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", dot: "bg-emerald-400" },
  CLOSED:      { color: "bg-gray-500/15 text-gray-400 border-gray-500/25", dot: "bg-gray-400" },
  OPEN:        { color: "bg-blue-500/15 text-blue-400 border-blue-500/25", dot: "bg-blue-400" },
};

// ── Comment section component ────────────────────────────────────────────────
function CommentSection({ ticketId, userId }) {
  const [comments, setComments]     = useState([]);
  const [loadingCmts, setLoadingCmts] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting]       = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [expanded, setExpanded]     = useState(false);
  const [error, setError]           = useState("");

  // Load comments when section is expanded
  useEffect(() => {
    if (!expanded) return;
    setLoadingCmts(true);
    fetchComments(ticketId)
      .then(setComments)
      .catch(() => setError("Could not load comments."))
      .finally(() => setLoadingCmts(false));
  }, [expanded, ticketId]);

  const handlePost = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    setError("");
    try {
      const created = await postComment(ticketId, userId, newComment.trim());
      setComments((prev) => [...prev, created]);
      setNewComment("");
    } catch {
      setError("Failed to post comment.");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    setDeletingId(commentId);
    setError("");
    try {
      await deleteCommentApi(commentId, userId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      setError("Failed to delete comment.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-4 border-t border-white/8 pt-4">
      {/* Toggle header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-orange-400 transition-colors mb-3"
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {expanded ? "Hide Comments" : "Show Comments"}
        {!expanded && comments.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px]">
            {comments.length}
          </span>
        )}
      </button>

      {expanded && (
        <div className="space-y-3">
          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Comment list */}
          {loadingCmts ? (
            <div className="flex items-center gap-2 py-3">
              <div className="w-4 h-4 border border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
              <span className="text-xs text-gray-500">Loading comments…</span>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-600 italic py-2">No comments yet. Be the first!</p>
          ) : (
            <ul className="space-y-2">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="flex items-start justify-between gap-3 px-3 py-2.5 rounded-xl
                             bg-white/4 border border-white/6"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-orange-400 mb-0.5 truncate">
                      {c.authorName ?? c.userId ?? "Technician"}
                    </p>
                    <p className="text-sm text-gray-300 break-words">{c.content}</p>
                    {c.createdAt && (
                      <p className="text-[10px] text-gray-600 mt-1">
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Delete — only show for own comments */}
                  {(c.userId === userId || c.authorId === userId) && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deletingId === c.id}
                      title="Delete comment"
                      className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg text-gray-600
                                 hover:text-red-400 hover:bg-red-500/10
                                 transition-all disabled:opacity-40"
                    >
                      {deletingId === c.id ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* New comment input */}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Add a comment…"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handlePost()}
              className="flex-1 px-3 py-2 rounded-xl border border-white/8
                         bg-gray-50 dark:bg-[#0f0f1a]
                         text-sm text-gray-900 dark:text-gray-300
                         placeholder-gray-400 dark:placeholder-gray-600
                         focus:outline-none focus:border-orange-500/40 transition-all"
            />
            <button
              onClick={handlePost}
              disabled={posting || !newComment.trim()}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600
                         text-white text-xs font-semibold shadow-lg shadow-orange-500/20
                         transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed
                         flex items-center gap-1.5"
            >
              {posting ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function TechnicianAssignedPage() {
  const { user } = useAuth();
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [notes, setNotes]       = useState({});
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    getAllTickets()
      .then((res) => setTickets(res.data.filter((t) => t.assignedTo === user.id)))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleStatusUpdate = async (ticketId, status) => {
    setUpdating(ticketId + status);
    try {
      await updateTicketStatus(ticketId, { status, resolutionNotes: notes[ticketId] || "" });
      setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status } : t));
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  if (loading || !user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .ticket-card { animation: fadeUp 0.4s ease both; }
        .ticket-card:nth-child(1){animation-delay:0.05s}
        .ticket-card:nth-child(2){animation-delay:0.1s}
        .ticket-card:nth-child(3){animation-delay:0.15s}
      `}</style>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assigned to Me</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tickets.length} ticket(s) assigned to you</p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-500">No tickets assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
            return (
              <div key={ticket.id}
                className="ticket-card p-5 rounded-2xl border border-white/8 dark:border-white/8
                           bg-white/4 dark:bg-white/4">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">{ticket.category}</span>
                      <span className="text-xs text-orange-400 font-medium">{ticket.priority}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{ticket.description}</p>
                    {ticket.contactDetails && (
                      <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">📞 {ticket.contactDetails}</p>
                    )}
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${status.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>

                {/* Resolution notes */}
                <textarea
                  placeholder="Add resolution notes here..."
                  value={notes[ticket.id] || ""}
                  onChange={(e) => setNotes({ ...notes, [ticket.id]: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-white/8 dark:border-white/8
                             bg-gray-50 dark:bg-[#0f0f1a]
                             text-sm text-gray-900 dark:text-gray-300
                             placeholder-gray-400 dark:placeholder-gray-600
                             resize-none mb-3 focus:outline-none
                             focus:border-orange-500/40 transition-all"
                />

                {/* Status buttons */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { status: "IN_PROGRESS", label: "In Progress",   color: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" },
                    { status: "RESOLVED",    label: "Mark Resolved",  color: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" },
                    { status: "CLOSED",      label: "Close Ticket",   color: "bg-gray-600 hover:bg-gray-700 shadow-gray-500/20" },
                  ].map((btn) => (
                    <button key={btn.status}
                      onClick={() => handleStatusUpdate(ticket.id, btn.status)}
                      disabled={ticket.status === btn.status || updating === ticket.id + btn.status}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold
                                  transition-all hover:scale-105 shadow-lg disabled:opacity-40
                                  disabled:cursor-not-allowed ${btn.color}`}
                    >
                      {updating === ticket.id + btn.status ? (
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      ) : null}
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* ── Comment section (new) ── */}
                <CommentSection ticketId={ticket.id} userId={user.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
