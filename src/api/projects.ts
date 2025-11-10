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
  priority: 'low' | 'medium' | 'high' | 'urgent';
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
