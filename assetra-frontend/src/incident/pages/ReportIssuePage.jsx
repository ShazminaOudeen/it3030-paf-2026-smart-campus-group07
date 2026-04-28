
//assetra-frontend/src/incident/pages/ReportIssuePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../api/ticketApi";
import { useAuth } from "../../shared/context/AuthContext";

const CATEGORIES = ["Electrical", "Plumbing", "Equipment", "Network", "Furniture", "Other"];
const PRIORITIES = [
  { value: "LOW", color: "from-emerald-500 to-teal-500", bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
  { value: "MEDIUM", color: "from-amber-500 to-yellow-500", bg: "bg-amber-500/10 border-amber-500/30 text-amber-400" },
  { value: "HIGH", color: "from-orange-500 to-red-500", bg: "bg-orange-500/10 border-orange-500/30 text-orange-400" },
  { value: "CRITICAL", color: "from-red-500 to-rose-600", bg: "bg-red-500/10 border-red-500/30 text-red-400" },
];

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // ← FIXED
  const [form, setForm] = useState({
    category: "",
    description: "",
    priority: "MEDIUM",
    contactDetails: "",
    resourceId: "",
  });
  const [resources, setResources] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetch("http://localhost:8082/api/resources")
      .then((res) => res.json())
      .then((data) => setResources(Array.isArray(data) ? data : []))
      .catch(() => setResources([]));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 3) { setError("Maximum 3 images allowed"); return; }
    setFiles(selected);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) { setError("You must be logged in to submit a ticket."); return; }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      const ticketBlob = new Blob([JSON.stringify(form)], { type: "application/json" });
      formData.append("ticket", ticketBlob);
      files.forEach((f) => formData.append("files", f));
      await createTicket(formData, user.id); // ← FIXED
      setSuccess(true);
      setTimeout(() => navigate("/user/maintenance"), 2500);
    } catch {
      setError("Failed to submit ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <style>{`
          @keyframes successPop { 0%{transform:scale(0) rotate(-180deg);opacity:0} 60%{transform:scale(1.2) rotate(10deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
          @keyframes ripple { 0%{transform:scale(0);opacity:0.6} 100%{transform:scale(3);opacity:0} }
          .success-icon { animation: successPop 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }
          .ripple { animation: ripple 1.5s ease-out infinite; }
          .ripple2 { animation: ripple 1.5s ease-out 0.5s infinite; }
        `}</style>
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 ripple" />
          <div className="absolute w-24 h-24 rounded-full bg-emerald-500/10 ripple2" />
          <div className="success-icon w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Ticket Submitted!</h2>
        <p className="text-gray-400 mb-1">Your issue has been reported successfully.</p>
        <p className="text-gray-500 text-sm">Redirecting to your tickets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .fade-up { animation: fadeSlideUp 0.5s ease forwards; }
        .fade-up-1 { animation: fadeSlideUp 0.5s ease 0.05s both; }
        .fade-up-2 { animation: fadeSlideUp 0.5s ease 0.1s both; }
        .fade-up-3 { animation: fadeSlideUp 0.5s ease 0.15s both; }
        .fade-up-4 { animation: fadeSlideUp 0.5s ease 0.2s both; }
        .fade-up-5 { animation: fadeSlideUp 0.5s ease 0.25s both; }
        .fade-up-6 { animation: fadeSlideUp 0.5s ease 0.3s both; }
        .shimmer-btn {
          background: linear-gradient(90deg, #f97316, #fb923c, #f97316);
          background-size: 200% auto;
          animation: shimmer 2s linear infinite;
        }
        .input-field {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: white;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: rgba(249,115,22,0.5);
          background: rgba(249,115,22,0.05);
          box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
        }
        .input-field::placeholder { color: rgba(255,255,255,0.25); }
        .input-field option { background: #1a1a2e; color: white; }
      `}</style>

      <div className="fade-up mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Report an Issue</h1>
            <p className="text-gray-400 text-sm">Describe the problem and we'll get it fixed</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500
              ${step >= s ? "bg-orange-500" : "bg-white/10"}`} />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="fade-up-1">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Affected Resource <span className="text-gray-500 ml-1">(optional)</span>
          </label>
          <select name="resourceId" value={form.resourceId}
            onChange={(e) => { handleChange(e); setStep(Math.max(step, 2)); }}
            className="input-field"
          >
            <option value="">Select a resource (lab, room, equipment...)</option>
            {resources.length > 0 ? (
              resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.type} {r.location ? `(${r.location})` : ""}
                </option>
              ))
            ) : (
              <option disabled value="">No resources available yet</option>
            )}
          </select>
          <p className="text-xs text-gray-600 mt-1">Select the lab, room, or equipment that has the issue</p>
        </div>

        <div className="fade-up-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} type="button"
                onClick={() => { setForm({ ...form, category: c }); setStep(Math.max(step, 2)); }}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all duration-200
                  ${form.category === c
                    ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/25"
                    : "bg-white/4 border-white/8 text-gray-400 hover:border-orange-500/40 hover:text-orange-400 hover:bg-orange-500/5"
                  }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="fade-up-3">
          <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
          <textarea name="description" value={form.description}
            onChange={(e) => { handleChange(e); setStep(Math.max(step, 2)); }}
            required rows={4}
            placeholder="Describe the issue in detail — what happened, when it started..."
            className="input-field resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{form.description.length} characters</p>
        </div>

        <div className="fade-up-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Priority *</label>
          <div className="grid grid-cols-4 gap-2">
            {PRIORITIES.map((p) => (
              <button key={p.value} type="button"
                onClick={() => setForm({ ...form, priority: p.value })}
                className={`py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200
                  ${form.priority === p.value
                    ? `bg-gradient-to-r ${p.color} text-white border-transparent shadow-lg`
                    : `${p.bg} border hover:scale-105`
                  }`}>
                {p.value}
              </button>
            ))}
          </div>
        </div>

        <div className="fade-up-5">
          <label className="block text-sm font-medium text-gray-300 mb-2">Contact Details *</label>
          <input type="text" name="contactDetails" value={form.contactDetails}
            onChange={(e) => { handleChange(e); setStep(Math.max(step, 3)); }}
            required placeholder="Your phone number or email address"
            className="input-field"
          />
        </div>

        <div className="fade-up-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Attach Evidence <span className="text-gray-500">(max 3 images)</span>
          </label>
          <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl
                            border-2 border-dashed border-white/10 cursor-pointer
                            hover:border-orange-500/40 hover:bg-orange-500/5
                            transition-all duration-200 group">
            <svg className="w-8 h-8 text-gray-500 group-hover:text-orange-400 mb-2 transition-colors"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-500 group-hover:text-gray-400">
              {files.length > 0 ? `${files.length} file(s) selected ✓` : "Click to upload images"}
            </span>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-xl text-white font-semibold text-sm
                     shimmer-btn shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40
                     hover:scale-[1.02] active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting...
            </span>
          ) : "Submit Ticket →"}
        </button>
      </form>
    </div>
  );
}