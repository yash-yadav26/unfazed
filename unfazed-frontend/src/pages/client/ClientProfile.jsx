import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  HeartHandshake,
  Mail,
  Phone,
  Save,
  UserRound,
} from "lucide-react";

function ClientProfile() {
  const [client, setClient] = useState({
    name: "Yash Yadav",
    email: "yash@example.com",
    phone: "+91 98765 43210",
    age: "24",
    gender: "Male",
    occupation: "Software Developer",
  });

  const [editMode, setEditMode] = useState(false);

  const [editForm, setEditForm] = useState({
    name: client.name,
    phone: client.phone,
    age: client.age,
    gender: client.gender,
    occupation: client.occupation,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    /*
      Backend later:

      PATCH /clients/me
    */

    setClient((prev) => ({
      ...prev,
      ...editForm,
    }));

    setEditMode(false);

    console.log("PATCH /clients/me", editForm);
  };

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
                  icon={<Mail size={16} />}
                  label="Email"
                  value={client.email}
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
                      className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                    />
                  </FormField>

                  {/* Email */}
                  <FormField label="Email">
                    <input
                      type="email"
                      value={client.email}
                      disabled
                      className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-400 outline-none"
                    />

                    <p className="mt-1 text-[10px] text-slate-400">
                      Email is linked to your account.
                    </p>
                  </FormField>

                  {/* Phone */}
                  <FormField label="Phone Number">
                    <input
                      name="phone"
                      value={editForm.phone}
                      onChange={handleChange}
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
                      className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                    />
                  </FormField>

                  {/* Gender */}
                  <FormField label="Gender">
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleChange}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                    >
                      <option value="Female">Female</option>

                      <option value="Male">Male</option>

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
                    className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-xs font-semibold text-white transition hover:bg-violet-700"
                  >
                    <Save size={14} />
                    Save Changes
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

/* =========================================================
   INFO CARD
========================================================= */

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

/* =========================================================
   FORM FIELD
========================================================= */

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

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default ClientProfile;
