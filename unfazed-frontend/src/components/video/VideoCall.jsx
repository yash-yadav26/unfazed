import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Loader2,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// http://localhost:5000/api -> http://localhost:5000
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const VideoCall = () => {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [error, setError] = useState("");
  const [remoteConnected, setRemoteConnected] = useState(false);
  const displayedError = error || (!sessionId ? "Invalid session." : "");

  // ------------------------------------------------------------
  // Get ICE servers
  // ------------------------------------------------------------
  const getIceServers = useCallback(() => {
    return [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ];
  }, []);

  // ------------------------------------------------------------
  // Create Peer Connection
  // ------------------------------------------------------------
  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: getIceServers(),
    });

    peerConnectionRef.current = peerConnection;

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    // Remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;

      if (remoteStream && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        setRemoteConnected(true);
        setConnectionStatus("Connected");
      }
    };

    // ICE candidate
    peerConnection.onicecandidate = (event) => {
      if (!event.candidate || !socketRef.current) {
        return;
      }

      socketRef.current.emit("ice-candidate", {
        sessionId,
        candidate: event.candidate,
      });
    };

    // Connection state
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;

      if (state === "connected") {
        setConnectionStatus("Connected");
        setRemoteConnected(true);
      }

      if (state === "connecting") {
        setConnectionStatus("Connecting...");
      }

      if (state === "disconnected") {
        setConnectionStatus("Disconnected");
      }

      if (state === "failed") {
        setConnectionStatus("Connection failed");
      }

      if (state === "closed") {
        setConnectionStatus("Call ended");
      }
    };

    return peerConnection;
  }, [getIceServers, sessionId]);

  // ------------------------------------------------------------
  // Create Offer
  // ------------------------------------------------------------
  const createOffer = useCallback(async () => {
    try {
      const peerConnection = createPeerConnection();

      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      socketRef.current?.emit("offer", {
        sessionId,
        offer,
      });
    } catch (err) {
      console.error("Offer creation failed:", err);
      setError("Unable to start the video connection.");
    }
  }, [createPeerConnection, sessionId]);

  // ------------------------------------------------------------
  // Handle Offer
  // ------------------------------------------------------------
  const handleOffer = useCallback(async (offer) => {
    try {
      const peerConnection = createPeerConnection();

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer),
      );

      const answer = await peerConnection.createAnswer();

      await peerConnection.setLocalDescription(answer);

      socketRef.current?.emit("answer", {
        sessionId,
        answer,
      });
    } catch (err) {
      console.error("Offer handling failed:", err);
      setError("Unable to establish the video connection.");
    }
  }, [createPeerConnection, sessionId]);

  // ------------------------------------------------------------
  // Handle Answer
  // ------------------------------------------------------------
  const handleAnswer = async (answer) => {
    try {
      const peerConnection = peerConnectionRef.current;

      if (!peerConnection) {
        return;
      }

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
    } catch (err) {
      console.error("Answer handling failed:", err);
      setError("Unable to complete the video connection.");
    }
  };

  // ------------------------------------------------------------
  // Handle ICE Candidate
  // ------------------------------------------------------------
  const handleIceCandidate = async (candidate) => {
    try {
      const peerConnection = peerConnectionRef.current;

      if (!peerConnection) {
        return;
      }

      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("ICE candidate error:", err);
    }
  };

  // ------------------------------------------------------------
  // Get Camera + Microphone
  // ------------------------------------------------------------
  const startLocalStream = async () => {
    try {
      setConnectionStatus("Requesting camera...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setConnectionStatus("Waiting for participant...");
    } catch (err) {
      console.error("Media permission error:", err);

      setError(
        "Camera and microphone permission is required to join the call.",
      );

      setConnectionStatus("Media access denied");
    }
  };

  // ------------------------------------------------------------
  // Toggle Microphone
  // ------------------------------------------------------------
  const toggleMute = () => {
    const stream = localStreamRef.current;

    if (!stream) {
      return;
    }

    const audioTracks = stream.getAudioTracks();

    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted((prev) => !prev);
  };

  // ------------------------------------------------------------
  // Toggle Camera
  // ------------------------------------------------------------
  const toggleCamera = () => {
    const stream = localStreamRef.current;

    if (!stream) {
      return;
    }

    const videoTracks = stream.getVideoTracks();

    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsCameraOff((prev) => !prev);
  };

  // ------------------------------------------------------------
  // Leave Call
  // ------------------------------------------------------------
  const leaveCall = () => {
    try {
      if (socketRef.current) {
        socketRef.current.emit("leave-room", {
          sessionId,
        });

        socketRef.current.disconnect();
        socketRef.current = null;
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });

        localStreamRef.current = null;
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    } catch (err) {
      console.error("Leave call error:", err);
    }

    navigate(-1);
  };

  // ------------------------------------------------------------
  // Main Socket + WebRTC Setup
  // ------------------------------------------------------------
  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let mounted = true;
    const localVideo = localVideoRef.current;
    const remoteVideo = remoteVideoRef.current;

    const initializeCall = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication token not found.");
          return;
        }

        await startLocalStream();

        if (!mounted) {
          return;
        }

        const socket = io(SOCKET_URL, {
          auth: {
            token,
          },
          transports: ["websocket"],
        });

        socketRef.current = socket;

        // ------------------------------------------------------
        // Socket Connected
        // ------------------------------------------------------
        socket.on("connect", () => {
          setConnectionStatus("Joining session...");

          socket.emit(
            "join-room",
            {
              sessionId,
            },
            (response) => {
              if (!response?.success) {
                setError(response?.message || "Unable to join the session.");

                setConnectionStatus("Unable to join");
                return;
              }

              setConnectionStatus(
                response.peerCount > 1
                  ? "Connecting..."
                  : "Waiting for participant...",
              );
            },
          );
        });

        // ------------------------------------------------------
        // Room Joined
        // ------------------------------------------------------
        socket.on("room-joined", (data) => {
          if (data?.peerCount >= 2) {
            setConnectionStatus("Connecting...");
          } else {
            setConnectionStatus("Waiting for participant...");
          }
        });

        // ------------------------------------------------------
        // Other Participant Joined
        // ------------------------------------------------------
        socket.on("participant-joined", async () => {
          try {
            setRemoteConnected(false);
            setConnectionStatus("Connecting...");

            // Current participant becomes offerer
            await createOffer();
          } catch (err) {
            console.error("Participant joined handling failed:", err);
          }
        });

        // ------------------------------------------------------
        // Offer Received
        // ------------------------------------------------------
        socket.on("offer", async ({ offer }) => {
          await handleOffer(offer);
        });

        // ------------------------------------------------------
        // Answer Received
        // ------------------------------------------------------
        socket.on("answer", async ({ answer }) => {
          await handleAnswer(answer);
        });

        // ------------------------------------------------------
        // ICE Candidate
        // ------------------------------------------------------
        socket.on("ice-candidate", async ({ candidate }) => {
          await handleIceCandidate(candidate);
        });

        // ------------------------------------------------------
        // Participant Left
        // ------------------------------------------------------
        socket.on("participant-left", () => {
          setRemoteConnected(false);
          setConnectionStatus("Participant left the call.");

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }

          if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
          }
        });

        // ------------------------------------------------------
        // Socket Error
        // ------------------------------------------------------
        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err);

          setError(err?.message || "Unable to connect to video server.");

          setConnectionStatus("Connection failed");
        });

        socket.on("error", (err) => {
          console.error("Socket error:", err);

          setError(
            typeof err === "string" ? err : err?.message || "Video call error.",
          );
        });
      } catch (err) {
        console.error("Video call initialization failed:", err);

        setError(err?.message || "Unable to initialize video call.");

        setConnectionStatus("Call initialization failed");
      }
    };

    initializeCall();

    // ----------------------------------------------------------
    // Cleanup
    // ----------------------------------------------------------
    return () => {
      mounted = false;

      if (socketRef.current) {
        socketRef.current.emit("leave-room", {
          sessionId,
        });

        socketRef.current.disconnect();
        socketRef.current = null;
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });

        localStreamRef.current = null;
      }

      if (localVideo) {
        localVideo.srcObject = null;
      }

      if (remoteVideo) {
        remoteVideo.srcObject = null;
      }
    };
  }, [sessionId, createOffer, handleOffer]);

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0b0b0f] px-4 py-6 text-white">
      <div className="mx-auto flex min-h-[90vh] max-w-7xl flex-col">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Video Session</h1>

            <p className="mt-1 text-sm text-white/50">{connectionStatus}</p>
          </div>

          <button
            onClick={leaveCall}
            className="flex items-center gap-2 rounded-xl bg-red-500/15 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/25"
          >
            <PhoneOff size={17} />
            Leave
          </button>
        </div>

        {/* Error */}
        {displayedError && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />

            <span>{displayedError}</span>
          </div>
        )}

        {/* Video Area */}
        <div className="relative grid flex-1 gap-4 lg:grid-cols-2">
          {/* Remote Video */}
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-white/10 bg-[#14141a]">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full min-h-[320px] w-full object-cover"
            />

            {!remoteConnected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#14141a]">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
                  <Loader2 className="animate-spin text-white/50" size={24} />
                </div>

                <p className="text-sm font-medium text-white/80">
                  Waiting for the other participant
                </p>

                <p className="mt-1 text-xs text-white/40">
                  They need to join the session
                </p>
              </div>
            )}

            <div className="absolute left-4 top-4 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
              Other Participant
            </div>
          </div>

          {/* Local Video */}
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-white/10 bg-[#14141a]">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full min-h-[320px] w-full object-cover"
            />

            {isCameraOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#14141a]">
                <div className="flex flex-col items-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
                    <VideoOff size={24} className="text-white/60" />
                  </div>

                  <p className="text-sm text-white/60">Camera is off</p>
                </div>
              </div>
            )}

            <div className="absolute left-4 top-4 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white/80 backdrop-blur">
              You
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-5 flex items-center justify-center gap-3">
          {/* Mic */}
          <button
            onClick={toggleMute}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
              isMuted
                ? "bg-red-500 text-white"
                : "bg-white/10 text-white hover:bg-white/15"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Camera */}
          <button
            onClick={toggleCamera}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
              isCameraOff
                ? "bg-red-500 text-white"
                : "bg-white/10 text-white hover:bg-white/15"
            }`}
            title={isCameraOff ? "Turn camera on" : "Turn camera off"}
          >
            {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          {/* Leave */}
          <button
            onClick={leaveCall}
            className="flex h-12 w-14 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
            title="Leave call"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
