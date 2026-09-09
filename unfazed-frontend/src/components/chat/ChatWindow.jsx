import { useEffect, useRef, useState } from "react";
import { Circle, MoreVertical, Send, User } from "lucide-react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

import { getChatMessages, markMessagesAsRead } from "../../api/chatApi";

import MessageBubble from "./MessageBubble";

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");

/* -------------------------------------------------------------------------- */
/*                             Chat Window                                    */
/* -------------------------------------------------------------------------- */

/**
 * Common chat window for:
 *
 * CLIENT <-> THERAPIST
 *
 * Props:
 * - otherUserId   : Client/Therapist profile ID
 * - otherUserName : Name shown in chat header
 */
const ChatWindow = ({ otherUserId, otherUserName = "User" }) => {
  /* ------------------------------------------------------------------------ */
  /*                                  State                                   */
  /* ------------------------------------------------------------------------ */

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const [socketConnected, setSocketConnected] = useState(false);
  const [chatJoined, setChatJoined] = useState(false);

  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [error, setError] = useState("");

  /* ------------------------------------------------------------------------ */
  /*                                  Refs                                    */
  /* ------------------------------------------------------------------------ */

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* ------------------------------------------------------------------------ */
  /*                          Scroll To Bottom                                */
  /* ------------------------------------------------------------------------ */

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  /* ------------------------------------------------------------------------ */
  /*                            Load Chat History                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let isMounted = true;

    const loadChat = async () => {
      if (!otherUserId) {
        setMessages([]);
        setLoadingMessages(false);
        return;
      }

      try {
        setLoadingMessages(true);
        setError("");

        const response = await getChatMessages(otherUserId);

        if (!isMounted) {
          return;
        }

        setMessages(response?.data || []);

        /*
         * Once the chat is opened and messages are visible,
         * mark received unread messages as read.
         */
        await markMessagesAsRead(otherUserId);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load chat.";

        setError(message);
        toast.error(message);
      } finally {
        if (isMounted) {
          setLoadingMessages(false);
        }
      }
    };

    loadChat();

    return () => {
      isMounted = false;
    };
  }, [otherUserId]);

  /* ------------------------------------------------------------------------ */
  /*                         Socket.io Connection                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!otherUserId) {
      return undefined;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      const errorTimer = setTimeout(() => {
        const message = "Authentication token not found.";
        setError(message);
        toast.error(message);
      }, 0);

      return () => clearTimeout(errorTimer);
    }

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    /* ---------------------------------------------------------------------- */
    /*                              Connect                                   */
    /* ---------------------------------------------------------------------- */

    socket.on("connect", () => {
      setSocketConnected(true);
      setChatJoined(false);
      setError("");
      setIsOtherUserTyping(false);

      socket.emit(
        "join-chat",
        {
          userId: otherUserId,
        },
        (response) => {
          if (!response?.success) {
            setChatJoined(false);

            const message = response?.message || "Unable to join chat.";
            setError(message);
            toast.error(message);

            return;
          }

          setChatJoined(true);
        },
      );
    });

    /* ---------------------------------------------------------------------- */
    /*                           Connection Error                              */
    /* ---------------------------------------------------------------------- */

    socket.on("connect_error", (err) => {
      setSocketConnected(false);
      setChatJoined(false);

      const message = err?.message || "Unable to connect to chat server.";

      setError(message);
      toast.error(message);
    });

    /* ---------------------------------------------------------------------- */
    /*                           Chat Joined                                  */
    /* ---------------------------------------------------------------------- */

    socket.on("chat-joined", (response) => {
      if (!response?.success) {
        setChatJoined(false);

        const message = response?.message || "Unable to join chat.";
        setError(message);
        toast.error(message);

        return;
      }

      setChatJoined(true);
    });

    /* ---------------------------------------------------------------------- */
    /*                         Receive New Message                             */
    /* ---------------------------------------------------------------------- */

    socket.on("new-message", (response) => {
      if (!response?.success || !response?.message) {
        return;
      }

      const newMessage = response.message;

      setMessages((previousMessages) => {
        const alreadyExists = previousMessages.some(
          (message) => String(message._id) === String(newMessage._id),
        );

        if (alreadyExists) {
          return previousMessages;
        }

        return [...previousMessages, newMessage];
      });

      /*
       * If the chat window is open, newly visible incoming
       * messages are immediately marked as read.
       */
      markMessagesAsRead(otherUserId).catch(() => {
        /*
         * Read-status failure should not break the chat.
         */
      });
    });

    /* ---------------------------------------------------------------------- */
    /*                              Typing                                    */
    /* ---------------------------------------------------------------------- */

    socket.on("typing", () => {
      setIsOtherUserTyping(true);
    });

    socket.on("stop-typing", () => {
      setIsOtherUserTyping(false);
    });

    /* ---------------------------------------------------------------------- */
    /*                             Chat Error                                 */
    /* ---------------------------------------------------------------------- */

    socket.on("chat-error", (response) => {
      const message = response?.message || "Chat operation failed.";
      setError(message);
      toast.error(message);
    });

    /* ---------------------------------------------------------------------- */
    /*                           Disconnect                                   */
    /* ---------------------------------------------------------------------- */

    socket.on("disconnect", () => {
      setSocketConnected(false);
      setChatJoined(false);
      setIsOtherUserTyping(false);
    });

    /* ---------------------------------------------------------------------- */
    /*                              Cleanup                                   */
    /* ---------------------------------------------------------------------- */

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      socket.emit("leave-chat");

      socket.removeAllListeners();
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [otherUserId]);

  /* ------------------------------------------------------------------------ */
  /*                          Scroll On Messages                              */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOtherUserTyping]);

  /* ------------------------------------------------------------------------ */
  /*                            Send Message                                  */
  /* ------------------------------------------------------------------------ */

  const handleSendMessage = (event) => {
    event.preventDefault();

    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) {
      return;
    }

    const socket = socketRef.current;

    if (!socket?.connected) {
      const message = "Chat is not connected.";
      setError(message);
      toast.error(message);
      return;
    }

    if (!chatJoined) {
      const message = "Please wait for the chat connection.";
      setError(message);
      toast.loading(message, { id: "chat-connection-wait" });
      return;
    }

    if (sendingMessage) {
      return;
    }

    setSendingMessage(true);
    setError("");
    toast.dismiss("chat-connection-wait");
    toast.loading("Sending message...", { id: "chat-send" });

    socket.emit(
      "send-message",
      {
        userId: otherUserId,
        message: trimmedMessage,
      },
      (response) => {
        setSendingMessage(false);

        if (!response?.success) {
          const message = response?.message || "Unable to send message.";

          setError(message);
          toast.error(message);

          return;
        }

        /*
         * Do not append manually here.
         * Backend sends "new-message" to the room
         * and that event updates the messages state.
         */
        setMessageText("");
        toast.dismiss("chat-send");
        toast.success("Message sent.");
      },
    );
  };

  /* ------------------------------------------------------------------------ */
  /*                           Typing Handler                                 */
  /* ------------------------------------------------------------------------ */

  const handleTyping = (event) => {
    const value = event.target.value;

    setMessageText(value);

    const socket = socketRef.current;

    if (!socket?.connected || !chatJoined) {
      return;
    }

    socket.emit("typing");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing");
    }, 700);
  };

  /* ------------------------------------------------------------------------ */
  /*                         Enter Key Handler                                */
  /* ------------------------------------------------------------------------ */

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(event);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                             Render                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="flex h-full min-h-[500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ------------------------------------------------------------------ */}
      {/*                            Header                                  */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
            <User className="h-5 w-5 text-slate-600" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">{otherUserName}</h2>

            <div className="flex items-center gap-1.5 text-xs">
              <Circle
                className={`h-2 w-2 fill-current ${
                  socketConnected && chatJoined
                    ? "text-green-500"
                    : "text-slate-400"
                }`}
              />

              <span className="text-slate-500">
                {socketConnected && chatJoined ? "Online" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*                              Error                                  */}
      {/* ------------------------------------------------------------------ */}

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*                           Messages                                  */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-5">
        {loadingMessages ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                <User className="h-6 w-6 text-slate-400" />
              </div>

              <p className="font-medium text-slate-700">No messages yet</p>

              <p className="mt-1 text-sm text-slate-500">
                Start the conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwnMessage={String(message.senderId) !== String(otherUserId)}
              />
            ))}

            {isOtherUserTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  Typing...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*                              Input                                  */}
      {/* ------------------------------------------------------------------ */}

      <form
        onSubmit={handleSendMessage}
        className="border-t border-slate-200 bg-white p-4"
      >
        <div className="flex items-end gap-3">
          <textarea
            value={messageText}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            maxLength={2000}
            disabled={!chatJoined || sendingMessage}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <button
            type="submit"
            disabled={!messageText.trim() || !chatJoined || sendingMessage}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 text-right text-xs text-slate-400">
          {messageText.length}/2000
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
