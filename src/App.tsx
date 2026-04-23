import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Book from "./pages/Book.tsx";
import { DashboardLayout } from "./components/dashboard/DashboardLayout.tsx";
import Overview from "./pages/dashboard/Overview.tsx";
import CalendarPage from "./pages/dashboard/CalendarPage.tsx";
import StaffPage from "./pages/dashboard/StaffPage.tsx";
import CustomersPage from "./pages/dashboard/CustomersPage.tsx";
import InventoryPage from "./pages/dashboard/InventoryPage.tsx";
import BillingPage from "./pages/dashboard/BillingPage.tsx";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage.tsx";
import MarketingPage from "./pages/dashboard/MarketingPage.tsx";
import BranchesPage from "./pages/dashboard/BranchesPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/book" element={<Book />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="marketing" element={<MarketingPage />} />
            <Route path="branches" element={<BranchesPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
