import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Auth = lazy(() => import("./pages/Auth"));
const Events = lazy(() => import("./pages/Events"));
const EventDetails = lazy(() => import("./pages/EventDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const CollegeDashboard = lazy(() => import("./pages/CollegeDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SuperAdminAuth = lazy(() => import("./pages/SuperAdminAuth"));
const MyCertificates = lazy(() => import("./pages/student/MyCertificates"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-[#0F0F1A] text-white font-sans selection:bg-[#7C3AED] selection:text-white">
          <Navbar />
          <main className="pt-20">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/super-admin" element={<SuperAdminAuth />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/cart" element={
                  <ProtectedRoute role="student">
                    <Cart />
                  </ProtectedRoute>
                } />
                
                <Route path="/checkout" element={
                  <ProtectedRoute role="student">
                    <Checkout />
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard/student" element={
                  <ProtectedRoute role="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/student/certificates" element={
                  <ProtectedRoute role="student">
                    <MyCertificates />
                  </ProtectedRoute>
                } />

                <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
                
                <Route path="/dashboard/college" element={
                  <ProtectedRoute role="college_admin">
                    <CollegeDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard/admin" element={
                  <ProtectedRoute role="super_admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
