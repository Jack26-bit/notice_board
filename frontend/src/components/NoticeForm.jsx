/**
 * NoticeForm — Modal form for creating/editing notices.
 * Props: notice (null = create mode), onSave, onCancel
 */

import { useState } from "react";

const CATEGORIES = ["General", "Exam", "Event", "Holiday"];
const PRIORITIES = ["Normal", "Urgent"];

export default function NoticeForm({ notice, onSave, onCancel }) {
  const isEdit = !!notice;

  const [form, setForm] = useState({
    title: notice?.title || "",
    body: notice?.body || "",
    category: notice?.category || "General",
    priority: notice?.priority || "Normal",
    is_pinned: notice?.is_pinned || false,
    expires_at: notice?.expires_at ? notice.expires_at.slice(0, 16) : "", // datetime-local format
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };
      await onSave(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{isEdit ? "Edit Notice" : "Create Notice"}</h2>

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            className="form-input"
            type="text"
            maxLength={200}
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="body">Body</label>
          <textarea
            id="body"
            className="form-textarea"
            value={form.body}
            onChange={(e) => handleChange("body", e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              className="form-select"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              className="form-select"
              value={form.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="expires_at">Expires At (optional)</label>
            <input
              id="expires_at"
              className="form-input"
              type="datetime-local"
              value={form.expires_at}
              onChange={(e) => handleChange("expires_at", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Pinned</label>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle ${form.is_pinned ? "active" : ""}`}
                onClick={() => handleChange("is_pinned", !form.is_pinned)}
                aria-label="Toggle pinned"
              />
              <span style={{ fontSize: ".85rem", color: "var(--text-secondary)" }}>
                {form.is_pinned ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
