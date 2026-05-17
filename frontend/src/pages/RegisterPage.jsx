import { useState } from 'react';
import api from '../api/client.js';

export default function RegisterPage({ setPage }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('register');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.register({ fullName, email, password });
      setMessage('OTP sent to your email. Enter it below.');
      setStep('verify');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.verifyOtp(email, otp);
      setMessage('Email verified. You can sign in now.');
      setTimeout(() => setPage('login'), 1500);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="auth-sub">Register as a customer (USER role)</p>
        {step === 'register' ? (
          <form onSubmit={handleRegister} className="auth-form">
            <label>
              Full name
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="auth-form">
            <label>
              OTP code
              <input value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </label>
            {error && <p className="auth-error">{error}</p>}
            {message && <p className="auth-success">{message}</p>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify email'}
            </button>
          </form>
        )}
        <p className="auth-footer">
          Have an account? <button type="button" className="link-btn" onClick={() => setPage('login')}>Sign in</button>
        </p>
        <button type="button" className="link-btn back-link" onClick={() => setPage('home')}>← Back to store</button>
      </div>
    </div>
  );
}
