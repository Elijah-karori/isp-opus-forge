import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Inventory from "./pages/Inventory";
import Performance from "./pages/Performance";
import Finance from "./pages/Finance";
import HR from "./pages/HR";
import Attendance from "./pages/Attendance";
import Approvals from "./pages/Approvals";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Workflows from "@/pages/Workflows";
import Procurement from "@/pages/Procurement";
import Marketing from "@/pages/Marketing";
import Users from "@/pages/Users";
import Suppliers from "@/pages/Suppliers";
import PriceMonitoring from "@/pages/PriceMonitoring";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<Layout />}>
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/workflows" element={<Workflows />} />
              <Route path="/procurement" element={<Procurement />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route 
                path="/projects" 
                element={
                  <ProtectedRoute roles={['admin', 'finance', 'procurement', 'technician']}>
                    <Projects />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tasks" 
                element={
                  <ProtectedRoute roles={['admin', 'technician', 'finance']}>
                    <Tasks />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/inventory" 
                element={
                  <ProtectedRoute roles={['admin', 'procurement', 'finance']}>
                    <Inventory />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/performance" 
                element={
                  <ProtectedRoute roles={['admin', 'finance', 'hr']}>
                    <Performance />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/finance" 
                element={
                  <ProtectedRoute roles={['admin', 'finance']}>
                    <Finance />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/hr" 
                element={
                  <ProtectedRoute roles={['admin', 'hr', 'finance']}>
                    <HR />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/technician/attendance" 
                element={
                  <ProtectedRoute>
                    <Attendance />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/technician/reports" 
                element={
                  <ProtectedRoute>
                    <Attendance />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/approvals" 
                element={
                  <ProtectedRoute roles={['admin', 'finance', 'hr', 'procurement']}>
                    <Approvals />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute roles={['admin']}>
                    <Users />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/suppliers" 
                element={
                  <ProtectedRoute roles={['admin', 'procurement']}>
                    <Suppliers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/price-monitoring" 
                element={
                  <ProtectedRoute roles={['admin', 'procurement', 'finance']}>
                    <PriceMonitoring />
                  </ProtectedRoute>
                } 
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
