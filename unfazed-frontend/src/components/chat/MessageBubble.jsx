import { Check, CheckCheck } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                            Message Bubble                                  */
/* -------------------------------------------------------------------------- */

/**
 * Common message bubble for Client and Therapist chat.
 *
 * Props:
 * - message: message object from backend
 * - isOwnMessage: whether the message belongs to logged-in user
 */
const MessageBubble = ({ message, isOwnMessage = false }) => {
  if (!message) {
    return null;
  }

  const formattedTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={`flex w-full ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isOwnMessage
            ? "rounded-br-md bg-slate-900 text-white"
            : "rounded-bl-md bg-white text-slate-900"
        }`}
      >
        {/* ---------------------------------------------------------------- */}
        {/*                              Message                              */}
        {/* ---------------------------------------------------------------- */}

        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.message}
        </p>

        {/* ---------------------------------------------------------------- */}
        {/*                           Time + Read                             */}
        {/* ---------------------------------------------------------------- */}

        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${
            isOwnMessage ? "text-slate-300" : "text-slate-400"
          }`}
        >
          <span>{formattedTime}</span>

          {isOwnMessage &&
            (message.isRead ? (
              <CheckCheck className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            ))}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
