import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import {HRPage, HRDashboard} from "./pages/HR";
import { EmployeeProfile } from "./pages/hr/EmployeeProfile";
import { EmployeeList } from "./components/hr/EmployeeList";
import { AttendanceLogs } from "./components/hr/AttendanceLogs";
import { PayoutsManager } from "./components/hr/PayoutsManager";
import { ComplaintsManager } from "./components/hr/ComplaintsManager";
import { HRReports } from "./components/hr/HRReports";
import Approvals from "./pages/Approvals";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Workflows from "@/pages/Workflows";
import FinanceWorkflows from "@/pages/workflows/FinanceWorkflows";
import HRWorkflows from "@/pages/workflows/HRWorkflows";
import ProcurementWorkflows from "@/pages/workflows/ProcurementWorkflows";
import Procurement from "@/pages/Procurement";
import Marketing from "@/pages/Marketing";
import Users from "@/pages/Users";
import Suppliers from "@/pages/Suppliers";
import PriceMonitoring from "@/pages/PriceMonitoring";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import TechnicianTools from "./pages/TechnicianTools";
import FinanceReports from "./pages/FinanceReports";

const App = () => (
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
              <Route 
                path="/workflows/finance" 
                element={
                  <ProtectedRoute roles={['admin', 'finance']}>
                    <FinanceWorkflows />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/workflows/hr" 
                element={
                  <ProtectedRoute roles={['admin', 'hr']}>
                    <HRWorkflows />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/workflows/procurement" 
                element={
                  <ProtectedRoute roles={['admin', 'operations', 'procurement']}>
                    <ProcurementWorkflows />
                  </ProtectedRoute>
                } 
              />
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
                    <HRPage />
                  </ProtectedRoute>
                } 
              >
                <Route index element={<HRDashboard />} />
                <Route path="employees" element={<EmployeeList />} />
                <Route path="attendance" element={<AttendanceLogs />} />
                <Route path="payouts" element={<PayoutsManager />} />
                <Route path="complaints" element={<ComplaintsManager />} />
                <Route path="reports" element={<HRReports />} />
              </Route>
              <Route 
                path="/hr/employees/:id" 
                element={
                  <ProtectedRoute roles={['admin', 'hr']}>
                    <EmployeeProfile />
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
              <Route
                path="/technician-tools"
                element={
                  <ProtectedRoute roles={['admin', 'technician']}>
                    <TechnicianTools />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/finance/reports"
                element={
                  <ProtectedRoute roles={['admin', 'finance']}>
                    <FinanceReports />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
);

export default App;
