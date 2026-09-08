import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Edit3,
  HeartHandshake,
  Link2,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import {
  getMyTherapistProfile,
  updateMyTherapistProfile,
} from "../../api/therapistApi";

const specializationOptions = [
  "Anxiety & Stress",
  "Depression",
  "Relationships",
  "Trauma & PTSD",
  "Family & Parenting",
  "Career & Life Coaching",
];

const languageOptions = ["English", "Hindi", "Hinglish"];

function TherapistProfile() {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    bio: "",
    specializations: [],
    languages: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // GET MY THERAPIST PROFILE
  // =========================================================

  useEffect(() => {
    const fetchTherapistProfile = async () => {
      try {
        setLoading(true);

        const response = await getMyTherapistProfile();

        const data = response.data;

        const formattedProfile = {
          id: data._id,
          name: data.name || "",
          slug: data.slug || "",
          bio: data.bio || "",
          specializations: data.specializations || [],
          languages: data.languages || [],
        };

        setProfile(formattedProfile);
        setFormData(formattedProfile);
      } catch (error) {
        console.error("Failed to fetch therapist profile:", error);

        alert(
          error.response?.data?.message || "Unable to load therapist profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTherapistProfile();
  }, []);

  // =========================================================
  // GENERATE SLUG
  // =========================================================

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: generateSlug(value),
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // TOGGLE SELECTION
  // =========================================================

  const toggleSelection = (field, value) => {
    setFormData((prev) => {
      const exists = prev[field].includes(value);

      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((item) => item !== value)
          : [...prev[field], value],
      };
    });
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  // =========================================================
  // UPDATE PROFILE
  // =========================================================

  const handleSave = async (e) => {
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

      const response = await updateMyTherapistProfile({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        bio: formData.bio.trim(),
        specializations: formData.specializations,
        languages: formData.languages,
      });

      const data = response.data;

      const updatedProfile = {
        id: data._id,
        name: data.name || "",
        slug: data.slug || "",
        bio: data.bio || "",
        specializations: data.specializations || [],
        languages: data.languages || [],
      };

      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error("Therapist profile update failed:", error);

      alert(
        error.response?.data?.message ||
          "Unable to update therapist profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8fc] text-slate-900">
        <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-violet-200/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-indigo-200/20 blur-3xl" />

        <div className="relative rounded-[26px] border border-slate-200/80 bg-white px-8 py-7 text-center shadow-[0_24px_70px_-38px_rgba(15,23,42,0.24)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600">
            <HeartHandshake size={20} />
          </div>

          <p className="mt-4 text-sm font-extrabold text-slate-700">
            Loading your profile...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Fetching the information shown on your public therapist profile.
          </p>

          <div className="mx-auto mt-4 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // PROFILE NOT FOUND
  // =========================================================

  if (!profile) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8fc] text-slate-900">
        <div className="rounded-[26px] border border-red-100 bg-white p-8 text-center shadow-[0_24px_70px_-38px_rgba(15,23,42,0.24)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <UserRound size={20} />
          </div>

          <p className="mt-4 text-sm font-extrabold text-slate-800">
            Unable to load therapist profile
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Please return to your dashboard and try again.
          </p>

          <Link
            to="/therapist/dashboard"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
      <div className="pointer-events-none fixed -left-32 top-20 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />
      <div className="pointer-events-none fixed -right-28 top-10 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-100/20 blur-3xl" />
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/therapist/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
              <HeartHandshake size={19} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                Unfazed
              </p>

              <p className="text-[9px] text-slate-500">Therapist Dashboard</p>
            </div>
          </Link>

          <Link
            to="/therapist/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="relative px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">
          {/* Heading */}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/85 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-700 shadow-sm">
                <Sparkles size={12} />
                My Profile
              </span>

              <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Therapist Profile
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Keep your public profile clear, trustworthy, and up to date so
                clients know who you are before booking a session.
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-extrabold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-300"
              >
                <Edit3 size={15} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Card */}

          <section className="mt-7 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_24px_70px_-38px_rgba(15,23,42,0.24)]">
            {/* Profile Header */}

            <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-violet-50 via-white to-indigo-50/70 p-5 sm:p-7">
              <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-violet-100/60 blur-2xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br from-violet-100 to-indigo-100 text-2xl font-extrabold text-violet-700 shadow-sm ring-8 ring-white/70">
                {getInitials(profile.name)}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900">
                  {profile.name}
                    </h2>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-emerald-700">
                      Profile
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Therapist
                  </p>

                  <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl border border-violet-100 bg-white/85 px-3 py-2 text-xs font-bold text-violet-700 shadow-sm">
                    <Link2 size={13} />
                    unfazed.in/{profile.slug}
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                VIEW MODE
            ================================================== */}

            {!isEditing && (
              <div className="space-y-6 p-5 sm:p-7">
                {/* Basic Information */}

                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                      <UserRound size={17} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900">
                          Basic Information
                        </h3>

                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.12em] text-violet-700">
                          Step 1
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">
                        Your public therapist information.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <ProfileInfo label="Name" value={profile.name} />

                    <ProfileInfo
                      label="Profile Slug"
                      value={`unfazed.in/${profile.slug}`}
                    />
                  </div>
                </div>

                {/* Bio */}

                <div className="border-t border-slate-100 pt-7">
                  <h3 className="text-sm font-bold text-slate-900">Bio</h3>

                  <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                    {profile.bio}
                  </p>
                </div>

                {/* Specializations */}

                <div className="border-t border-slate-100 pt-7">
                  <h3 className="text-sm font-bold text-slate-900">
                    Specializations
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.specializations.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-violet-100 bg-violet-50 px-3.5 py-2 text-xs font-bold text-violet-700 shadow-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}

                <div className="border-t border-slate-100 pt-7">
                  <h3 className="text-sm font-bold text-slate-900">
                    Languages
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.languages.map((language) => (
                      <span
                        key={language}
                        className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Public Profile Note */}

                <div className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50/70 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-violet-600"
                    />

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Public Profile
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        This information is used on your branded therapist
                        profile that clients can view.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                EDIT MODE
            ================================================== */}

            {isEditing && (
              <form onSubmit={handleSave} className="space-y-8 p-5 sm:p-7">
                {/* Basic Information */}

                <div>
                  <div className="mb-5">
                    <h3 className="text-sm font-bold text-slate-900">
                      Basic Information
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Update the information shown on your public profile.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
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
                        required
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium text-slate-700 outline-none transition hover:border-violet-200 hover:bg-white focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                      />
                    </div>

                    {/* Slug */}

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
                          className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-600 outline-none"
                        />
                      </div>

                      <p className="mt-2 text-[11px] text-slate-400">
                        Generated from your name.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}

                <div className="border-t border-slate-100 pt-7">
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
                    rows={6}
                    maxLength={500}
                    required
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition hover:border-violet-200 hover:bg-white focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  />

                  <div className="mt-1 flex justify-end">
                    <span className="text-[11px] text-slate-400">
                      {formData.bio.length}/500
                    </span>
                  </div>
                </div>

                {/* Specializations */}

                <div className="border-t border-slate-100 pt-7">
                  <h3 className="text-sm font-bold text-slate-900">
                    Specializations
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Select the areas you specialize in.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {specializationOptions.map((item) => {
                      const selected = formData.specializations.includes(item);

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            toggleSelection("specializations", item)
                          }
                          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-xs font-bold transition ${
                            selected
                              ? "border-violet-300 bg-violet-50 text-violet-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-violet-200"
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

                {/* Languages */}

                <div className="border-t border-slate-100 pt-7">
                  <h3 className="text-sm font-bold text-slate-900">
                    Languages
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Select the languages you provide therapy in.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {languageOptions.map((language) => {
                      const selected = formData.languages.includes(language);

                      return (
                        <button
                          key={language}
                          type="button"
                          onClick={() => toggleSelection("languages", language)}
                          className={`rounded-full border px-5 py-2 text-xs font-semibold transition ${
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

                {/* Save */}

                <div className="flex flex-col gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/70 via-white to-indigo-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={17} className="mt-0.5 shrink-0 text-violet-600" />
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">
                        Ready to publish your changes?
                      </p>
                      <p className="mt-0.5 text-[10px] leading-5 text-slate-400">
                        Your public therapist profile will use the updated
                        information after you save.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X size={15} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-xs font-extrabold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  </div>
                </div>
              </form>
            )}
          </section>

          {/* Bottom Note */}

          <div className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] font-medium text-slate-400">
            <ShieldCheck size={13} className="text-violet-400" />
            Keep your therapist profile accurate so clients can make informed
            booking decisions.
          </div>
        </div>
      </main>
    </div>
  );
}

// =========================================================
// PROFILE INFO
// =========================================================

function ProfileInfo({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

// =========================================================
// HELPERS
// =========================================================

function getInitials(name) {
  if (!name) {
    return "";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default TherapistProfile;
