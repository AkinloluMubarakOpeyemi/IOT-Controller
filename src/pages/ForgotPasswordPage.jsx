import { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import AuthShell, { AuthLink } from '../components/auth/AuthShell';
import { useAuth } from '../context/AuthContext';

function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await resetPassword(email);
      setMessage('Password reset email sent. Check your inbox.');
    } catch (authError) {
      setError(authError.message || 'Unable to send reset email.');
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter the email connected to your Firebase Authentication account."
      footer={<AuthLink to="/login">Return to login</AuthLink>}
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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        {message ? <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-600">{error}</p> : null}
        <button className="btn-primary w-full">Send reset link</button>
      </form>
    </AuthShell>
  );
}

export default ForgotPasswordPage;
