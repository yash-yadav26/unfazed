import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "../pages/public/Landing";
import Login from "../pages/auth/Login";
import ClientSignup from "../pages/auth/ClientSignup";
import TherapistSignup from "../pages/auth/TherapistSignup";
import TherapistProfileSetup from "../pages/therapist/TherapistProfileSetup";
import TherapistDashboard from "../pages/therapist/TherapistDashboard";
import Schedule from "../pages/therapist/Schedule";
import Clients from "../pages/therapist/Clients";
import ClientDetail from "../pages/therapist/ClientDetail";
import TherapistProfile from "../pages/therapist/TherapistProfile";
import Notes from "../pages/therapist/Notes";
import Analytics from "../pages/therapist/Analytics";
import Payment from "../pages/client/Payment";
import ClientPortal from "../pages/client/ClientPortal";
import Notifications from "../pages/client/Notifications";
import ClientProfileSetup from "../pages/client/ClientProfileSetup";
import ClientProfile from "../pages/client/ClientProfile";
import BookingPage from "../pages/client/BookingPage";
import Therapists from "../pages/client/Therapists";
import TherapistPublicProfile from "../pages/public/TherapistPublicProfile";
import Sessions from "../pages/client/Sessions";
import SharedNotes from "../pages/client/SharedNotes";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/client" element={<ClientSignup />} />
        <Route path="/signup/therapist" element={<TherapistSignup />} />
        <Route  path="/therapist/profile-setup" element={<TherapistProfileSetup />}/>
        <Route path="/therapist/dashboard" element={<TherapistDashboard />} />
        <Route path="/therapist/schedule" element={<Schedule />} />
        <Route path="/therapist/clients" element={<Clients />} />
        <Route path="/therapist/clients/:id" element={<ClientDetail />}/>
        <Route  path="/therapist/profile"  element={<TherapistProfile />}/>
        <Route  path="/therapist/notes"  element={<Notes />}/>
        <Route  path="/therapist/analytics"  element={<Analytics />}/>
        <Route  path="/client/payment"  element={<Payment />}/>
        <Route path="/client"  element={<ClientPortal />}/>
        <Route  path="/client/notifications" element={<Notifications />}/>
        <Route  path="/client/profile-setup"  element={<ClientProfileSetup />}/>
        <Route path="/client/profile"  element={<ClientProfile />}/>
        <Route path="/client/booking/:slug"  element={<BookingPage />}/>
        <Route  path="/client/therapists"  element={<Therapists />}/>
        <Route path="/:slug" element={<TherapistPublicProfile />}/>
        <Route path="/client/sessions" element={<Sessions />}/>
        <Route path="/client/notes" element={<SharedNotes />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
