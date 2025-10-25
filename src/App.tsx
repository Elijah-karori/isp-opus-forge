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
import FinancePage from "./pages/Finance";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import ProjectFinancials from "./pages/finance/ProjectFinancials";
import BOMVariances from "./pages/finance/BOMVariances";
import FinancePayouts from "./pages/finance/FinancePayouts";
import FinanceReports from "./pages/FinanceReports";
import { HRPage, HRDashboard } from "./pages/HR";
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
import MarketingPage from "@/pages/Marketing";
import Campaigns from "@/pages/marketing/Campaigns";
import Leads from "@/pages/marketing/Leads";
import Analytics from "@/pages/marketing/Analytics";
import Users from "@/pages/Users";
import Suppliers from "@/pages/Suppliers";
import PriceMonitoring from "@/pages/PriceMonitoring";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import TechnicianTools from "./pages/TechnicianTools";
import Attendance from "./pages/Attendance";

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
              
              <Route 
                path="/marketing" 
                element={
                  <ProtectedRoute roles={['admin', 'marketing']}>
                    <MarketingPage />
                  </ProtectedRoute>
                }
              >
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="leads" element={<Leads />} />
                <Route path="analytics" element={<Analytics />} />
              </Route>

              <Route 
                path="/projects" 
                element={
                  <ProtectedRoute roles={['admin', 'finance', 'procurement', 'technician', 'marketing']}>
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
                    <FinancePage />
                  </ProtectedRoute>
                }
              >
                <Route index element={<FinanceDashboard />} />
                <Route path="projects/:id" element={<ProjectFinancials />} />
                <Route path="variances" element={<BOMVariances />} />
                <Route path="payouts" element={<FinancePayouts />} />
                <Route path="reports" element={<FinanceReports />} />
              </Route>

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

              {/* Technician Routes */}
              <Route
                path="/technician-tools"
                element={
                  <ProtectedRoute roles={['admin', 'technician']}>
                    <TechnicianTools />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/technician/reports"
                element={
                  <ProtectedRoute roles={['admin', 'technician']}>
                    <FinanceReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/technician/attendance"
                element={
                  <ProtectedRoute roles={['admin', 'technician']}>
                    <Attendance />
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
