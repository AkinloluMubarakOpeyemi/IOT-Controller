import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import AuthShell, { AuthLink } from '../components/auth/AuthShell';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (authError) {
      setError(authError.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to monitor energy usage and control your relay."
      footer={
        <>
          New operator? <AuthLink to="/register">Create an account</AuthLink>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
            <FaEnvelope /> Email
          </span>
          <input
            className="input"
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
            <FaLock /> Password
          </span>
          <input
            className="input"
            type="password"
            required
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
        </label>
        {error ? <p className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-600">{error}</p> : null}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
        <div className="text-right text-sm">
          <AuthLink to="/forgot-password">Forgot password?</AuthLink>
        </div>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
