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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  // =========================================================
  // PROFILE NOT FOUND
  // =========================================================

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-red-500">
          Unable to load therapist profile.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/therapist/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
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
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-violet-600"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          {/* Heading */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                My Profile
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Therapist Profile
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage the information clients see on your public therapist
                profile.
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white shadow-md shadow-violet-100 transition hover:bg-violet-700"
              >
                <Edit3 size={15} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Card */}

          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            {/* Profile Header */}

            <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-2xl font-bold text-violet-700">
                {getInitials(profile.name)}
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {profile.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">Therapist</p>

                <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700">
                  <Link2 size={13} />
                  unfazed.in/{profile.slug}
                </div>
              </div>
            </div>

            {/* =================================================
                VIEW MODE
            ================================================== */}

            {!isEditing && (
              <div className="mt-7 space-y-7">
                {/* Basic Information */}

                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                      <UserRound size={17} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Basic Information
                      </h3>

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
                        className="rounded-full bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700"
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
                        className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Public Profile Note */}

                <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
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
              <form onSubmit={handleSave} className="mt-7 space-y-8">
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
                        className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-xs font-medium transition ${
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

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X size={15} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-xs font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={16} />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Bottom Note */}

          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <HeartHandshake size={14} />
            <span>Keep your therapist profile information up to date.</span>
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
    <div className="rounded-xl bg-slate-50 p-4">
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
