import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";

import { createClient } from "../../api/clientApi";

function ClientProfileSetup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    occupation: "",
    presentingConcern: "",
    history: "",
    consent: false,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* =========================================================
     HANDLE CHANGE
  ========================================================== */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* =========================================================
     VALIDATION
  ========================================================== */

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    if (!formData.age) {
      newErrors.age = "Age is required.";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender is required.";
    }

    if (!formData.occupation.trim()) {
      newErrors.occupation = "Occupation is required.";
    }

    if (!formData.presentingConcern.trim()) {
      newErrors.presentingConcern = "Please enter your presenting concern.";
    }

    if (!formData.history.trim()) {
      newErrors.history = "Please enter your relevant history.";
    }

    if (!formData.consent) {
      newErrors.consent = "Please provide your consent to continue.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const response = await createClient({
        name: formData.name,
        phone: formData.phone,
        age: formData.age,
        gender: formData.gender,
        occupation: formData.occupation,
        presentingConcern: formData.presentingConcern,
        relevantHistory: formData.history,
        consent: formData.consent,
      });

      console.log("Client profile created:", response);

      navigate("/client");
    } catch (error) {
      console.error("Client setup failed:", error);

      alert(
        error.response?.data?.message ||
          "Unable to save client profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
              <HeartHandshake size={19} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight">Unfazed</p>

              <p className="text-[9px] text-slate-500">Client Setup</p>
            </div>
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Heading */}
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <HeartHandshake size={22} />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-violet-600">
              Client Profile Setup
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Tell us a little about yourself
            </h1>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Complete your profile and intake details before starting your
              therapy journey.
            </p>
          </div>

          {/* Progress */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-violet-600">
                Profile & Intake
              </p>

              <p className="text-[10px] text-slate-400">Setup</p>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-full rounded-full bg-violet-600" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* =================================================
                BASIC DETAILS
            ================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-bold text-slate-900">
                  Basic Information
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Enter your personal details.
                </p>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2">
                <Field label="Full Name" required error={errors.name}>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={inputClass(errors.name)}
                  />
                </Field>

                <Field label="Phone Number" required error={errors.phone}>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className={inputClass(errors.phone)}
                  />
                </Field>

                <Field label="Age" required error={errors.age}>
                  <input
                    name="age"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                    className={inputClass(errors.age)}
                  />
                </Field>

                <Field label="Gender" required error={errors.gender}>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={inputClass(errors.gender)}
                  >
                    <option value="">Select gender</option>

                    <option value="female">Female</option>

                    <option value="male">Male</option>

                    <option value="other">Other</option>

                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Occupation" required error={errors.occupation}>
                    <input
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      placeholder="e.g. Software Engineer"
                      className={inputClass(errors.occupation)}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* =================================================
                INTAKE
            ================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-bold text-slate-900">
                  Intake Information
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Help your therapist understand your needs.
                </p>
              </div>

              <div className="space-y-5 p-5">
                <Field
                  label="Presenting Concern"
                  required
                  error={errors.presentingConcern}
                >
                  <textarea
                    name="presentingConcern"
                    rows={4}
                    value={formData.presentingConcern}
                    onChange={handleChange}
                    placeholder="What would you like support with?"
                    className={`${inputClass(
                      errors.presentingConcern,
                    )} h-auto resize-none py-3`}
                  />
                </Field>

                <Field label="Relevant History" required error={errors.history}>
                  <textarea
                    name="history"
                    rows={5}
                    value={formData.history}
                    onChange={handleChange}
                    placeholder="Share any relevant background or previous experiences..."
                    className={`${inputClass(
                      errors.history,
                    )} h-auto resize-none py-3`}
                  />
                </Field>
              </div>
            </section>

            {/* =================================================
                CONSENT
            ================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-bold text-slate-900">
                  Digital Consent
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Please confirm before completing setup.
                </p>
              </div>

              <div className="p-5">
                <label
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
                    formData.consent
                      ? "border-emerald-200 bg-emerald-50"
                      : errors.consent
                        ? "border-red-200 bg-red-50"
                        : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        size={16}
                        className={
                          formData.consent
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }
                      />

                      <p className="text-sm font-semibold text-slate-800">
                        I consent to provide this information
                      </p>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      I understand that the information I provide will be used
                      as part of my therapy intake and care process.
                    </p>
                  </div>
                </label>

                {errors.consent && (
                  <p className="mt-2 text-[11px] font-medium text-red-500">
                    {errors.consent}
                  </p>
                )}

                {formData.consent && (
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-emerald-600">
                    <CheckCircle2 size={13} />
                    Consent ready.
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                BUTTON
            ================================================== */}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-xs font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck size={13} />
            Your information is handled privately and securely.
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

/* =========================================================
   INPUT CLASS
========================================================= */

function inputClass(error) {
  return `w-full rounded-xl border bg-white px-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
      : "h-11 border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
  }`;
}

export default ClientProfileSetup;
