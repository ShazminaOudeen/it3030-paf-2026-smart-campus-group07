// booking/components/BookingStatusBadge.jsx
export default function BookingStatusBadge({ status }) {
  const map = {
    PENDING:   "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    APPROVED:  "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    REJECTED:  "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    CANCELLED: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide
        ${map[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
}