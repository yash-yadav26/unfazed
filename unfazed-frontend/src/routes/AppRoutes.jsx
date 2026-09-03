import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "../pages/public/Landing";
import Login from "../pages/auth/Login";
import ClientSignup from "../pages/auth/ClientSignup";
import TherapistSignup from "../pages/auth/TherapistSignup";

import ClientRoutes from "./ClientRoutes";
import TherapistRoutes from "./TherapistRoutes";



import ForgotPassword from "../pages/auth/ForgotPassword";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===============================
            Public Routes
        =============================== */}

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup/client" element={<ClientSignup />} />

        <Route path="/signup/therapist" element={<TherapistSignup />} />

        {/* ===============================
            Client Routes
        =============================== */}

        <Route path="/client/*" element={<ClientRoutes />} />

        {/* ===============================
            Therapist Routes
        =============================== */}

        <Route path="/therapist/*" element={<TherapistRoutes />} />


        <Route path="/forgot-password" element={<ForgotPassword />}/>
        
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
