import { useState, useRef } from 'react';
import {
  Compass, ArrowRight, ArrowLeft, Building2, User, Mail,
  Phone, MapPin, FileText, ImagePlus, Lock, CheckCircle2,
  Loader2, ChevronLeft, X, ShieldCheck, Eye, EyeOff,
} from 'lucide-react';
import { useRouter } from '@/router/Router';
import { useAppData } from '@/context/AppDataContext';
import { emailExists } from '@/store/db';

// ─── Business Categories ──────────────────────────────────────────────────────
const CATEGORIES = [
  'Hotel / Resort',
  'Homestay / Guesthouse',
  'Restaurant / Café',
  'Water Sports & Activities',
  'Trekking & Adventure',
  'Travel Agency / Tour Operator',
  'Local Experiences & Workshops',
  'Spa & Wellness',
  'Rental Services',
  'Photography Services',
  'Other',
];

const RATNAGIRI_AREAS = [
  'Ratnagiri City',
  'Ganpatipule',
  'Jaigad',
  'Pawas',
  'Mandavi Beach Area',
  'Marleshwar',
  'Sangameshwar',
  'Rajapur',
  'Lanja',
  'Chiplun (near Ratnagiri)',
  'Other / Multiple Locations',
];

// ─── Step progress indicator ──────────────────────────────────────────────────
const STEPS = ['Business Details', 'Owner & Photos', 'Account Setup'];

function StepBar({ current }: { current: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => {
          const done    = i < current;
          const active  = i === current;
          return (
            <div key={label} className="flex flex-1 items-center">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                    done
                      ? 'border-ocean-600 bg-ocean-600 text-white'
                      : active
                      ? 'border-ocean-600 bg-white text-ocean-600'
                      : 'border-navy-200 bg-white text-navy-400'
                  }`}
                >
                  {done ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <span
                  className={`mt-1.5 text-[10px] font-semibold whitespace-nowrap ${
                    active ? 'text-ocean-700' : done ? 'text-ocean-600' : 'text-navy-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mt-[-18px] transition-all duration-500 ${done ? 'bg-ocean-500' : 'bg-navy-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-error-600">{msg}</p>;
}

// ─── Image Upload Preview ─────────────────────────────────────────────────────
function ImageUploader({
  images, onAdd, onRemove,
}: {
  images: string[];
  onAdd: (urls: string[]) => void;
  onRemove: (i: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const readers = files.map(
      (file) =>
        new Promise<string>((res) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.readAsDataURL(file);
        }),
    );
    Promise.all(readers).then(onAdd);
    e.target.value = '';
  };

  return (
    <div>
      <label className="label">Business Images <span className="font-normal text-navy-400">(optional)</span></label>
      <div className="flex flex-wrap gap-3">
        {images.map((src, i) => (
          <div key={i} className="relative h-20 w-20 overflow-hidden rounded-2xl border border-navy-200 shadow-soft">
            <img src={src} alt={`upload-${i}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label="Remove image"
              className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-navy-900/70 text-white"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        {images.length < 6 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-navy-200 bg-navy-50 text-navy-400 hover:border-ocean-400 hover:text-ocean-500 transition"
          >
            <ImagePlus size={20} />
            <span className="text-[10px] font-semibold">Add</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
    </div>
  );
}

// ─── Form data ────────────────────────────────────────────────────────────────
interface FormData {
  businessName: string;
  category: string;
  address: string;
  location: string;
  description: string;
  ownerName: string;
  email: string;
  phone: string;
  images: string[];
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

const empty: FormData = {
  businessName: '', category: '', address: '', location: '',
  description: '', ownerName: '', email: '', phone: '',
  images: [], password: '', confirmPassword: '', agreeTerms: false,
};

// ─── Password field ───────────────────────────────────────────────────────────
function PWInput({
  id, label, value, onChange, placeholder, autoComplete,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="input pl-10 pr-12"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide' : 'Show'}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 transition"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function Step1({
  data, onChange, errors,
}: {
  data: FormData;
  onChange: (k: keyof FormData, v: string) => void;
  errors: Partial<Record<keyof FormData, string>>;
}) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <label htmlFor="reg-name" className="label">Business Name <span className="text-error-500">*</span></label>
        <div className="relative">
          <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            id="reg-name"
            type="text"
            value={data.businessName}
            onChange={(e) => onChange('businessName', e.target.value)}
            placeholder="e.g. Konkan Beach Resort"
            className="input pl-10"
          />
        </div>
        <FieldError msg={errors.businessName} />
      </div>

      <div>
        <label htmlFor="reg-category" className="label">Business Category <span className="text-error-500">*</span></label>
        <select
          id="reg-category"
          value={data.category}
          onChange={(e) => onChange('category', e.target.value)}
          className="input"
        >
          <option value="">— Select a category —</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <FieldError msg={errors.category} />
      </div>

      <div>
        <label htmlFor="reg-address" className="label">Business Address <span className="text-error-500">*</span></label>
        <div className="relative">
          <MapPin size={15} className="absolute left-3.5 top-3.5 text-navy-400" />
          <textarea
            id="reg-address"
            value={data.address}
            onChange={(e) => onChange('address', e.target.value)}
            placeholder="Street, village, taluka, PIN"
            rows={2}
            className="input pl-10 resize-none"
          />
        </div>
        <FieldError msg={errors.address} />
      </div>

      <div>
        <label htmlFor="reg-location" className="label">Ratnagiri Area / Location <span className="text-error-500">*</span></label>
        <select
          id="reg-location"
          value={data.location}
          onChange={(e) => onChange('location', e.target.value)}
          className="input"
        >
          <option value="">— Select area —</option>
          {RATNAGIRI_AREAS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <FieldError msg={errors.location} />
      </div>

      <div>
        <label htmlFor="reg-desc" className="label">Business Description <span className="text-error-500">*</span></label>
        <div className="relative">
          <FileText size={15} className="absolute left-3.5 top-3.5 text-navy-400" />
          <textarea
            id="reg-desc"
            value={data.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Tell travellers what makes your business special…"
            rows={4}
            className="input pl-10 resize-none"
          />
        </div>
        <FieldError msg={errors.description} />
        <p className="mt-1 text-xs text-navy-400">{data.description.length}/500 characters</p>
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function Step2({
  data, onChange, onImageAdd, onImageRemove, errors,
}: {
  data: FormData;
  onChange: (k: keyof FormData, v: string) => void;
  onImageAdd: (urls: string[]) => void;
  onImageRemove: (i: number) => void;
  errors: Partial<Record<keyof FormData, string>>;
}) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <label htmlFor="reg-owner" className="label">Owner / Manager Name <span className="text-error-500">*</span></label>
        <div className="relative">
          <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            id="reg-owner"
            type="text"
            value={data.ownerName}
            onChange={(e) => onChange('ownerName', e.target.value)}
            placeholder="Your full name"
            className="input pl-10"
          />
        </div>
        <FieldError msg={errors.ownerName} />
      </div>

      <div>
        <label htmlFor="reg-email" className="label">Email Address <span className="text-error-500">*</span></label>
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            id="reg-email"
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="owner@yourbusiness.com"
            className="input pl-10"
            autoComplete="email"
          />
        </div>
        <FieldError msg={errors.email} />
      </div>

      <div>
        <label htmlFor="reg-phone" className="label">Phone Number <span className="text-error-500">*</span></label>
        <div className="relative">
          <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            id="reg-phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="9876543210"
            maxLength={10}
            className="input pl-10"
            autoComplete="tel"
          />
        </div>
        <FieldError msg={errors.phone} />
      </div>

      <ImageUploader
        images={data.images}
        onAdd={onImageAdd}
        onRemove={onImageRemove}
      />
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────
function Step3({
  data, onChange, errors,
}: {
  data: FormData;
  onChange: (k: keyof FormData, v: unknown) => void;
  errors: Partial<Record<keyof FormData, string>>;
}) {
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="rounded-2xl bg-ocean-50 border border-ocean-100 p-4 text-sm text-ocean-800">
        <p className="font-semibold">Almost there!</p>
        <p className="mt-0.5 text-ocean-700 text-xs">Create a secure password for your business account. Your listing will be <strong>pending approval</strong> until reviewed by the RoamIQ team.</p>
      </div>

      <div>
        <label htmlFor="reg-pw" className="label">Password <span className="text-error-500">*</span></label>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            id="reg-pw"
            type={showPw ? 'text' : 'password'}
            value={data.password}
            onChange={(e) => onChange('password', e.target.value)}
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            className="input pl-10 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label="Toggle password visibility"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 transition"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <FieldError msg={errors.password} />
        {/* Strength bar */}
        {data.password.length > 0 && (
          <div className="mt-2 flex gap-1">
            {[1,2,3,4].map((n) => (
              <div key={n} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                data.password.length >= n * 2
                  ? data.password.length < 6 ? 'bg-error-400'
                    : data.password.length < 10 ? 'bg-warning-400'
                    : 'bg-success-500'
                  : 'bg-navy-100'
              }`} />
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="reg-cpw" className="label">Confirm Password <span className="text-error-500">*</span></label>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            id="reg-cpw"
            type={showCpw ? 'text' : 'password'}
            value={data.confirmPassword}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            placeholder="Repeat password"
            autoComplete="new-password"
            className="input pl-10 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowCpw((v) => !v)}
            aria-label="Toggle confirm password visibility"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 transition"
          >
            {showCpw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <FieldError msg={errors.confirmPassword} />
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-navy-700">
        <input
          type="checkbox"
          checked={data.agreeTerms}
          onChange={(e) => onChange('agreeTerms', e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy-300 text-ocean-600 focus:ring-ocean-500"
        />
        <span>
          I agree to the{' '}
          <button type="button" className="font-semibold text-ocean-600 hover:underline">Terms & Conditions</button>
          {' '}and{' '}
          <button type="button" className="font-semibold text-ocean-600 hover:underline">Privacy Policy</button>
          {' '}of RoamIQ.
        </span>
      </label>
      <FieldError msg={errors.agreeTerms} />
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function RegistrationSuccess({ businessName, onGoHome }: { businessName: string; onGoHome: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center animate-scale-in">
      <div className="relative">
        <span className="grid h-24 w-24 place-items-center rounded-full bg-success-100 text-success-600">
          <CheckCircle2 size={44} />
        </span>
        <span className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-sand-500 text-white shadow-card">
          <ShieldCheck size={15} />
        </span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-navy-900">Registration Submitted!</h2>
        <p className="mt-2 text-navy-600">
          <strong>{businessName}</strong> has been submitted for review.
        </p>
      </div>

      {/* Pending badge */}
      <div className="w-full rounded-2xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
        <p className="font-semibold">⏳ Pending Approval</p>
        <p className="mt-1 text-warning-700 text-xs">
          The RoamIQ team will review your listing within 2–3 business days.
          You will receive a confirmation email once approved.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-ocean-100 bg-ocean-50 p-4 text-left text-sm">
        <p className="font-semibold text-ocean-800">What happens next?</p>
        <ul className="mt-2 space-y-1.5">
          {[
            'Our team reviews your business details',
            'We may contact you for additional information',
            'Once approved, your listing goes live on RoamIQ',
            'Travellers across Konkan can discover your business',
          ].map((s) => (
            <li key={s} className="flex items-start gap-2 text-xs text-ocean-700">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ocean-400" /> {s}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={onGoHome} className="btn-primary w-full py-3 text-base">
        Back to RoamIQ <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function BusinessRegisterPage() {
  const { navigate } = useRouter();
  const { addBusiness, addUser } = useAppData();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (k: keyof FormData, v: unknown) => {
    setData((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const addImages = (urls: string[]) =>
    setData((prev) => ({ ...prev, images: [...prev.images, ...urls].slice(0, 6) }));

  const removeImage = (i: number) =>
    setData((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));

  const validateStep = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (step === 0) {
      if (!data.businessName.trim()) e.businessName = 'Business name is required.';
      if (!data.category)            e.category     = 'Please select a category.';
      if (!data.address.trim())      e.address      = 'Address is required.';
      if (!data.location)            e.location     = 'Please select a Ratnagiri area.';
      if (!data.description.trim())  e.description  = 'Description is required.';
    }
    if (step === 1) {
      if (!data.ownerName.trim())              e.ownerName = 'Owner name is required.';
      if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Enter a valid email address.';
      if (!data.phone.trim() || !/^[6-9]\d{9}$/.test(data.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number.';
    }
    if (step === 2) {
      if (!data.password || data.password.length < 8)  e.password        = 'Password must be at least 8 characters.';
      if (data.password !== data.confirmPassword)       e.confirmPassword = 'Passwords do not match.';
      if (!data.agreeTerms)                             e.agreeTerms      = 'You must accept the terms to proceed.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    // Final check for email
    if (emailExists(data.email)) {
      setErrors({ email: 'An account with this email already exists.' });
      return;
    }
    // Final submit
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    
    addBusiness({
      businessName: data.businessName.trim(),
      ownerName: data.ownerName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      description: data.description.trim(),
      category: data.category,
      approvedCategory: '',
      address: data.address.trim(),
      location: data.location,
      images: data.images,
      status: 'pending',
    });

    addUser({
      name: data.ownerName.trim(),
      email: data.email.trim(),
      password: data.password,
      role: 'business',
      status: 'pending',
    });

    setLoading(false);
    setSubmitted(true);
  };

  const goBack  = () => step > 0 ? setStep((s) => s - 1) : navigate({ name: 'login' });
  const goHome  = () => navigate({ name: 'home' });

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-navy-100 bg-white/90 backdrop-blur-md shadow-soft">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <button onClick={goHome} className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ocean-600 text-white shadow-soft">
              <Compass size={20} />
            </span>
            <span className="font-display text-lg font-extrabold text-navy-900">
              Roam<span className="text-ocean-600">IQ</span>
            </span>
          </button>

          {!submitted && (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 text-sm font-semibold text-navy-500 hover:text-navy-800 transition"
            >
              <ChevronLeft size={16} />
              {step === 0 ? 'Back to Login' : 'Previous Step'}
            </button>
          )}
        </div>
      </header>

      {/* Body */}
      <main className="container-page max-w-2xl py-10 lg:py-16">
        {submitted ? (
          <div className="card p-8 animate-scale-in">
            <RegistrationSuccess businessName={data.businessName} onGoHome={goHome} />
          </div>
        ) : (
          <>
            {/* Page title */}
            <div className="mb-8 animate-fade-up">
              <p className="section-eyebrow">For Business Owners</p>
              <h1 className="section-title mt-1">Register Your Business</h1>
              <p className="mt-2 text-navy-500">
                List your Ratnagiri business on RoamIQ and reach thousands of Konkan travellers.
              </p>
            </div>

            {/* Step bar */}
            <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
              <StepBar current={step} />
            </div>

            {/* Form card */}
            <div className="card p-6 sm:p-8 animate-fade-up" style={{ animationDelay: '120ms' }}>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-navy-900">
                  Step {step + 1}: {STEPS[step]}
                </h2>
                <p className="mt-0.5 text-sm text-navy-500">
                  {step === 0 && 'Tell us about your business so travellers can find you.'}
                  {step === 1 && 'Provide owner details and upload photos of your business.'}
                  {step === 2 && 'Set up your login credentials to manage your listing.'}
                </p>
              </div>

              {step === 0 && <Step1 data={data} onChange={(k, v) => update(k, v)} errors={errors} />}
              {step === 1 && (
                <Step2
                  data={data}
                  onChange={(k, v) => update(k, v)}
                  onImageAdd={addImages}
                  onImageRemove={removeImage}
                  errors={errors}
                />
              )}
              {step === 2 && <Step3 data={data} onChange={update} errors={errors} />}

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between gap-4">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <ArrowLeft size={16} /> Previous
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className={`flex items-center gap-2 ${step === 2 ? 'btn-accent' : 'btn-primary'} px-6 py-3`}
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {step < 2 ? (
                    <>Next Step <ArrowRight size={16} /></>
                  ) : loading ? (
                    'Submitting…'
                  ) : (
                    <>Submit Business Registration <CheckCircle2 size={16} /></>
                  )}
                </button>
              </div>
            </div>

            {/* Trust note */}
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-navy-100 bg-white p-4 text-sm text-navy-600 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-ocean-600" />
              <p>
                Your details are reviewed by our team before going live. All businesses are verified to ensure quality for travellers.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
