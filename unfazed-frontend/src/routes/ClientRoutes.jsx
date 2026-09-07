import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";

import ClientPortal from "../pages/client/ClientPortal";
import Payment from "../pages/client/Payment";
import Payments from "../pages/client/Payments";
import Notifications from "../pages/client/Notifications";
import ClientProfileSetup from "../pages/client/ClientProfileSetup";
import ClientProfile from "../pages/client/ClientProfile";
import BookingPage from "../pages/client/BookingPage";
import Therapists from "../pages/client/Therapists";
import Sessions from "../pages/client/Sessions";
import SharedNotes from "../pages/client/SharedNotes";

import VideoCall from "../components/video/VideoCall";

function ClientRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["CLIENT"]} />}>
        <Route path="" element={<ClientPortal />} />

        <Route path="payment" element={<Payment />} />

        <Route path="payments" element={<Payments />} />

        <Route path="notifications" element={<Notifications />} />

        <Route path="profile-setup" element={<ClientProfileSetup />} />

        <Route path="profile" element={<ClientProfile />} />

        <Route path="booking/:slug" element={<BookingPage />} />

        <Route path="therapists" element={<Therapists />} />

        <Route path="sessions" element={<Sessions />} />

        <Route path="sessions/:id/video" element={<VideoCall />} />

        <Route path="notes" element={<SharedNotes />} />
      </Route>
    </Routes>
  );
}

export default ClientRoutes;
