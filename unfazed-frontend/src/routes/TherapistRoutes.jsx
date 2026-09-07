import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";

import TherapistProfileSetup from "../pages/therapist/TherapistProfileSetup";
import TherapistDashboard from "../pages/therapist/TherapistDashboard";
import Schedule from "../pages/therapist/Schedule";
import Clients from "../pages/therapist/Clients";
import TherapistProfile from "../pages/therapist/TherapistProfile";
import Notes from "../pages/therapist/Notes";
import Analytics from "../pages/therapist/Analytics";
import TherapistNotifications from "../pages/therapist/Notifications";

import VideoCall from "../components/video/VideoCall";
import TherapistChat from "../pages/therapist/TherapistChat";

function TherapistRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["THERAPIST"]} />}>
        <Route path="profile-setup" element={<TherapistProfileSetup />} />

        <Route path="dashboard" element={<TherapistDashboard />} />

        <Route path="schedule" element={<Schedule />} />

        <Route path="clients" element={<Clients />} />

        <Route path="profile" element={<TherapistProfile />} />

        <Route path="notes" element={<Notes />} />

        <Route path="analytics" element={<Analytics />} />

        <Route path="notifications" element={<TherapistNotifications />} />

        <Route path="sessions/:id/video" element={<VideoCall />} />
        <Route path="clients/:id/chat" element={<TherapistChat />} />
      </Route>
    </Routes>
  );
}

export default TherapistRoutes;
