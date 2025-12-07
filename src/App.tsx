import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/movies" element={<ManageMovies />} />
          <Route path="/admin/showtimes" element={<ManageShowtimes />} />
          <Route path="/admin/screens" element={<ManageScreens />} />
          <Route path="/admin/tickets" element={<ManageTickets />} />
          <Route path="/admin/reports" element={<RevenueReports />} />
          <Route path="/admin/feedback" element={<ManageFeedback />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
