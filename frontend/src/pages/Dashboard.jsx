import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTasks, createTask, updateTask, deleteTask } from '../api/client';
import { useAuth } from '../context/AuthContext';

const S = {
  page: {
    minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Syne', sans-serif", color: '#fff',
  },
  nav: {
    background: '#13131a', borderBottom: '1px solid #1e1e2e',
    padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' },
  logoSpan: { color: '#6366f1' },
  navRight: { display: 'flex', alignItems: 'center', gap: 16 },
  badge: {
    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#a5b4fc', fontFamily: "'Space Mono', monospace",
  },
  adminBadge: {
    background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
    borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#fcd34d', fontFamily: "'Space Mono', monospace",
    textDecoration: 'none', cursor: 'pointer',
  },
  logoutBtn: {
    background: 'transparent', border: '1px solid #27272a', borderRadius: 6,
    padding: '6px 14px', color: '#71717a', fontSize: 13, cursor: 'pointer',
    fontFamily: "'Syne', sans-serif", transition: 'all 0.2s',
  },
  main: { maxWidth: 900, margin: '0 auto', padding: '40px 24px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 800, letterSpacing: '-1px' },
  titleSpan: { color: '#6366f1' },
  statsRow: { display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' },
  statCard: {
    flex: 1, minWidth: 140, background: '#13131a', border: '1px solid #1e1e2e',
    borderRadius: 12, padding: '20px 24px',
  },
  statNum: { fontSize: 32, fontWeight: 800, letterSpacing: '-1px' },
  statLabel: { color: '#52525b', fontSize: 12, fontFamily: "'Space Mono', monospace", marginTop: 4 },
  form: {
    background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 12,
    padding: 24, marginBottom: 32,
  },
  formTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#a1a1aa' },
  formRow: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  input: {
    flex: 2, minWidth: 200, background: '#09090f', border: '1px solid #27272a',
    borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14,
    fontFamily: "'Space Mono', monospace", outline: 'none',
  },
  textarea: {
    flex: 3, minWidth: 200, background: '#09090f', border: '1px solid #27272a',
    borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14,
    fontFamily: "'Space Mono', monospace", outline: 'none', resize: 'none', height: 42,
  },
  select: {
    background: '#09090f', border: '1px solid #27272a', borderRadius: 8,
    padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', cursor: 'pointer',
  },
  addBtn: {
    background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
    fontFamily: "'Syne', sans-serif", whiteSpace: 'nowrap',
  },
  filters: { display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  filterBtn: (active) => ({
    background: active ? '#6366f1' : 'transparent',
    border: `1px solid ${active ? '#6366f1' : '#27272a'}`,
    borderRadius: 6, padding: '6px 14px', color: active ? '#fff' : '#71717a',
    fontSize: 13, cursor: 'pointer', fontFamily: "'Syne', sans-serif", transition: 'all 0.15s',
  }),
  taskCard: {
    background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 12,
    padding: '20px 24px', marginBottom: 12, display: 'flex',
    alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
  },
  taskTitle: { fontSize: 16, fontWeight: 600, marginBottom: 4 },
  taskDesc: { color: '#71717a', fontSize: 13, fontFamily: "'Space Mono', monospace" },
  taskMeta: { display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  tag: (color) => ({
    background: `rgba(${color},0.12)`, border: `1px solid rgba(${color},0.3)`,
    borderRadius: 4, padding: '2px 8px', fontSize: 11,
    color: `rgb(${color})`, fontFamily: "'Space Mono', monospace",
  }),
  taskActions: { display: 'flex', gap: 8, flexShrink: 0 },
  editBtn: {
    background: 'transparent', border: '1px solid #27272a', borderRadius: 6,
    padding: '6px 12px', color: '#a1a1aa', fontSize: 12, cursor: 'pointer', fontFamily: "'Syne', sans-serif",
  },
  deleteBtn: {
    background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6,
    padding: '6px 12px', color: '#f87171', fontSize: 12, cursor: 'pointer', fontFamily: "'Syne', sans-serif",
  },
  empty: {
    textAlign: 'center', padding: '60px 24px', color: '#52525b',
    fontFamily: "'Space Mono', monospace", fontSize: 14,
  },
  toast: (type) => ({
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    background: type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
    border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
    borderRadius: 10, padding: '14px 20px',
    color: type === 'error' ? '#f87171' : '#34d399',
    fontFamily: "'Space Mono', monospace", fontSize: 13, maxWidth: 320,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  }),
};

const STATUS_COLORS = {
  pending: '234,179,8', in_progress: '59,130,246', completed: '16,185,129'
};
const PRIORITY_COLORS = {
  low: '16,185,129', medium: '234,179,8', high: '239,68,68'
};

export default function Dashboard() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter, per_page: 50 } : { per_page: 50 };
      const { data } = await getTasks(params);
      setTasks(data.tasks);
      setTotal(data.total);
    } catch { showToast('Failed to load tasks', 'error'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast('Title is required', 'error'); return; }
    try {
      await createTask(form);
      setForm({ title: '', description: '', priority: 'medium' });
      fetchTasks();
      showToast('Task created!');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to create task', 'error');
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateTask(id, data);
      fetchTasks();
      setEditing(null);
      showToast('Task updated!');
    } catch { showToast('Failed to update task', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      fetchTasks();
      showToast('Task deleted');
    } catch { showToast('Failed to delete task', 'error'); }
  };

  const counts = {
    all: total,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.logo}>Task<span style={S.logoSpan}>Flow</span></div>
        <div style={S.navRight}>
          <span style={S.badge}>@{user?.username}</span>
          {user?.role === 'admin' && (
            <Link to="/admin" style={S.adminBadge}>⚡ Admin Panel</Link>
          )}
          <button style={S.logoutBtn} onClick={() => { logoutUser(); navigate('/login'); }}>
            Sign out
          </button>
        </div>
      </nav>

      <main style={S.main}>
        <div style={S.header}>
          <h1 style={S.title}>My <span style={S.titleSpan}>Tasks</span></h1>
        </div>

        {/* Stats */}
        <div style={S.statsRow}>
          {[
            { label: 'total', num: total, color: '#6366f1' },
            { label: 'pending', num: tasks.filter(t => t.status === 'pending').length, color: '#eab308' },
            { label: 'in progress', num: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
            { label: 'completed', num: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
          ].map(({ label, num, color }) => (
            <div key={label} style={S.statCard}>
              <div style={{ ...S.statNum, color }}>{num}</div>
              <div style={S.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* Create Task Form */}
        <div style={S.form}>
          <div style={S.formTitle}>+ New Task</div>
          <form onSubmit={handleCreate}>
            <div style={S.formRow}>
              <input style={S.input} placeholder="Task title *" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <textarea style={S.textarea} placeholder="Description (optional)" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <select style={S.select} value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
              <button type="submit" style={S.addBtn}>Add Task</button>
            </div>
          </form>
        </div>

        {/* Filters */}
        <div style={S.filters}>
          {['all', 'pending', 'in_progress', 'completed'].map((f) => (
            <button key={f} style={S.filterBtn(filter === f)} onClick={() => setFilter(f)}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Task List */}
        {loading ? (
          <div style={S.empty}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={S.empty}>No tasks yet. Create your first one above ↑</div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} style={S.taskCard}>
              <div style={{ flex: 1 }}>
                {editing === task.id ? (
                  <EditForm task={task} onSave={handleUpdate} onCancel={() => setEditing(null)} />
                ) : (
                  <>
                    <div style={S.taskTitle}>{task.title}</div>
                    {task.description && <div style={S.taskDesc}>{task.description}</div>}
                    <div style={S.taskMeta}>
                      <span style={S.tag(STATUS_COLORS[task.status])}>{task.status.replace('_', ' ')}</span>
                      <span style={S.tag(PRIORITY_COLORS[task.priority])}>{task.priority} priority</span>
                      <span style={{ ...S.tag('161,161,170'), fontSize: 10 }}>
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
              {editing !== task.id && (
                <div style={S.taskActions}>
                  <button style={S.editBtn} onClick={() => setEditing(task.id)}>Edit</button>
                  <button style={S.deleteBtn} onClick={() => handleDelete(task.id)}>Delete</button>
                </div>
              )}
            </div>
          ))
        )}
      </main>

      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
    </div>
  );
}

function EditForm({ task, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: task.title, description: task.description || '',
    status: task.status, priority: task.priority,
  });
  const inputStyle = {
    background: '#09090f', border: '1px solid #27272a', borderRadius: 6,
    padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none',
    fontFamily: "'Space Mono', monospace", width: '100%', marginBottom: 8,
  };
  return (
    <div>
      <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <textarea style={{ ...inputStyle, resize: 'none', height: 60 }} value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <select style={{ ...inputStyle, width: 'auto', marginBottom: 0 }} value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select style={{ ...inputStyle, width: 'auto', marginBottom: 0 }} value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onSave(task.id, form)}
          style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: 13 }}>
          Save
        </button>
        <button onClick={onCancel}
          style={{ background: 'transparent', border: '1px solid #27272a', borderRadius: 6, padding: '6px 14px', color: '#71717a', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: 13 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
