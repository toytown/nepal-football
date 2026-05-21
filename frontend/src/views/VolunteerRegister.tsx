import { useState } from 'react';
import type { VolunteerDay, VolunteerRegistrationInput } from '@nepal-football/shared';
import { useRegisterVolunteer } from '../api/hooks';

const DAYS: { value: VolunteerDay; label: string; sub: string }[] = [
  { value: 'Friday',   label: 'Friday',   sub: '3 July — Preparation Day (14:00+)' },
  { value: 'Saturday', label: 'Saturday', sub: '4 July — Tournament Day 1' },
  { value: 'Sunday',   label: 'Sunday',   sub: '5 July — Tournament Day 2 & Finals' },
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  city: string;
  days: VolunteerDay[];
  notes: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  days?: string;
}

const EMPTY: FormState = {
  name: '', email: '', phone: '', city: '', days: [], notes: '',
};

export default function VolunteerRegister() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const mutation = useRegisterVolunteer();

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) {
      e.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Please enter a valid email address';
    }
    if (form.days.length === 0) e.days = 'Please select at least one day';
    return e;
  }

  function toggleDay(day: VolunteerDay) {
    setForm((f) => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter((d) => d !== day) : [...f.days, day],
    }));
    if (errors.days) setErrors((e) => ({ ...e, days: undefined }));
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field in errors) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload: VolunteerRegistrationInput = {
      name:  form.name.trim(),
      email: form.email.trim(),
      days:  form.days,
      ...(form.phone.trim() && { phone: form.phone.trim() }),
      ...(form.city.trim()  && { city:  form.city.trim()  }),
      ...(form.notes.trim() && { notes: form.notes.trim() }),
    };

    mutation.mutate(payload, {
      onSuccess: () => { setSubmitted(true); setForm(EMPTY); },
    });
  }

  if (submitted) {
    return (
      <div className="register-success" role="alert">
        <div className="register-success-icon">🎉</div>
        <h2 className="register-success-title">Thank you for signing up!</h2>
        <p className="register-success-body">
          We have received your registration for the <strong>Nepali Europapokal 2026</strong>.
          A confirmation will be sent to your email address. Our volunteer coordinator will
          be in touch with further details closer to the event.
        </p>
        <p className="register-success-body" style={{ marginTop: 8 }}>
          📍 Sportanlage Grüngürtel, Berlin &nbsp;·&nbsp; 📅 4–5 July 2026
        </p>
        <button
          className="reg-btn"
          style={{ marginTop: 24 }}
          onClick={() => setSubmitted(false)}
        >
          Register another volunteer
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <div className="prep-banner" style={{ marginBottom: 24 }}>
        <div className="prep-banner-icon">🤝</div>
        <div>
          <div className="prep-banner-title">Volunteer Registration</div>
          <div className="prep-banner-sub">
            Nepali Europapokal 2026 · Sportanlage Grüngürtel, Berlin · 3–5 July 2026
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate aria-label="Volunteer registration form">
        <div className="card">
          <div className="card-title">👤 Personal Details</div>

          {/* Name */}
          <div className="reg-field">
            <label className="reg-label" htmlFor="vol-name">
              Full Name <span className="reg-required">*</span>
            </label>
            <input
              id="vol-name"
              className={`reg-input${errors.name ? ' reg-input-error' : ''}`}
              type="text"
              placeholder="e.g. Sita Rai"
              maxLength={100}
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              aria-required="true"
              aria-describedby={errors.name ? 'vol-name-err' : undefined}
            />
            {errors.name && (
              <span id="vol-name-err" className="reg-error" role="alert">{errors.name}</span>
            )}
          </div>

          {/* Email */}
          <div className="reg-field">
            <label className="reg-label" htmlFor="vol-email">
              Email Address <span className="reg-required">*</span>
            </label>
            <input
              id="vol-email"
              className={`reg-input${errors.email ? ' reg-input-error' : ''}`}
              type="email"
              placeholder="e.g. sita@example.com"
              maxLength={200}
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              aria-required="true"
              aria-describedby={errors.email ? 'vol-email-err' : undefined}
            />
            {errors.email && (
              <span id="vol-email-err" className="reg-error" role="alert">{errors.email}</span>
            )}
          </div>

          {/* Phone + City side by side */}
          <div className="reg-row">
            <div className="reg-field">
              <label className="reg-label" htmlFor="vol-phone">Phone Number</label>
              <input
                id="vol-phone"
                className="reg-input"
                type="tel"
                placeholder="e.g. +49 170 1234567"
                maxLength={30}
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div className="reg-field">
              <label className="reg-label" htmlFor="vol-city">City</label>
              <input
                id="vol-city"
                className="reg-input"
                type="text"
                placeholder="e.g. Berlin"
                maxLength={100}
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="card">
          <div className="card-title">📅 Availability</div>
          <p className="reg-hint">Select all days you are available. At least one is required.</p>
          <div
            className="reg-days"
            role="group"
            aria-label="Available days"
            aria-describedby={errors.days ? 'vol-days-err' : undefined}
          >
            {DAYS.map(({ value, label, sub }) => {
              const checked = form.days.includes(value);
              return (
                <label
                  key={value}
                  className={`reg-day-card${checked ? ' reg-day-card-checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="reg-day-checkbox"
                    checked={checked}
                    onChange={() => toggleDay(value)}
                    aria-label={`${label} — ${sub}`}
                  />
                  <span className="reg-day-check">{checked ? '✓' : ''}</span>
                  <span className="reg-day-info">
                    <span className="reg-day-label">{label}</span>
                    <span className="reg-day-sub">{sub}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.days && (
            <span id="vol-days-err" className="reg-error" role="alert">{errors.days}</span>
          )}
        </div>

        {/* Notes */}
        <div className="card">
          <div className="card-title">💬 Additional Notes</div>
          <div className="reg-field">
            <label className="reg-label" htmlFor="vol-notes">
              Notes (optional)
            </label>
            <textarea
              id="vol-notes"
              className="reg-input reg-textarea"
              placeholder="Any skills, dietary requirements, or questions for the organizers…"
              maxLength={500}
              rows={3}
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
            <span className="reg-char-count">{form.notes.length}/500</span>
          </div>
        </div>

        {/* API error */}
        {mutation.isError && (
          <div className="inline-error" role="alert" style={{ marginBottom: 16 }}>
            ⚠️ {mutation.error instanceof Error ? mutation.error.message : 'Registration failed. Please try again.'}
          </div>
        )}

        <button
          type="submit"
          className="reg-btn"
          disabled={mutation.isPending}
          aria-busy={mutation.isPending}
        >
          {mutation.isPending ? 'Submitting…' : '🤝 Submit Registration'}
        </button>

        <p className="reg-footer">
          Your details will only be used for volunteer coordination for this event.
        </p>
      </form>
    </div>
  );
}
