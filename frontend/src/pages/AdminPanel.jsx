import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, getAllUsers, changeUserRole } from '../api/client';
import { useAuth } from '../context/AuthContext';

const S = {
  page: { minHeight: '100vh', background: '#0a0a0f', fontFamily: "'Syne', sans-serif", color: '#fff' },
  nav: {
    background: '#13131a', borderBottom: '1px solid #1e1e2e',
    padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: { fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' },
  logoSpan: { color: '#f59e0b' },
  backBtn: {
  background: 'transparent',
  border: '1px solid #27272a',
  borderRadius: 6,
  padding: '6px 14px',
  color: '#71717a',
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: "'Syne', sans-serif",
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center'
},
  main: { maxWidth: 900, margin: '0 auto', padding: '40px 24px' },
  title: { fontSize: 32, fontWeight: 800, letterSpacing: '-1px', marginBottom: 32 },
  titleSpan: { color: '#f59e0b' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 40 },
  statCard: { background: '#13131a', border: '1px solid #1e1e2e', borderRadius: 12, padding: '20px 24px' },
  statNum: { fontSize: 36, fontWeight: 800, letterSpacing: '-1px' },
  statLabel: { color: '#52525b', fontSize: 12, fontFamily: "'Space Mono', monospace", marginTop: 4 },
  section: { marginBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#a1a1aa', marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#09090f', padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#52525b', fontFamily: "'Space Mono', monospace", letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1px solid #1e1e2e' },
  td: { padding: '14px 16px', borderBottom: '1px solid #1e1e2e', fontSize: 14 },
  badge: (color) => ({
    background: `rgba(${color},0.12)`, border: `1px solid rgba(${color},0.3)`,
    borderRadius: 4, padding: '2px 8px', fontSize: 11, color: `rgb(${color})`,
    fontFamily: "'Space Mono', monospace",
  }),
  roleBtn: (role) => ({
    background: role === 'admin' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
    border: `1px solid ${role === 'admin' ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)'}`,
    borderRadius: 6, padding: '4px 12px', color: role === 'admin' ? '#fcd34d' : '#a5b4fc',
    fontSize: 12, cursor: 'pointer', fontFamily: "'Syne', sans-serif",
  }),
};

export default function AdminPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    Promise.all([getAdminStats(), getAllUsers()]).then(([s, u]) => {
      setStats(s.data);
      setUsers(u.data);
    }).catch(() => showToast('Failed to load admin data', 'error'));
  }, []);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await changeUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showToast(`Role changed to ${newRole}`);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to change role', 'error');
    }
  };

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <div style={S.logo}>Task<span style={S.logoSpan}>Flow</span> <span style={{ color: '#52525b', fontSize: 14 }}>/ Admin</span></div>
        <Link to="/dashboard" style={{ ...S.backBtn, textDecoration: 'none', color: '#71717a', border: '1px solid #27272a', borderRadius: 6, padding: '6px 14px', fontSize: 13 }}>
          ← Dashboard
        </Link>
      </nav>

      <main style={S.main}>
        <h1 style={S.title}><span style={S.titleSpan}>Admin</span> Panel</h1>

        {stats && (
          <div style={S.statsGrid}>
            <div style={S.statCard}><div style={{ ...S.statNum, color: '#6366f1' }}>{stats.users.total}</div><div style={S.statLabel}>total users</div></div>
            <div style={S.statCard}><div style={{ ...S.statNum, color: '#10b981' }}>{stats.users.active}</div><div style={S.statLabel}>active users</div></div>
            <div style={S.statCard}><div style={{ ...S.statNum, color: '#3b82f6' }}>{stats.tasks.total}</div><div style={S.statLabel}>total tasks</div></div>
            <div style={S.statCard}><div style={{ ...S.statNum, color: '#eab308' }}>{stats.tasks.pending}</div><div style={S.statLabel}>pending</div></div>
            <div style={S.statCard}><div style={{ ...S.statNum, color: '#f59e0b' }}>{stats.tasks.in_progress}</div><div style={S.statLabel}>in progress</div></div>
            <div style={S.statCard}><div style={{ ...S.statNum, color: '#10b981' }}>{stats.tasks.completed}</div><div style={S.statLabel}>completed</div></div>
          </div>
        )}

        <div style={S.section}>
          <div style={S.sectionTitle}>User Management</div>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>ID</th>
                <th style={S.th}>Username</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>Role</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ ...S.td, color: '#52525b', fontFamily: "'Space Mono', monospace" }}>#{u.id}</td>
                  <td style={S.td}>{u.username} {u.id === user?.id && <span style={{ color: '#52525b', fontSize: 11 }}>(you)</span>}</td>
                  <td style={{ ...S.td, fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#a1a1aa' }}>{u.email}</td>
                  <td style={S.td}>
                    <span style={S.badge(u.role === 'admin' ? '245,158,11' : '99,102,241')}>{u.role}</span>
                  </td>
                  <td style={S.td}>
                    <span style={S.badge(u.is_active ? '16,185,129' : '239,68,68')}>
                      {u.is_active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td style={S.td}>
                    {u.id !== user?.id && (
                      <button style={S.roleBtn(u.role === 'admin' ? 'user' : 'admin')}
                        onClick={() => toggleRole(u.id, u.role)}>
                        → Make {u.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'}`,
          borderRadius: 10, padding: '14px 20px',
          color: toast.type === 'error' ? '#f87171' : '#34d399',
          fontFamily: "'Space Mono', monospace", fontSize: 13,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
