import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import AuthShell, { AuthLink } from '../components/auth/AuthShell';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (authError) {
      setError(authError.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="Register an operator account for the IoT energy dashboard."
      footer={
        <>
          Already registered? <AuthLink to="/login">Login</AuthLink>
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
        {['password', 'confirmPassword'].map((field) => (
          <label className="block" key={field}>
            <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
              <FaLock /> {field === 'password' ? 'Password' : 'Confirm Password'}
            </span>
            <input
              className="input"
              type="password"
              required
              minLength={6}
              value={form[field]}
              onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
            />
          </label>
        ))}
        {error ? <p className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-600">{error}</p> : null}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
    </AuthShell>
  );
}

export default RegisterPage;
