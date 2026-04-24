import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { DataProvider } from "@/context/DataContext";
import { ProtectedRoute, ProtectedStaffRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Book from "./pages/Book.tsx";
import { DashboardLayout } from "./components/dashboard/DashboardLayout.tsx";
import SalonSetupPage from "./pages/dashboard/SalonSetupPage.tsx";
import Overview from "./pages/dashboard/Overview.tsx";
import CalendarPage from "./pages/dashboard/CalendarPage.tsx";
import StaffPage from "./pages/dashboard/StaffPage.tsx";
import CustomersPage from "./pages/dashboard/CustomersPage.tsx";
import InventoryPage from "./pages/dashboard/InventoryPage.tsx";
import BillingPage from "./pages/dashboard/BillingPage.tsx";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage.tsx";
import MarketingPage from "./pages/dashboard/MarketingPage.tsx";
import BranchesPage from "./pages/dashboard/BranchesPage.tsx";
import HistoryPage from "./pages/dashboard/HistoryPage.tsx";
import AIRecommendationsPage from "./pages/dashboard/AIRecommendationsPage.tsx";
import StaffLogin from "./pages/StaffLogin.tsx";
import StaffDashboard from "./pages/StaffDashboard.tsx";
import HairstyleStudio from "./pages/HairstyleStudio.tsx";
import About from "./pages/About.tsx";
import Careers from "./pages/Careers.tsx";
import Press from "./pages/Press.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import Security from "./pages/Security.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      {/* DataProvider lives here — above ProtectedRoute — so it NEVER unmounts */}
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/book" element={<Book />} />
              <Route path="/hairstyle-studio" element={<HairstyleStudio />} />
              <Route path="/about" element={<About />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/press" element={<Press />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/security" element={<Security />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="setup" element={<SalonSetupPage />} />
                <Route index element={<Overview />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="marketing" element={<MarketingPage />} />
                <Route path="branches" element={<BranchesPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="ai-recommendations" element={<AIRecommendationsPage />} />
              </Route>
              <Route path="/staff/login" element={<StaffLogin />} />
              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedStaffRoute>
                    <StaffDashboard />
                  </ProtectedStaffRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
