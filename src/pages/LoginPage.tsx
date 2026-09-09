import { useState, useRef, useEffect } from 'react';
import {
  Compass, Eye, EyeOff, User, Building2, ShieldCheck,
  ArrowRight, Loader2, CheckCircle2, AlertCircle, Mail,
  Lock, Phone, ChevronLeft,
} from 'lucide-react';
import { useRouter } from '@/router/Router';
import { ratnagiriDestination } from '@/data/sampleData';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { emailExists, generateId } from '@/store/db';
import type { AppUser } from '@/store/types';

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = 'customer' | 'business' | 'admin';

interface RoleOption {
  id: Role;
  icon: typeof User;
  label: string;
  subtitle: string;
  badge?: string;
}

const roles: RoleOption[] = [
  { id: 'customer', icon: User,       label: 'Customer',  subtitle: 'Explore Ratnagiri' },
  { id: 'business', icon: Building2,  label: 'Business',  subtitle: 'Manage your business' },
  { id: 'admin',    icon: ShieldCheck, label: 'Admin',    subtitle: 'Platform administration', badge: 'Secure' },
];

// ─── Google SVG Icon ──────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
function Spinner() {
  return <Loader2 size={18} className="animate-spin" />;
}

// ─── Password Field ───────────────────────────────────────────────────────────
function PasswordInput({
  id, value, onChange, placeholder = 'Password', label,
}: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; label: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input pl-10 pr-12"
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 transition"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── Inline Error ─────────────────────────────────────────────────────────────
function InlineError({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-error-50 border border-error-200 px-3 py-2.5 text-sm text-error-700 animate-fade-in">
      <AlertCircle size={15} className="shrink-0" />
      {msg}
    </div>
  );
}

// ─── Success Toast ────────────────────────────────────────────────────────────
function SuccessToast({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-success-50 border border-success-200 px-3 py-2.5 text-sm text-success-700 animate-fade-in">
      <CheckCircle2 size={15} className="shrink-0" />
      {message}
    </div>
  );
}

// ─── Remember Me + Forgot Row ─────────────────────────────────────────────────
function RememberForgot({
  remember, onRemember,
}: { remember: boolean; onRemember: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <label className="flex cursor-pointer items-center gap-2 text-navy-600">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => onRemember(e.target.checked)}
          className="h-4 w-4 rounded border-navy-300 text-ocean-600 focus:ring-ocean-500"
        />
        Remember me
      </label>
      <button
        type="button"
        className="font-semibold text-ocean-600 hover:text-ocean-800 transition"
      >
        Forgot Password?
      </button>
    </div>
  );
}

// ─── Customer Form ────────────────────────────────────────────────────────────
function CustomerForm({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [pendingMsg, setPendingMsg] = useState('');

  const { login } = useAuth();
  const { addUser } = useAppData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setPendingMsg('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (mode === 'register') {
      if (!name.trim())   { setError('Please enter your name.'); return; }
      if (!email.trim() || (!emailRegex.test(email) && !phoneRegex.test(email.replace(/\s/g, '')))) {
        setError('Enter a valid email or 10-digit mobile.'); return;
      }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (emailExists(email)) { setError('An account with this email already exists.'); return; }
      setLoading(true);
      await new Promise((r) => setTimeout(r, 800));
      addUser({ name: name.trim(), email: email.trim(), password, role: 'customer', status: 'approved' });
      setLoading(false);
      const res = login(email.trim(), password);
      if (res.ok) { onSuccess(); return; }
      return;
    }

    // Login
    if (!email.trim()) { setError('Please enter your email or mobile number.'); return; }
    if (!password)     { setError('Please enter your password.'); return; }
    if (!emailRegex.test(email) && !phoneRegex.test(email.replace(/\s/g, ''))) {
      setError('Enter a valid email address or 10-digit mobile number.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    const result = login(email, password);
    if (result.ok) { onSuccess(); return; }
    if (result.reason === 'pending')       setPendingMsg('Your account is waiting for admin approval.');
    else if (result.reason === 'rejected') setError('Your registration was rejected by the admin.');
    else                                   setError('Invalid email or password.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in" noValidate>
      <div>
        <p className="section-eyebrow mb-1">Customer {mode === 'login' ? 'Login' : 'Register'}</p>
        <h2 className="text-xl font-bold text-navy-900">
          {mode === 'login' ? 'Continue your Ratnagiri journey.' : 'Create your account.'}
        </h2>
      </div>

      {pendingMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-warning-50 border border-warning-200 px-3 py-2.5 text-sm text-warning-800 animate-fade-in">
          <AlertCircle size={15} className="shrink-0" />{pendingMsg}
        </div>
      )}
      {error && <InlineError msg={error} />}

      {mode === 'register' && (
        <div>
          <label htmlFor="cust-name" className="label">Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
            <input id="cust-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Your full name" className="input pl-10" autoComplete="name" />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="cust-email" className="label">Email / Mobile Number</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input id="cust-email" type="text" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com or 9876543210" className="input pl-10" autoComplete="email" />
        </div>
      </div>

      <PasswordInput id="cust-password" label="Password" value={password} onChange={setPassword} />

      {mode === 'login' && <RememberForgot remember={remember} onRemember={setRemember} />}

      <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
        {loading ? <Spinner /> : null}
        {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create Account'}
      </button>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-navy-100" />
        <span className="text-xs font-semibold text-navy-400 uppercase tracking-widest">or</span>
        <div className="h-px flex-1 bg-navy-100" />
      </div>

      {mode === 'login' ? (
        <>
          <button type="button" className="btn-secondary w-full text-sm gap-3 py-3">
            <GoogleIcon /> Continue with Google
          </button>
          <p className="text-center text-sm text-navy-500">
            Don&apos;t have an account?{' '}
            <button type="button" onClick={() => { setMode('register'); setError(''); setPendingMsg(''); }}
              className="font-semibold text-ocean-600 hover:text-ocean-800 transition">Sign Up</button>
          </p>
        </>
      ) : (
        <p className="text-center text-sm text-navy-500">
          Already have an account?{' '}
          <button type="button" onClick={() => { setMode('login'); setError(''); setPendingMsg(''); }}
            className="font-semibold text-ocean-600 hover:text-ocean-800 transition">Login</button>
        </p>
      )}
    </form>
  );
}

// ─── Business Form ────────────────────────────────────────────────────────────
function BusinessForm({
  onSuccess, onRegister,
}: { onSuccess: () => void; onRegister: () => void }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [pendingMsg, setPendingMsg] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setPendingMsg('');
    if (!email.trim()) { setError('Please enter your business email or mobile number.'); return; }
    if (!password)     { setError('Please enter your password.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    const result = login(email, password);
    if (result.ok) { onSuccess(); return; }
    if (result.reason === 'pending')       setPendingMsg('Your business registration is awaiting admin approval.');
    else if (result.reason === 'rejected') setError('Your business registration was rejected by the admin.');
    else if (result.reason === 'not_found') setError('No business account found. Please register first.');
    else                                   setError('Invalid email or password.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in" noValidate>
      <div>
        <p className="section-eyebrow mb-1">Business Login</p>
        <h2 className="text-xl font-bold text-navy-900">Manage your business on Ratnagiri Travel.</h2>
      </div>

      {pendingMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-warning-50 border border-warning-200 px-3 py-2.5 text-sm text-warning-800 animate-fade-in">
          <AlertCircle size={15} className="shrink-0" />{pendingMsg}
        </div>
      )}
      {error && <InlineError msg={error} />}

      <div>
        <label htmlFor="biz-email" className="label">Business Email / Mobile Number</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            id="biz-email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="business@email.com or 9876543210"
            className="input pl-10"
            autoComplete="email"
          />
        </div>
      </div>

      <PasswordInput id="biz-password" label="Password" value={password} onChange={setPassword} />

      <RememberForgot remember={remember} onRemember={setRemember} />

      <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
        {loading ? <Spinner /> : null}
        {loading ? 'Logging in…' : 'Login'}
      </button>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-navy-100" />
        <span className="text-xs font-semibold text-navy-400 uppercase tracking-widest">or</span>
        <div className="h-px flex-1 bg-navy-100" />
      </div>

      <button
        type="button"
        className="btn-secondary w-full text-sm gap-3 py-3"
      >
        <GoogleIcon /> Continue with Google
      </button>

      {/* Register CTA */}
      <div className="rounded-2xl border border-sand-200 bg-sand-50 p-4">
        <p className="text-sm font-semibold text-navy-800">New to Ratnagiri Travel?</p>
        <p className="mt-0.5 text-xs text-navy-500">List your business and reach thousands of Konkan travellers.</p>
        <button
          type="button"
          onClick={onRegister}
          className="btn-accent mt-3 w-full text-sm py-2.5"
        >
          Register Your Business <ArrowRight size={15} />
        </button>
      </div>
    </form>
  );
}

// ─── Admin Form ───────────────────────────────────────────────────────────────
function AdminForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Please enter your admin email or username.'); return; }
    if (!password)        { setError('Please enter your password.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    const result = login(username, password);
    if (result.ok) { onSuccess(); return; }
    setError('Unauthorized. Check credentials and try again.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in" noValidate>
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="chip bg-navy-900 text-white text-xs">
            <ShieldCheck size={11} /> Secure Access
          </span>
        </div>
        <p className="section-eyebrow mb-1">Admin Login</p>
        <h2 className="text-xl font-bold text-navy-900">Authorized access only.</h2>
      </div>

      {error && <InlineError msg={error} />}

      <div>
        <label htmlFor="admin-email" className="label">Admin Email / Username</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            id="admin-email"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin@roamiq.in"
            className="input pl-10"
            autoComplete="username"
          />
        </div>
      </div>

      <PasswordInput id="admin-password" label="Password" value={password} onChange={setPassword} />

      <RememberForgot remember={remember} onRemember={setRemember} />

      <button
        type="submit"
        disabled={loading}
        className="btn w-full bg-navy-800 text-white px-5 py-3 shadow-soft hover:bg-navy-900 active:scale-[0.98] text-base"
      >
        {loading ? <Spinner /> : <ShieldCheck size={17} />}
        {loading ? 'Authenticating…' : 'Secure Login'}
      </button>

      <p className="text-center text-xs text-navy-400">
        This portal is restricted to authorised RoamIQ administrators only.
        Unauthorised access attempts are logged.
      </p>
    </form>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ role, onContinue }: { role: Role; onContinue: () => void }) {
  const messages: Record<Role, { title: string; sub: string; btn: string }> = {
    customer: { title: 'Welcome back, Explorer!', sub: 'Continuing your Ratnagiri journey…', btn: 'Explore Now' },
    business: { title: 'Business Portal Ready!', sub: 'Manage your listings and reach Konkan travellers.', btn: 'Go to Dashboard' },
    admin:    { title: 'Admin Access Granted', sub: 'Welcome to the RoamIQ admin panel.', btn: 'Open Dashboard' },
  };
  const m = messages[role];

  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center animate-scale-in">
      <span className="grid h-20 w-20 place-items-center rounded-full bg-success-100 text-success-600">
        <CheckCircle2 size={40} />
      </span>
      <div>
        <h2 className="text-2xl font-bold text-navy-900">{m.title}</h2>
        <p className="mt-2 text-navy-500">{m.sub}</p>
      </div>
      <button onClick={onContinue} className="btn-primary px-8 py-3 text-base">
        {m.btn} <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ─── Main Login Page ──────────────────────────────────────────────────────────
export function LoginPage() {
  const { navigate } = useRouter();
  const { session } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const [loginSuccess, setLoginSuccess] = useState(false);
  // key forces form re-mount (clears state) when switching role
  const [formKey, setFormKey] = useState(0);

  const switchRole = (r: Role) => {
    if (r === selectedRole) return;
    setSelectedRole(r);
    setLoginSuccess(false);
    setFormKey((k) => k + 1);
  };

  const handleSuccess = () => setLoginSuccess(true);

  const handleContinue = () => {
    if (session?.role === 'admin') navigate({ name: 'admin' });
    else if (session?.role === 'customer') navigate({ name: 'customer-dashboard' });
    else navigate({ name: 'home' }); // For businesses, just go home for now
  };

  const goHome = () => navigate({ name: 'home' });
  const goRegister = () => navigate({ name: 'business-register' });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left decorative panel ── */}
      <div className="relative hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col justify-between overflow-hidden">
        {/* Background image */}
        <img
          src={ratnagiriDestination.heroImage}
          alt="Ratnagiri coastline"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900/80 via-navy-900/60 to-ocean-900/70" />

        {/* Wave at the right edge */}
        <svg
          className="absolute right-0 top-0 h-full"
          viewBox="0 0 60 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M60,0 Q20,200 60,400 Q20,600 60,800 L60,800 L60,0 Z" fill="#f1f5f9" />
        </svg>

        {/* Content */}
        <div className="relative z-10 p-8 xl:p-12">
          {/* Logo */}
          <button onClick={goHome} className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ocean-600 text-white shadow-lift">
              <Compass size={22} />
            </span>
            <span className="font-display text-xl font-extrabold text-white">
              Roam<span className="text-ocean-300">IQ</span>
            </span>
          </button>
        </div>

        <div className="relative z-10 p-8 xl:p-12">
          <span className="chip bg-white/15 text-white backdrop-blur text-xs mb-4 inline-flex">
            🌊 Konkan Coast, Maharashtra
          </span>
          <h1 className="font-display text-3xl xl:text-4xl font-extrabold leading-tight text-white text-balance">
            Explore More.<br />
            <span className="text-ocean-300">Plan Smarter.</span>
          </h1>
          <p className="mt-4 text-white/80 leading-relaxed max-w-xs">
            Pristine beaches, centuries-old forts, Alphonso mangoes, and Konkan culture — all in one place.
          </p>

          <ul className="mt-6 space-y-2">
            {ratnagiriDestination.highlights.slice(0, 4).map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm text-white/85">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ocean-400" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col min-h-screen">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-5 py-4 lg:hidden border-b border-navy-100 bg-white">
          <button onClick={goHome} className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-ocean-600 text-white">
              <Compass size={18} />
            </span>
            <span className="font-display text-base font-extrabold text-navy-900">
              Roam<span className="text-ocean-600">IQ</span>
            </span>
          </button>
          <button onClick={goHome} className="flex items-center gap-1 text-sm text-navy-500 hover:text-navy-800 transition">
            <ChevronLeft size={16} /> Back
          </button>
        </div>

        {/* Scrollable form area */}
        <div className="flex flex-1 items-start justify-center px-5 py-10 lg:py-16 bg-navy-50">
          <div className="w-full max-w-md">

            {/* Welcome header */}
            {!loginSuccess && (
              <div className="mb-7 animate-fade-up">
                <h1 className="font-display text-2xl font-extrabold text-navy-900">Welcome Back!</h1>
                <p className="mt-1 text-navy-500 text-sm">Choose how you want to continue.</p>
              </div>
            )}

            {/* Role selector */}
            {!loginSuccess && (
              <div className="card mb-6 p-1.5 animate-fade-up" style={{ animationDelay: '60ms' }}>
                <div className="grid grid-cols-3 gap-1">
                  {roles.map((role) => {
                    const active = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        id={`role-tab-${role.id}`}
                        onClick={() => switchRole(role.id)}
                        className={`relative flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-center transition-all duration-200 ${
                          active
                            ? 'bg-ocean-600 text-white shadow-card'
                            : 'text-navy-600 hover:bg-navy-50'
                        }`}
                      >
                        {role.id === 'admin' && !active && (
                          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-sand-500" />
                        )}
                        <role.icon size={20} />
                        <span className="text-xs font-bold leading-none">{role.label}</span>
                        <span className={`text-[10px] leading-tight ${active ? 'text-ocean-100' : 'text-navy-400'}`}>
                          {role.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Form card */}
            <div
              className="card p-6 sm:p-8 animate-fade-up"
              style={{ animationDelay: '120ms' }}
            >
              {loginSuccess ? (
                <SuccessScreen role={selectedRole} onContinue={handleContinue} />
              ) : (
                <div key={formKey}>
                  {selectedRole === 'customer' && <CustomerForm onSuccess={handleSuccess} />}
                  {selectedRole === 'business' && <BusinessForm onSuccess={handleSuccess} onRegister={goRegister} />}
                  {selectedRole === 'admin'    && <AdminForm    onSuccess={handleSuccess} />}
                </div>
              )}
            </div>

            {/* Footer note */}
            {!loginSuccess && (
              <p className="mt-6 text-center text-xs text-navy-400 animate-fade-in" style={{ animationDelay: '200ms' }}>
                RoamIQ is a hackathon prototype. Sample data only.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
