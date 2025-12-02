// src/api/projects.ts
import axios from "./axios";

export interface Project {
  id: number;
  name: string;
  project_type: 'apartment' | 'single_home' | 'commercial';
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  address?: string;
  budget?: number;
  actual_cost: number;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  created_by?: number;
  created_at: string;
  start_date?: string;
  estimated_end_date?: string;
  actual_end_date?: string;
  description?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  division_id?: number;
  department_id?: number;
  project_manager_id?: number;
  tech_lead_id?: number;
  infrastructure_type?: 'ppoe' | 'hotspot' | 'fiber' | 'wireless' | 'hybrid' | 'network_infrastructure';
  end_date?: string;
}

export interface ProjectFinancials {
  project_id: number;
  material_cost: number;
  labor_cost: number;
  overhead_cost: number;
  total_cost: number;
  revenue: number;
  gross_margin: number;
  margin_percent: number;
  updated_at: string;
  budget_utilization: number;
  cost_variance: number;
}

export interface ProjectTask {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'awaiting_approval' | 'completed' | 'cancelled';
  scheduled_date?: string;
  technician_id?: number;
  bom_approved: boolean;
  created_at: string;
  technician?: {
    full_name: string;
    email: string;
  };
}

export interface ProjectTimeline {
  phase: string;
  start_date: string;
  end_date: string;
  status: 'completed' | 'in_progress' | 'upcoming' | 'delayed';
  tasks: number;
  completed_tasks: number;
  description?: string;
}

export interface ProjectResource {
  id: number;
  project_id: number;
  technician_id?: number;
  role: string;
  assigned_date: string;
  estimated_hours: number;
  actual_hours?: number;
  status: 'assigned' | 'active' | 'completed' | 'reassigned';
  technician?: {
    full_name: string;
    email: string;
    skills: string[];
  };
}

// Project management
export const getProjects = (params?: {
  skip?: number;
  limit?: number;
  status?: string;
  project_type?: string;
  priority?: string;
}) => axios.get("/projects", { params });

export const getProject = (projectId: number) =>
  axios.get(`/projects/${projectId}`);

export const createProject = (data: Partial<Project>) =>
  axios.post("/projects", data);

export const updateProject = (projectId: number, data: Partial<Project>) =>
  axios.patch(`/projects/${projectId}`, data);

export const deleteProject = (projectId: number) =>
  axios.delete(`/projects/${projectId}`);

// Project financials
export const getProjectFinancials = (projectId: number) =>
  axios.get(`/finance/projects/${projectId}/financials`);

export const updateProjectBudget = (projectId: number, budget: number) =>
  axios.patch(`/projects/${projectId}/budget`, { budget });

// Project tasks
export const getProjectTasks = (projectId: number, params?: {
  status?: string;
  limit?: number;
}) => axios.get(`/projects/${projectId}/tasks`, { params });

export const addProjectTask = (projectId: number, data: Partial<ProjectTask>) =>
  axios.post(`/projects/${projectId}/tasks`, data);

// Project resources
export const getProjectResources = (projectId: number) =>
  axios.get(`/projects/${projectId}/resources`);

export const assignResource = (projectId: number, data: {
  technician_id: number;
  role: string;
  estimated_hours: number;
}) => axios.post(`/projects/${projectId}/resources`, data);

export const updateResourceAssignment = (assignmentId: number, data: Partial<ProjectResource>) =>
  axios.patch(`/projects/resources/${assignmentId}`, data);

// Project timeline
export const getProjectTimeline = (projectId: number) =>
  axios.get(`/projects/${projectId}/timeline`);

export const updateProjectTimeline = (projectId: number, data: {
  phases: ProjectTimeline[];
}) => axios.put(`/projects/${projectId}/timeline`, data);

// Project documents
export const getProjectDocuments = (projectId: number) =>
  axios.get(`/projects/${projectId}/documents`);

export const uploadProjectDocument = (projectId: number, formData: FormData) =>
  axios.post(`/projects/${projectId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Project analytics
export const getProjectStats = () =>
  axios.get("/projects/stats");

export const getProjectsSummary = (params?: {
  status?: string;
  start_date?: string;
  end_date?: string;
}) => axios.get("/projects/summary", { params });

// Project reports
export const generateProjectReport = (projectId: number, reportType: string) =>
  axios.get(`/projects/${projectId}/reports/${reportType}`);

export const exportProjects = (format: 'csv' | 'excel' | 'pdf' = 'csv') =>
  axios.get(`/projects/export?format=${format}`);

// ===========================================================================
// MILESTONES API
// ===========================================================================

export interface Milestone {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  due_date?: string;
  completed_date?: string;
  order_index: number;
  created_at?: string;
}

export type MilestoneCreate = Omit<Milestone, 'id' | 'created_at' | 'status'>;
export type MilestoneUpdate = Partial<Pick<Milestone, 'status' | 'completed_date' | 'name' | 'due_date'>>;

/**
 * Get all milestones for a project
 */
export const getProjectMilestones = (projectId: number) =>
  axios.get<Milestone[]>(`/projects/${projectId}/milestones`);

/**
 * Create a new milestone for a project
 */
export const createMilestone = (projectId: number, data: MilestoneCreate) =>
  axios.post<Milestone>(`/projects/${projectId}/milestones`, data);

/**
 * Update milestone status/completion
 */
export const updateMilestone = (milestoneId: number, data: MilestoneUpdate) =>
  axios.put<Milestone>(`/projects/milestones/${milestoneId}`, data);

// ===========================================================================
// BUDGET API
// ===========================================================================

export type BudgetCategory =
  | 'labor'
  | 'materials'
  | 'equipment'
  | 'overhead'
  | 'contingency'
  | 'other';

export interface BudgetLineItem {
  id?: number;
  budget_id?: number;
  category: BudgetCategory;
  description: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  actual_cost: number;
}

export interface ProjectBudget {
  id: number;
  project_id: number;
  total_allocated: number;
  total_spent: number;
  approved_at?: string;
  line_items: BudgetLineItem[];
}

export interface BudgetSummary {
  total_allocated: number;
  total_spent: number;
  remaining: number;
  percent_used: number;
  by_category: Record<BudgetCategory, {
    allocated: number;
    spent: number;
    variance: number;
  }>;
}

export type ProjectBudgetCreate = {
  project_id: number;
  total_allocated: number;
  line_items?: Omit<BudgetLineItem, 'id' | 'budget_id'>[];
};

/**
 * Create project budget
 */
export const createProjectBudget = (projectId: number, data: ProjectBudgetCreate) =>
  axios.post<ProjectBudget>(`/projects/${projectId}/budget`, data);

/**
 * Get project budget
 */
export const getProjectBudget = (projectId: number) =>
  axios.get<ProjectBudget>(`/projects/${projectId}/budget`);

/**
 * Get budget summary with breakdown
 */
export const getBudgetSummary = (projectId: number) =>
  axios.get<BudgetSummary>(`/projects/${projectId}/budget/summary`);

// ===========================================================================
// TEAM MANAGEMENT API
// ===========================================================================

export interface ProjectTeamMember {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  department?: string;
  assigned_date?: string;
}

export interface ProjectTeam {
  project_manager?: ProjectTeamMember;
  tech_lead?: ProjectTeamMember;
  team_members: ProjectTeamMember[];
}

/**
 * Get project team members
 */
export const getProjectTeam = (projectId: number) =>
  axios.get<ProjectTeam>(`/projects/${projectId}/team`);

// ===========================================================================
// DEPARTMENT FILTERING API
// ===========================================================================

/**
 * Get projects by department
 */
export const getProjectsByDepartment = (departmentId: number) =>
  axios.get<Project[]>(`/projects/by-department/${departmentId}`);

// ===========================================================================
// PROJECTS API OBJECT (for components that use object syntax)
// ===========================================================================
export const projectsApi = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectFinancials,
  updateProjectBudget,
  getProjectTasks,
  addProjectTask,
  getProjectResources,
  assignResource,
  updateResourceAssignment,
  getProjectTimeline,
  updateProjectTimeline,
  getProjectDocuments,
  uploadProjectDocument,
  getProjectStats,
  getProjectsSummary,
  generateProjectReport,
  exportProjects,
  getProjectMilestones,
  createMilestone,
  updateMilestone,
  createProjectBudget,
  getProjectBudget,
  getBudgetSummary,
  getProjectTeam,
  getProjectsByDepartment,
};
