/**
 * AdminPanel — CRUD interface for managing notices.
 * Shows all notices (including expired), with create/edit/delete.
 * Protected by JWT — parent renders Login if not authenticated.
 */

import { useState, useEffect, useCallback } from "react";
import { fetchNotices, createNotice, updateNotice, deleteNotice } from "../api";
import NoticeForm from "./NoticeForm";

export default function AdminPanel({ onLogout }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);   // null = closed, {} = create, notice = edit
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchNotices({ includeExpired: true, isAdminCall: true });
      setNotices(data);
    } catch (e) {
      if (e.message.includes("401") || e.message.includes("token")) {
        onLogout();
        return;
      }
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (notice) => {
    setEditing(notice);
    setShowForm(true);
  };

  const handleSave = async (data) => {
    if (editing) {
      await updateNotice(editing.id, data);
    } else {
      await createNotice(data);
    }
    setShowForm(false);
    setEditing(null);
    await load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    await deleteNotice(id);
    await load();
  };

  const isExpired = (notice) => {
    if (!notice.expires_at) return false;
    return new Date(notice.expires_at) < new Date();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="container">
      <div className="admin-header">
        <h1>📋 Manage Notices</h1>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button className="btn btn-primary" onClick={handleCreate}>+ New Notice</button>
          <button className="btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      {error && (
        <div className="state-container">
          <div className="state-icon">⚠️</div>
          <h3>Error loading notices</h3>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="state-container"><div className="spinner" /><h3>Loading…</h3></div>
      ) : (
        <>
          {/* Desktop table */}
          <table className="notice-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Pinned</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((n) => (
                <tr key={n.id}>
                  <td style={{ fontWeight: 500 }}>{n.title}</td>
                  <td><span className="badge badge-category" data-category={n.category}>{n.category}</span></td>
                  <td>{n.priority === "Urgent" ? <span className="badge badge-urgent">Urgent</span> : "Normal"}</td>
                  <td>{n.is_pinned ? "📌" : "—"}</td>
                  <td>{formatDate(n.created_at)}</td>
                  <td>{isExpired(n) ? <span className="badge badge-expired">Expired</span> : "Active"}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-sm" onClick={() => handleEdit(n)}>✏️</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(n.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile list */}
          <div className="admin-notice-list">
            {notices.map((n) => (
              <div key={n.id} className={`admin-notice-item ${isExpired(n) ? "is-expired" : ""}`}>
                <div className="admin-notice-info">
                  <h3>
                    {n.is_pinned && "📌 "}
                    {n.title}
                    {n.priority === "Urgent" && <span className="badge badge-urgent" style={{ marginLeft: ".5rem" }}>Urgent</span>}
                  </h3>
                  <div className="admin-meta">
                    <span className="badge badge-category" data-category={n.category}>{n.category}</span>
                    <span>{formatDate(n.created_at)}</span>
                    {isExpired(n) && <span className="badge badge-expired">Expired</span>}
                  </div>
                </div>
                <div className="table-actions">
                  <button className="btn btn-sm" onClick={() => handleEdit(n)}>✏️</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(n.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {notices.length === 0 && (
            <div className="state-container">
              <div className="state-icon">📭</div>
              <h3>No notices yet</h3>
              <p>Click "New Notice" to create your first one.</p>
            </div>
          )}
        </>
      )}

      {showForm && (
        <NoticeForm
          notice={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
