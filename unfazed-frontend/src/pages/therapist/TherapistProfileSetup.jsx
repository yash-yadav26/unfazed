import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  HeartHandshake,
  Link2,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

const specializationOptions = [
  "Anxiety & Stress",
  "Depression",
  "Relationships",
  "Trauma & PTSD",
  "Family & Parenting",
  "Career & Life Coaching",
];

const languageOptions = ["English", "Hindi", "Hinglish"];

function TherapistProfileSetup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    bio: "",
    specializations: [],
    languages: [],
  });

  const [saving, setSaving] = useState(false);

  /* =========================================================
     GENERATE SLUG
  ========================================================== */

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  /* =========================================================
     HANDLE CHANGE
  ========================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const generatedSlug = generateSlug(value);

      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: generatedSlug,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     TOGGLE SELECTION
  ========================================================== */

  const toggleSelection = (field, value) => {
    setFormData((prev) => {
      const currentValues = prev[field];

      const exists = currentValues.includes(value);

      return {
        ...prev,
        [field]: exists
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  /* =========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.specializations.length === 0) {
      alert("Please select at least one specialization.");
      return;
    }

    if (formData.languages.length === 0) {
      alert("Please select at least one language.");
      return;
    }

    try {
      setSaving(true);

      /*
       * Backend API later:
       *
       * PATCH /therapists/me
       *
       * Payload:
       * {
       *   name,
       *   slug,
       *   bio,
       *   specializations,
       *   languages
       * }
       */

      console.log("Therapist profile:", formData);

      /*
       * Temporary demo delay.
       * Backend API connect hone ke baad
       * actual API call yahan hogi.
       */

      await new Promise((resolve) => setTimeout(resolve, 700));

      /*
       * IMPORTANT FLOW:
       *
       * Therapist Signup
       *        ↓
       * Therapist Profile Setup
       *        ↓
       * Login
       *        ↓
       * Therapist Dashboard
       *
       * Yahan dashboard par direct navigate NAHI karna.
       */

      navigate("/therapist/dashboard");
    } catch (error) {
      console.error("Therapist profile setup failed:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* Logo */}

          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <HeartHandshake size={21} />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">
                Unfazed
              </p>

              <p className="text-[10px] font-medium text-slate-500">
                Therapy. Together.
              </p>
            </div>
          </Link>

          {/* Back */}

          <Link
            to="/signup/therapist"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
          >
            <ArrowLeft size={14} />
            Back to Signup
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-4xl">
          {/* Heading */}

          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
              <Sparkles size={27} />
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Complete your therapist profile
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Set up the information clients will see on your public therapist
              profile.
            </p>
          </div>

          {/* Progress */}

          <div className="mx-auto mt-8 flex max-w-sm items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
                1
              </div>

              <span className="text-xs font-semibold text-violet-700">
                Profile
              </span>
            </div>

            <div className="mx-4 h-px w-16 bg-slate-200" />

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-400">
                2
              </div>

              <span className="text-xs font-medium text-slate-400">
                Dashboard
              </span>
            </div>
          </div>

          {/* =================================================
              PROFILE CARD
          ================================================== */}

          <div className="mt-10 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit}>
              {/* =================================================
                  BASIC INFORMATION
              ================================================== */}

              <div>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <User size={19} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Basic Information
                    </h2>

                    <p className="text-xs text-slate-500">
                      Add the basic details of your therapist profile.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Name */}

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-xs font-semibold text-slate-700"
                    >
                      Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                    />
                  </div>

                  {/* Profile Slug */}

                  <div>
                    <label
                      htmlFor="slug"
                      className="mb-2 block text-xs font-semibold text-slate-700"
                    >
                      Profile Slug
                    </label>

                    <div className="relative">
                      <Link2
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="slug"
                        name="slug"
                        type="text"
                        value={formData.slug}
                        readOnly
                        placeholder="your-profile-slug"
                        className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-600 outline-none"
                      />
                    </div>

                    <p className="mt-2 text-[11px] text-slate-400">
                      Your public profile:
                      <span className="ml-1 font-medium text-violet-600">
                        unfazed.in/
                        {formData.slug || "your-profile"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Bio */}

                <div className="mt-5">
                  <label
                    htmlFor="bio"
                    className="mb-2 block text-xs font-semibold text-slate-700"
                  >
                    Bio
                  </label>

                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={5}
                    maxLength={500}
                    placeholder="Tell clients about yourself, your approach to therapy, and how you support them..."
                    required
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />

                  <div className="mt-1 flex justify-end">
                    <span className="text-[11px] text-slate-400">
                      {formData.bio.length}/500
                    </span>
                  </div>
                </div>
              </div>

              {/* =================================================
                  SPECIALIZATIONS
              ================================================== */}

              <div className="mt-10 border-t border-slate-100 pt-8">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    Specializations
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Select the areas you specialize in.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {specializationOptions.map((item) => {
                    const selected = formData.specializations.includes(item);

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleSelection("specializations", item)}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                          selected
                            ? "border-violet-300 bg-violet-50 text-violet-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50/50"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            selected
                              ? "border-violet-600 bg-violet-600 text-white"
                              : "border-slate-300 text-transparent"
                          }`}
                        >
                          <Check size={12} />
                        </span>

                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* =================================================
                  LANGUAGES
              ================================================== */}

              <div className="mt-10 border-t border-slate-100 pt-8">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    Languages
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Select the languages you can provide therapy in.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {languageOptions.map((language) => {
                    const selected = formData.languages.includes(language);

                    return (
                      <button
                        key={language}
                        type="button"
                        onClick={() => toggleSelection("languages", language)}
                        className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                          selected
                            ? "border-violet-500 bg-violet-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600"
                        }`}
                      >
                        {language}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* =================================================
                  SAVE
              ================================================== */}

              <div className="mt-10 flex flex-col gap-5 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2">
                  <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-violet-600"
                  />

                  <p className="max-w-md text-[11px] leading-5 text-slate-400">
                    Your profile information will be used to create your public
                    therapist profile on Unfazed.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save & Continue
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Bottom Note */}

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Heart size={14} />

            <span>Your profile helps clients find the right therapist.</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TherapistProfileSetup;
