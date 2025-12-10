import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import Index from "./pages/Index";
import NowShowing from "./pages/NowShowing";
import MovieDetail from "./pages/MovieDetail";
import SeatSelection from "./pages/SeatSelection";
import Payment from "./pages/Payment";
import BookingConfirmed from "./pages/BookingConfirmed";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageMovies from "./pages/admin/ManageMovies";
import ManageShowtimes from "./pages/admin/ManageShowtimes";
import ManageScreens from "./pages/admin/ManageScreens";
import ManageTickets from "./pages/admin/ManageTickets";
import RevenueReports from "./pages/admin/RevenueReports";
import ManageFeedback from "./pages/admin/ManageFeedback";
import ManageUsers from "./pages/admin/ManageUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/now-showing" element={<NowShowing />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/seats/:id" element={<SeatSelection />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/booking-confirmed" element={<BookingConfirmed />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/movies" element={<ProtectedAdminRoute><ManageMovies /></ProtectedAdminRoute>} />
            <Route path="/admin/showtimes" element={<ProtectedAdminRoute><ManageShowtimes /></ProtectedAdminRoute>} />
            <Route path="/admin/screens" element={<ProtectedAdminRoute><ManageScreens /></ProtectedAdminRoute>} />
            <Route path="/admin/tickets" element={<ProtectedAdminRoute><ManageTickets /></ProtectedAdminRoute>} />
            <Route path="/admin/reports" element={<ProtectedAdminRoute><RevenueReports /></ProtectedAdminRoute>} />
            <Route path="/admin/feedback" element={<ProtectedAdminRoute><ManageFeedback /></ProtectedAdminRoute>} />
            <Route path="/admin/users" element={<ProtectedAdminRoute><ManageUsers /></ProtectedAdminRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
