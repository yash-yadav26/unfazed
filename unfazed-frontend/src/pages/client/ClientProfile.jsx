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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  // ===============================
  // Profile Not Found
  // ===============================

  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-red-500">Unable to load profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link to="/client" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white">
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

      <main className="px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Heading */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                My Profile
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
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
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
              >
                <Edit3 size={15} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Card */}

          <section className="mt-7 rounded-2xl border border-slate-200 bg-white">
            {/* Profile Header */}

            <div className="border-b border-slate-100 px-5 py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-lg font-bold text-violet-700">
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
              <div className="grid gap-5 p-5 sm:grid-cols-2">
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
              <form onSubmit={handleSave} className="space-y-5 p-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Name */}

                  <FormField label="Full Name">
                    <input
                      name="name"
                      value={editForm.name}
                      onChange={handleChange}
                      required
                      className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                    />
                  </FormField>

                  {/* Phone */}

                  <FormField label="Phone Number">
                    <input
                      name="phone"
                      value={editForm.phone}
                      onChange={handleChange}
                      required
                      className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
                      className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                    />
                  </FormField>

                  {/* Gender */}

                  <FormField label="Gender">
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleChange}
                      required
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
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
                      className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                    />
                  </FormField>
                </div>

                {/* Actions */}

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-5">
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
                    className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
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
