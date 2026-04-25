import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../api/ticketApi";

const CATEGORIES = ["Electrical", "Plumbing", "Equipment", "Network", "Furniture", "Other"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function ReportIssuePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: "",
    description: "",
    priority: "MEDIUM",
    contactDetails: "",
    resourceId: "",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const userId = "00000000-0000-0000-0000-000000000001"; // temp until auth done

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 3) {
      setError("Maximum 3 images allowed");
      return;
    }
    setFiles(selected);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      const ticketBlob = new Blob([JSON.stringify(form)], { type: "application/json" });
      formData.append("ticket", ticketBlob);
      files.forEach((f) => formData.append("files", f));
      await createTicket(formData, userId);
      setSuccess(true);
      setTimeout(() => navigate("/user/maintenance"), 2000);
    } catch (err) {
      setError("Failed to submit ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ticket Submitted!</h2>
        <p className="text-gray-500 dark:text-gray-400">Redirecting to your tickets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Report an Issue</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Describe the problem and we'll assign a technician to fix it.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category *
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe the issue in detail..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority *
          </label>
          <div className="flex gap-2 flex-wrap">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm({ ...form, priority: p })}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                  ${form.priority === p
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-orange-400"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contact Details *
          </label>
          <input
            type="text"
            name="contactDetails"
            value={form.contactDetails}
            onChange={handleChange}
            required
            placeholder="Your phone or email"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Attach Images (max 3)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 dark:text-gray-400
                       file:mr-4 file:py-2 file:px-4 file:rounded-xl
                       file:border-0 file:text-sm file:font-medium
                       file:bg-orange-50 file:text-orange-600
                       hover:file:bg-orange-100 dark:file:bg-orange-900/20
                       dark:file:text-orange-400"
          />
          {files.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">{files.length} file(s) selected</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600
                     text-white font-semibold transition-all disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  );
}