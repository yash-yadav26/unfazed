import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  HeartHandshake,
  Phone,
  Save,
  UserRound,
} from "lucide-react";

import { getMyClientProfile, updateMyClientProfile } from "../../api/clientApi";

function ClientProfile() {
  const [client, setClient] = useState(null);

  const [editMode, setEditMode] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    occupation: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ===============================
  // Get My Client Profile
  // ===============================

  useEffect(() => {
    const fetchClientProfile = async () => {
      try {
        setLoading(true);

        const response = await getMyClientProfile();

        const data = response.data;

        const formattedClient = {
          id: data._id,
          name: data.name || "",
          phone: data.phone || "",
          age:
            data.age !== undefined && data.age !== null ? String(data.age) : "",
          gender: formatGender(data.gender),
          occupation: data.occupation || "",
        };

        setClient(formattedClient);

        setEditForm({
          name: formattedClient.name,
          phone: formattedClient.phone,
          age: formattedClient.age,
          gender: formattedClient.gender,
          occupation: formattedClient.occupation,
        });
      } catch (error) {
        console.error("Failed to fetch client profile:", error);

        alert(error.response?.data?.message || "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientProfile();
  }, []);

  // ===============================
  // Handle Input Change
  // ===============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===============================
  // Update Client Profile
  // ===============================

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await updateMyClientProfile({
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        age: Number(editForm.age),
        gender: normalizeGender(editForm.gender),
        occupation: editForm.occupation.trim(),
      });

      const data = response.data;

      const updatedClient = {
        id: data._id,
        name: data.name || "",
        phone: data.phone || "",
        age:
          data.age !== undefined && data.age !== null ? String(data.age) : "",
        gender: formatGender(data.gender),
        occupation: data.occupation || "",
      };

      setClient(updatedClient);

      setEditForm({
        name: updatedClient.name,
        phone: updatedClient.phone,
        age: updatedClient.age,
        gender: updatedClient.gender,
        occupation: updatedClient.occupation,
      });

      setEditMode(false);
    } catch (error) {
      console.error("Client profile update failed:", error);

      alert(
        error.response?.data?.message ||
          "Unable to update profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // Loading State
  // ===============================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <p className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-500 shadow-sm">
          Loading profile...
        </p>
      </div>
    );
  }

  // ===============================
  // Profile Not Found
  // ===============================

  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <p className="rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm font-semibold text-red-600 shadow-sm">
          Unable to load profile.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f8fc] text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link to="/client" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
              <HeartHandshake size={19} />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                Unfazed
              </p>

              <p className="text-[9px] text-slate-500">Client Portal</p>
            </div>
          </Link>

          <Link
            to="/client"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="pointer-events-none fixed -left-32 top-24 h-80 w-80 rounded-full bg-violet-200/20 blur-3xl" />
      <div className="pointer-events-none fixed -right-28 top-20 h-96 w-96 rounded-full bg-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-100/15 blur-3xl" />

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="relative px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-3xl">
          {/* Heading */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/85 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
                  My Profile
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                Profile Details
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                View and update your basic personal information.
              </p>
            </div>

            {!editMode && (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md"
              >
                <Edit3 size={15} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Card */}

          <section className="relative mt-7 overflow-hidden rounded-[30px] border border-violet-100/80 bg-white shadow-[0_24px_70px_-38px_rgba(99,102,241,0.30)]">
            {/* Profile Header */}

            <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-white via-violet-50/45 to-indigo-50/45 px-5 py-7">
              <div className="relative flex items-center gap-4">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-600 text-xl font-extrabold text-white shadow-xl shadow-violet-200 ring-8 ring-white">
                  {getInitials(client.name)}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {client.name}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">Client Profile</p>
                </div>
              </div>
            </div>

            {/* View */}

            {!editMode && (
              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <InfoCard
                  icon={<UserRound size={16} />}
                  label="Full Name"
                  value={client.name}
                />

                <InfoCard
                  icon={<Phone size={16} />}
                  label="Phone"
                  value={client.phone}
                />

                <InfoCard
                  icon={<UserRound size={16} />}
                  label="Age"
                  value={client.age}
                />

                <InfoCard
                  icon={<UserRound size={16} />}
                  label="Gender"
                  value={client.gender}
                />

                <InfoCard
                  icon={<UserRound size={16} />}
                  label="Occupation"
                  value={client.occupation}
                />
              </div>
            )}

            {/* Edit Form */}

            {editMode && (
              <form onSubmit={handleSave} className="space-y-6 p-5 sm:p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Name */}

                  <FormField label="Full Name">
                    <input
                      name="name"
                      value={editForm.name}
                      onChange={handleChange}
                      required
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium text-slate-700 outline-none transition hover:border-violet-200 hover:bg-white focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    />
                  </FormField>

                  {/* Phone */}

                  <FormField label="Phone Number">
                    <input
                      name="phone"
                      value={editForm.phone}
                      onChange={handleChange}
                      required
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium text-slate-700 outline-none transition hover:border-violet-200 hover:bg-white focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    />
                  </FormField>

                  {/* Age */}

                  <FormField label="Age">
                    <input
                      name="age"
                      type="number"
                      value={editForm.age}
                      onChange={handleChange}
                      required
                      min="1"
                      max="120"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium text-slate-700 outline-none transition hover:border-violet-200 hover:bg-white focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    />
                  </FormField>

                  {/* Gender */}

                  <FormField label="Gender">
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleChange}
                      required
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium text-slate-700 outline-none transition hover:border-violet-200 hover:bg-white focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    >
                      <option value="Male">Male</option>

                      <option value="Female">Female</option>

                      <option value="Other">Other</option>

                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                  </FormField>

                  {/* Occupation */}

                  <FormField label="Occupation">
                    <input
                      name="occupation"
                      value={editForm.occupation}
                      onChange={handleChange}
                      required
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-sm font-medium text-slate-700 outline-none transition hover:border-violet-200 hover:bg-white focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    />
                  </FormField>
                </div>

                {/* Actions */}

                <div className="flex flex-col justify-end gap-2 border-t border-slate-100 pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({
                        name: client.name,
                        phone: client.phone,
                        age: client.age,
                        gender: client.gender,
                        occupation: client.occupation,
                      });

                      setEditMode(false);
                    }}
                    disabled={saving}
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 text-xs font-bold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={14} />

                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

// =========================================================
// INFO CARD
// =========================================================

function InfoCard({ icon, label, value }) {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-4.5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-100 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-violet-700 shadow-sm transition group-hover:scale-[1.03]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-slate-700">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// FORM FIELD
// =========================================================

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-700">
        {label}
      </label>

      {children}
    </div>
  );
}

// =========================================================
// GENDER HELPERS
// =========================================================

function formatGender(gender) {
  const genderMap = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
    PREFER_NOT_TO_SAY: "Prefer not to say",
  };

  return genderMap[gender] || "";
}

function normalizeGender(gender) {
  const genderMap = {
    Male: "MALE",
    Female: "FEMALE",
    Other: "OTHER",
    "Prefer not to say": "PREFER_NOT_TO_SAY",
  };

  return genderMap[gender] || gender;
}

// =========================================================
// GET INITIALS
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

export default ClientProfile;
