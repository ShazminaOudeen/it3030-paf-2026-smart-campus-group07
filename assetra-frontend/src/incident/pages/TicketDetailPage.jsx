import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import {
  getTicketById, getComments, addComment, updateComment, deleteComment
} from "../api/ticketApi";

const STATUS_CONFIG = {
  OPEN:        { color: "bg-blue-500/15 text-blue-400 border-blue-500/25",         dot: "bg-blue-400",    label: "Open" },
  IN_PROGRESS: { color: "bg-amber-500/15 text-amber-400 border-amber-500/25",      dot: "bg-amber-400",   label: "In Progress" },
  RESOLVED:    { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",dot: "bg-emerald-400", label: "Resolved" },
  CLOSED:      { color: "bg-gray-500/15 text-gray-400 border-gray-500/25",         dot: "bg-gray-400",    label: "Closed" },
  REJECTED:    { color: "bg-red-500/15 text-red-400 border-red-500/25",            dot: "bg-red-400",     label: "Rejected" },
};

const PRIORITY_CONFIG = {
  LOW:      { color: "text-emerald-400", bg: "bg-emerald-500/10" },
  MEDIUM:   { color: "text-amber-400",   bg: "bg-amber-500/10" },
  HIGH:     { color: "text-orange-400",  bg: "bg-orange-500/10" },
  CRITICAL: { color: "text-red-400",     bg: "bg-red-500/10" },
};

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket]           = useState(null);
  const [comments, setComments]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [newComment, setNewComment]   = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [editContent, setEditContent] = useState("");
  const [error, setError]             = useState("");

  useEffect(() => {
    Promise.all([
      getTicketById(id).then(res => setTicket(res.data)),
      getComments(id).then(res => setComments(res.data)),
    ])
      .catch(() => setError("Failed to load ticket"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await addComment(id, newComment.trim(), user.id);
      setComments(prev => [...prev, res.data]);
      setNewComment("");
    } catch { setError("Failed to add comment"); }
    finally { setSubmitting(false); }
  };

  const handleEditSave = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      const res = await updateComment(commentId, editContent.trim(), user.id);
      setComments(prev => prev.map(c => c.id === commentId ? res.data : c));
      setEditingId(null);
    } catch { setError("Failed to update comment"); }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(commentId, user.id);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch { setError("Failed to delete comment"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  if (!ticket) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-gray-400">Ticket not found.</p>
    </div>
  );

  const status   = STATUS_CONFIG[ticket.status]    || STATUS_CONFIG.OPEN;
  const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.MEDIUM;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.3s ease both; }
      `}</style>

      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Tickets
      </button>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Ticket Details */}
      <div className="fade-up p-6 rounded-2xl border border-white/8 bg-white/4 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-white">{ticket.category}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priority.bg} ${priority.color}`}>
                {ticket.priority}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        <p className="text-gray-300 text-sm mb-4">{ticket.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          {ticket.contactDetails && (
            <div className="p-3 rounded-xl bg-white/4 border border-white/8">
              <p className="text-gray-500 text-xs mb-1">Contact</p>
              <p className="text-gray-300">{ticket.contactDetails}</p>
            </div>
          )}
          {ticket.resolutionNotes && (
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-gray-500 text-xs mb-1">Resolution Notes</p>
              <p className="text-emerald-300">{ticket.resolutionNotes}</p>
            </div>
          )}
          {ticket.rejectionReason && (
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
              <p className="text-gray-500 text-xs mb-1">Rejection Reason</p>
              <p className="text-red-300">{ticket.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="fade-up">
        <h2 className="text-lg font-semibold text-white mb-4">
          Comments <span className="text-gray-500 font-normal text-sm">({comments.length})</span>
        </h2>

        {/* Comment list */}
        <div className="space-y-3 mb-6">
          {comments.length === 0 ? (
            <div className="p-6 rounded-2xl border border-white/8 bg-white/4 text-center">
              <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => {
              const isOwner = user?.id === comment.userId;
              return (
                <div key={comment.id} className="p-4 rounded-2xl border border-white/8 bg-white/4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/30
                                      flex items-center justify-center text-orange-400 text-xs font-bold">
                        {comment.userId?.toString().slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                        {comment.updatedAt !== comment.createdAt && (
                          <span className="ml-1 text-gray-600">(edited)</span>
                        )}
                      </span>
                    </div>

                    {/* Edit/Delete — only for comment owner */}
                    {isOwner && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Edit mode */}
                  {editingId === comment.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl border border-white/8 bg-[#0f0f1a]
                                   text-white text-sm placeholder-gray-600
                                   focus:outline-none focus:border-orange-500/50 transition-all resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleEditSave(comment.id)}
                          className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600
                                     text-white text-xs font-semibold transition-all">
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/12
                                     text-gray-400 text-xs font-semibold transition-all">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300 text-sm">{comment.content}</p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add comment */}
        <div className="p-4 rounded-2xl border border-white/8 bg-white/4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-white/8 bg-[#0f0f1a]
                       text-white text-sm placeholder-gray-600
                       focus:outline-none focus:border-orange-500/50 transition-all resize-none mb-3"
          />
          <div className="flex justify-end">
            <button
              onClick={handleAddComment}
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600
                         text-white text-sm font-semibold transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}