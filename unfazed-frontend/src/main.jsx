import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster, toast } from "react-hot-toast";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

import "./index.css";
import App from "./App.jsx";

export const PremiumToast = ({ t, type, message }) => {
  const isSuccess = type === "success";

  return (
    <div
      className={`pointer-events-auto flex w-[calc(100vw-32px)] max-w-[420px] items-center gap-3.5 overflow-hidden rounded-2xl border bg-white/95 px-4 py-3.5 shadow-[0_24px_70px_-20px_rgba(15,23,42,0.32)] backdrop-blur-xl transition-all duration-300 sm:w-[420px] ${
        isSuccess
          ? "border-emerald-100 ring-1 ring-emerald-50"
          : "border-red-100 ring-1 ring-red-50"
      } ${
        t.visible
          ? "translate-y-0 scale-100 opacity-100"
          : "translate-y-2 scale-[0.98] opacity-0"
      }`}
    >
      <div
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isSuccess
            ? "bg-emerald-50 text-emerald-600"
            : "bg-red-50 text-red-600"
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 size={21} strokeWidth={2.2} />
        ) : (
          <CircleAlert size={21} strokeWidth={2.2} />
        )}

        <span
          className={`absolute inset-0 rounded-xl border ${
            isSuccess ? "border-emerald-200/60" : "border-red-200/60"
          }`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold leading-5 text-slate-900 sm:text-sm">
          {isSuccess ? "Success" : "Something went wrong"}
        </p>

        <p className="mt-0.5 break-words text-[11px] font-medium leading-5 text-slate-500 sm:text-xs">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => toast.dismiss(t.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />

    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={10}
      containerStyle={{
        top: 14,
        right: 0,
        left: 0,
        width: "100%",
        padding: "0 16px",
        display: "flex",
        justifyContent: "flex-end",
        pointerEvents: "none",
      }}
      toastOptions={{
        duration: 4500,
      }}
    >
      {(t) => (
        <PremiumToast
          t={t}
          type={t.type}
          message={t.message}
        />
      )}
    </Toaster>
  </StrictMode>,
);
