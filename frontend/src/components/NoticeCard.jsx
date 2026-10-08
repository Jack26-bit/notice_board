/**
 * NoticeCard — Displays a single notice with urgent/pinned/new styling.
 * Props: notice, isNew
 */

export default function NoticeCard({ notice, isNew }) {
  const classes = [
    "notice-card",
    notice.priority === "Urgent" ? "urgent" : "",
    notice.is_pinned ? "pinned" : "",
  ].filter(Boolean).join(" ");

  return (
    <article className={classes}>
      <div className="notice-header">
        <h3 className="notice-title">
          {notice.is_pinned && <span className="badge badge-pinned" title="Pinned">📌</span>}
          {notice.title}
          {notice.priority === "Urgent" && <span className="badge badge-urgent">⚡ Urgent</span>}
          {isNew && <span className="badge badge-new">NEW</span>}
        </h3>
      </div>

      <p className="notice-body">{notice.body}</p>

      <div className="notice-meta">
        <span className="badge badge-category" data-category={notice.category}>
          {notice.category}
        </span>
        <span>🕒 {timeAgo(notice.created_at)}</span>
        {notice.expires_at && (
          <span className="badge-expires">⏳ {expiresLabel(notice.expires_at)}</span>
        )}
      </div>
    </article>
  );
}

/* --- Time helpers (no external lib) --- */

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function expiresLabel(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return `expires in ${Math.floor(diff / 60000)}m`;
  if (hours < 24) return `expires in ${hours}h`;
  return `expires in ${Math.floor(hours / 24)}d`;
}
