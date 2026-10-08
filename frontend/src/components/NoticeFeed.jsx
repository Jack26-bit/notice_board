/**
 * NoticeFeed — Public feed with search, category filter, polling, and NEW badges.
 */

import { useState, useEffect, useCallback } from "react";
import { fetchNotices } from "../api";
import NoticeCard from "./NoticeCard";

const CATEGORIES = ["All", "Exam", "Event", "Holiday", "General"];
const POLL_INTERVAL = 30000; // 30 seconds
const LAST_VISIT_KEY = "noticeboard_last_visit";

export default function NoticeFeed() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [lastVisit, setLastVisit] = useState(() => {
    return localStorage.getItem(LAST_VISIT_KEY) || null;
  });

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchNotices({
        category: category === "All" ? "" : category,
        q: search || undefined,
      });
      setNotices(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  // Initial load + polling
  useEffect(() => {
    setLoading(true);
    load();
    const id = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [load]);

  // Save visit timestamp when component mounts
  useEffect(() => {
    const now = new Date().toISOString();
    // Small delay so we can still show NEW badges for a moment
    const timer = setTimeout(() => {
      localStorage.setItem(LAST_VISIT_KEY, now);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const isNew = (notice) => {
    if (!lastVisit) return false;
    return new Date(notice.created_at) > new Date(lastVisit);
  };

  // --- Loading state ---
  if (loading && notices.length === 0) {
    return (
      <div className="container">
        <Filters search={search} setSearch={setSearch} category={category} setCategory={setCategory} />
        <div className="state-container">
          <div className="spinner" />
          <h3>Loading notices…</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Filters search={search} setSearch={setSearch} category={category} setCategory={setCategory} />

      {/* Error state */}
      {error && (
        <div className="state-container">
          <div className="state-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={load} style={{ marginTop: "1rem" }}>
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!error && notices.length === 0 && (
        <div className="state-container">
          <div className="state-icon">📭</div>
          <h3>No notices found</h3>
          <p>
            {search || category !== "All"
              ? "Try adjusting your search or filter."
              : "The notice board is empty right now. Check back soon!"}
          </p>
        </div>
      )}

      {/* Notice list */}
      {notices.map((n) => (
        <NoticeCard key={n.id} notice={n} isNew={isNew(n)} />
      ))}
    </div>
  );
}

/* --- Filter bar sub-component --- */
function Filters({ search, setSearch, category, setCategory }) {
  return (
    <div className="filters-bar">
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          type="text"
          placeholder="Search notices…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="filter-chips">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip ${category === c ? "active" : ""}`}
            data-category={c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
