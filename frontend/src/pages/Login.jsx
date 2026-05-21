import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/client';
import { useAuth } from '../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: #0a0a0f; }

  .page {
    min-height: 100vh;
    background: #0a0a0f;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .page::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
    top: -200px; right: -200px;
    pointer-events: none;
  }

  .page::after {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%);
    bottom: -100px; left: -100px;
    pointer-events: none;
  }

  .card {
    background: #13131a;
    border: 1px solid #1e1e2e;
    border-radius: 16px;
    padding: 48px;
    width: 100%;
    max-width: 420px;
    position: relative;
    z-index: 1;
    box-shadow: 0 24px 80px rgba(0,0,0,0.5);
  }

  .logo {
    font-size: 28px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 8px;
    letter-spacing: -1px;
  }

  .logo span { color: #6366f1; }

  .subtitle {
    color: #52525b;
    font-size: 14px;
    margin-bottom: 36px;
    font-family: 'Space Mono', monospace;
  }

  .label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #71717a;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .input {
    width: 100%;
    background: #09090f;
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 12px 16px;
    color: #fff;
    font-size: 15px;
    font-family: 'Space Mono', monospace;
    transition: border-color 0.2s;
    outline: none;
    margin-bottom: 20px;
  }

  .input:focus { border-color: #6366f1; }

  .btn {
    width: 100%;
    padding: 14px;
    background: #6366f1;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    letter-spacing: 0.5px;
  }

  .btn:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .error {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 8px;
    padding: 12px 16px;
    color: #f87171;
    font-size: 13px;
    margin-bottom: 20px;
    font-family: 'Space Mono', monospace;
  }

  .link {
    text-align: center;
    margin-top: 24px;
    font-size: 13px;
    color: #52525b;
  }

  .link a { color: #6366f1; text-decoration: none; }
  .link a:hover { text-decoration: underline; }
`;

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data.access_token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="page">
        <div className="card">
          <div className="logo">Task<span>Flow</span></div>
          <div className="subtitle">// sign in to your workspace</div>

          {error && <div className="error">⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="link">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </>
  );
}
