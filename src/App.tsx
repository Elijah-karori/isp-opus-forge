import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Layout } from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Inventory from "./pages/Inventory";
import Performance from "./pages/Performance";
import FinancePage from "./pages/Finance";
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import ProjectFinancials from "./pages/finance/ProjectFinancials";
import BOMVariances from "./pages/finance/BOMVariances";
import FinancePayouts from "./pages/finance/FinancePayouts";
import FinanceReports from "./pages/FinanceReports";
import BudgetManagement from "./pages/finance/BudgetManagement";
import AccountsDashboard from "./pages/finance/AccountsDashboard";
import NewTransaction from "./pages/finance/NewTransaction";
import MobileHomeDashboard from "./pages/MobileHomeDashboard";
import { HRPage, HRDashboard } from "./pages/HR";
import { EmployeeProfile } from "./pages/hr/EmployeeProfile";
import CreateEmployeePage from "./pages/hr/CreateEmployee";
import { EmployeeList } from "./components/hr/EmployeeList";
import { AttendanceLogs } from "./components/hr/AttendanceLogs";
import { PayoutsManager } from "./components/hr/PayoutsManager";
import { ComplaintsManager } from "./components/hr/ComplaintsManager";
import { HRReports } from "./components/hr/HRReports";
import Approvals from "./pages/Approvals";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Workflows from "@/pages/Workflows";
import WorkflowDesigner from "@/components/WorkflowDesigner/WorkflowDesigner";
import FinanceWorkflows from "@/pages/workflows/FinanceWorkflows";
import HRWorkflows from "@/pages/workflows/HRWorkflows";
import ProcurementWorkflows from "@/pages/workflows/ProcurementWorkflows";
import Procurement from "@/pages/Procurement";
import MarketingPage from "@/pages/Marketing";
import Campaigns from "@/pages/marketing/Campaigns";
import Leads from "@/pages/marketing/Leads";
import Analytics from "@/pages/marketing/Analytics";
import Users from "@/pages/Users";
import MenuManagement from "@/pages/admin/MenuManagement";
import Suppliers from "@/pages/Suppliers";
import PriceMonitoring from "@/pages/PriceMonitoring";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import TechnicianDashboard from "./pages/Technicians";
import { TechnicianPage } from "./pages/Technicians";
import TechnicianTools from "./pages/TechnicianTools";
import Attendance from "./pages/Attendance";
import TechnicianTasks from "./pages/TechnicianTasks";
import WorkflowDashboard from "./pages/WorkflowDashboard";
import EmployeeRegistration from "./features/hr/EmployeeRegistration";
import TaskListPage from "@/modules/tasks/pages/TaskListPage";
import TaskDetailPage from "@/modules/tasks/pages/TaskDetailPage";
import TaskDashboardPage from "./pages/TaskDashboardPage";
import PerformanceDashboard from "./features/performance/pages/PerformanceDashboard";
import Invoices from "./pages/Invoices";
import InvoiceCreate from "./pages/InvoiceCreate";
const ExecutiveDashboard = React.lazy(() => import("./pages/ExecutiveDashboard"));
import InvoiceManagement from "./pages/finance/InvoiceManagement";
import SmartProductSearch from "./pages/procurement/SmartProductSearch";
import InventoryOptimization from "./pages/inventory/InventoryOptimization";

// HR Pages
import EmployeeDirectory from "./pages/hr/EmployeeDirectory";
import RateCardManager from "./pages/hr/RateCardManager";
import PayoutCalculator from "./pages/hr/PayoutCalculator";
import ComplaintsDashboard from "./pages/hr/ComplaintsDashboard";
//import AttendanceLogs from "./pages/hr/AttendanceLogs";

// Marketing Pages
import CampaignManager from "./pages/marketing/CampaignManager";
import LeadPipeline from "./pages/marketing/LeadPipeline";

// Technician Pages
//import TechnicianPerformanceDashboard from "./pages/technicians/PerformanceDashboard";
//import TechnicianLeaderboard from "./pages/technicians/TechnicianLeaderboard";
//import CustomerSatisfactionPage from "./pages/technicians/CustomerSatisfaction";
import InvoiceDetail from "./pages/InvoiceDetail";
import QuickStartGuide from "@/components/onboarding/QuickStartGuide";
import { HelpMenu } from "@/components/onboarding/HelpMenu";
import TechnicianLeaderboard from "./pages/Technicians/TechnicianLeaderboard";
import CustomerSatisfactionPage from "./pages/Technicians/CustomerSatisfaction";
import AuditLogsPage from "@/pages/AuditLogs";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <QuickStartGuide />
          <div className="min-h-screen bg-background">
            <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
              <ThemeToggle />
              <HelpMenu />
            </div>
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
                  <Route
                    path="/mobile-dashboard"
                    element={
                      <ProtectedRoute>
                        <MobileHomeDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/workflows" element={<Workflows />} />
                  <Route
                    path="/workflows/designer"
                    element={
                      <ProtectedRoute anyPermission={['workflow:create:all', 'admin:full']}>
                        <WorkflowDesigner />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/workflows/designer/:workflowId"
                    element={
                      <ProtectedRoute anyPermission={['workflow:create:all', 'admin:full']}>
                        <WorkflowDesigner />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/workflow-dashboard"
                    element={
                      <ProtectedRoute anyPermission={['workflow:read:all', 'workflow:approve:all']}>
                        <WorkflowDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/workflows/finance"
                    element={
                      <ProtectedRoute anyPermission={['finance:read:all', 'workflow:read:all']}>
                        <FinanceWorkflows />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/workflows/hr"
                    element={
                      <ProtectedRoute anyPermission={['hr:read:all', 'workflow:read:all']}>
                        <HRWorkflows />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/workflows/procurement"
                    element={
                      <ProtectedRoute anyPermission={['procurement:read:all', 'workflow:read:all']}>
                        <ProcurementWorkflows />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/procurement" element={<Procurement />} />
                  <Route path="/executive-dashboard" element={<ExecutiveDashboard />} />
                  <Route path="/finance/invoices" element={<InvoiceManagement />} />
                  <Route path="/procurement/search" element={<SmartProductSearch />} />
                  <Route path="/inventory/optimization" element={<InventoryOptimization />} />

                  {/* HR Routes */}
                  <Route path="/hr/employees" element={<EmployeeDirectory />} />
                  <Route path="/hr/rate-cards" element={<RateCardManager />} />
                  <Route path="/hr/payouts" element={<PayoutCalculator />} />
                  <Route path="/hr/complaints" element={<ComplaintsDashboard />} />
                  <Route path="/hr/attendance" element={<AttendanceLogs />} />

                  {/* Marketing Routes */}
                  <Route path="/marketing/campaigns" element={<CampaignManager />} />
                  <Route path="/marketing/leads" element={<LeadPipeline />} />

                  {/* Technician Routes */}
                  <Route path="/technicians/performance" element={<PerformanceDashboard />} />
                  <Route path="/technicians/leaderboard" element={<TechnicianLeaderboard />} />
                  <Route path="/technicians/satisfaction" element={<CustomerSatisfactionPage />} />
                  <Route
                    path="/marketing"
                    element={
                      <ProtectedRoute anyPermission={['marketing:read:all', 'campaign:read:all']}>
                        <MarketingPage />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="campaigns" element={<Campaigns />} />
                    <Route path="leads" element={<Leads />} />
                    <Route path="analytics" element={<Analytics />} />
                  </Route>

                  {/* Projects - RBAC v2 */}
                  <Route
                    path="/projects"
                    element={
                      <ProtectedRoute anyPermission={['project:read:all', 'project:read:own', 'project:read:department']}>
                        <Projects />
                      </ProtectedRoute>
                    }
                  />
                  {/* Tasks - RBAC v2 */}
                  <Route
                    path="/tasks/dashboard"
                    element={
                      <ProtectedRoute anyPermission={['dashboard:view:all', 'task:read:all', 'task:read:assigned']}>
                        <TaskDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tasks"
                    element={
                      <ProtectedRoute anyPermission={['task:read:all', 'task:read:assigned']}>
                        <TaskListPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tasks/:id"
                    element={
                      <ProtectedRoute anyPermission={['task:read:all', 'task:read:assigned']}>
                        <TaskDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory"
                    element={
                      <ProtectedRoute anyPermission={['inventory:read:all', 'product:read:all']}>
                        <Inventory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/performance"
                    element={
                      <ProtectedRoute anyPermission={['performance:read:all', 'performance:read:own']}>
                        <PerformanceDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/finance"
                    element={
                      <ProtectedRoute anyPermission={['finance:read:all', 'finance:read:department']}>
                        <FinancePage />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<FinanceDashboard />} />
                    <Route path="budgets" element={<BudgetManagement />} />
                    <Route path="projects/:id" element={<ProjectFinancials />} />
                    <Route path="variances" element={<BOMVariances />} />
                    <Route path="payouts" element={<FinancePayouts />} />
                    <Route path="reports" element={<FinanceReports />} />
                    <Route path="accounts" element={<AccountsDashboard />} />
                    <Route path="new-transaction" element={<NewTransaction />} />
                  </Route>

                  {/* Invoice Routes - RBAC v2 */}
                  <Route
                    path="/invoices"
                    element={
                      <ProtectedRoute anyPermission={['invoice:read:all', 'invoice:read:department']}>
                        <Invoices />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/invoices/create"
                    element={
                      <ProtectedRoute permission="invoice:create:all">
                        <InvoiceCreate />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/invoices/:id"
                    element={
                      <ProtectedRoute anyPermission={['invoice:read:all', 'invoice:read:department']}>
                        <InvoiceDetail />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/hr"
                    element={
                      <ProtectedRoute anyPermission={['hr:read:all', 'employee:read:all']}>
                        <HRPage />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<HRDashboard />} />
                    <Route path="employees" element={<EmployeeList />} />
                    <Route path="create-employee" element={<ProtectedRoute permission="hr:employee:create:all"><CreateEmployeePage /></ProtectedRoute>} />
                    <Route path="register-employee" element={<ProtectedRoute permission="hr:employee:create:all"><EmployeeRegistration /></ProtectedRoute>} />
                    <Route path="attendance" element={<AttendanceLogs />} />
                    <Route path="payouts" element={<PayoutsManager />} />
                    <Route path="complaints" element={<ComplaintsManager />} />
                    <Route path="reports" element={<HRReports />} />
                  </Route>
                  <Route
                    path="/hr/employees/:id"
                    element={
                      <ProtectedRoute anyPermission={['hr:read:all', 'employee:read:all']}>
                        <EmployeeProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/approvals"
                    element={
                      <ProtectedRoute anyPermission={['workflow:approve:all', 'workflow:approve:department']}>
                        <Approvals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute anyPermission={['user:read:all', 'admin:full']}>
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/menu-management"
                    element={
                      <ProtectedRoute permission="admin:full">
                        <MenuManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/suppliers"
                    element={
                      <ProtectedRoute anyPermission={['supplier:read:all', 'inventory:read:all']}>
                        <Suppliers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/price-monitoring"
                    element={
                      <ProtectedRoute anyPermission={['product:read:all', 'inventory:read:all']}>
                        <PriceMonitoring />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/audit-logs"
                    element={
                      <ProtectedRoute anyPermission={['admin:full', 'audit:read:all', 'system:read:all']}>
                        <AuditLogsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Technician Routes */}
                  <Route
                    path="/technicians"
                    element={
                      <ProtectedRoute anyPermission={['technician:read:all', 'performance:read:all']}>
                        <TechnicianPage />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<TechnicianDashboard />} />
                    <Route path="tools" element={<TechnicianTools />} />
                    <Route path="attendance" element={<Attendance />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

