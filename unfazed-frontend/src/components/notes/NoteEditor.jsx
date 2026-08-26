import { useState } from "react";
import { Bold, Check, Italic, List, LockKeyhole, Share2 } from "lucide-react";

function NoteEditor({ initialNote, onSave, onCancel }) {
  const [type, setType] = useState(initialNote?.type || "PRIVATE");
  const [content, setContent] = useState(initialNote?.content || "");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("Please write something in the note.");
      return;
    }

    onSave({
      type,
      content: content.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* =================================================
          NOTE TYPE
      ================================================== */}

      <div>
        <label className="mb-3 block text-xs font-bold text-slate-700">
          Note Type
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Private */}
          <button
            type="button"
            onClick={() => setType("PRIVATE")}
            className={`rounded-xl border p-4 text-left transition ${
              type === "PRIVATE"
                ? "border-amber-300 bg-amber-50"
                : "border-slate-200 bg-white hover:border-amber-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  type === "PRIVATE"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <LockKeyhole size={17} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">Private</p>

                  {type === "PRIVATE" && (
                    <Check size={16} className="text-amber-600" />
                  )}
                </div>

                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Only you can access this note.
                </p>
              </div>
            </div>
          </button>

          {/* Shared */}
          <button
            type="button"
            onClick={() => setType("SHARED")}
            className={`rounded-xl border p-4 text-left transition ${
              type === "SHARED"
                ? "border-emerald-300 bg-emerald-50"
                : "border-slate-200 bg-white hover:border-emerald-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  type === "SHARED"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Share2 size={17} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">Shared</p>

                  {type === "SHARED" && (
                    <Check size={16} className="text-emerald-600" />
                  )}
                </div>

                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Therapist and client can access this note.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* =================================================
          EDITOR
      ================================================== */}

      <div className="mt-6">
        <label
          htmlFor="noteContent"
          className="mb-2 block text-xs font-bold text-slate-700"
        >
          Session Note
        </label>

        {/* Toolbar */}
        <div className="flex items-center gap-1 rounded-t-xl border border-slate-200 bg-slate-50 px-2 py-2">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-700"
            title="Bold"
          >
            <Bold size={15} />
          </button>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-700"
            title="Italic"
          >
            <Italic size={15} />
          </button>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-700"
            title="List"
          >
            <List size={15} />
          </button>
        </div>

        <textarea
          id="noteContent"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          placeholder="Write your session note here..."
          className="w-full resize-none rounded-b-xl border border-t-0 border-slate-200 px-4 py-4 text-sm leading-6 text-slate-700 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
        />
      </div>

      {/* =================================================
          PRIVACY MESSAGE
      ================================================== */}

      <div
        className={`mt-4 rounded-xl p-3 ${
          type === "PRIVATE" ? "bg-amber-50" : "bg-emerald-50"
        }`}
      >
        <p
          className={`text-xs font-medium ${
            type === "PRIVATE" ? "text-amber-700" : "text-emerald-700"
          }`}
        >
          {type === "PRIVATE"
            ? "Private note: only authorized therapists can access this note."
            : "Shared note: this note may be shown in the client portal."}
        </p>
      </div>

      {/* =================================================
          ACTIONS
      ================================================== */}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-violet-600 px-5 text-xs font-bold text-white transition hover:bg-violet-700"
        >
          <Check size={15} />
          {initialNote ? "Save Changes" : "Save Note"}
        </button>
      </div>
    </form>
  );
}

export default NoteEditor;
