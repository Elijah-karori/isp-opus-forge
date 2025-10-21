// src/api/tasks.ts
import axios from "./axios";

export interface Task {
  id: number;
  title: string;
  description?: string;
  scheduled_date?: string;
  project_id: number;
  technician_id?: number;
  status: 'pending' | 'in_progress' | 'awaiting_approval' | 'completed' | 'cancelled';
  bom_approved: boolean;
  created_at: string;
  items: TaskItem[];
  project?: {
    name: string;
    customer_name: string;
    address?: string;
  };
  technician?: {
    full_name: string;
    email: string;
  };
  completion_notes?: string;
  completed_at?: string;
  actual_hours?: number;
}

export interface TaskItem {
  id: number;
  product_id: number;
  quantity_required: number;
  quantity_used: number;
  notes?: string;
  product?: {
    name: string;
    sku: string;
    unit_price: number;
    category: string;
  };
}

export interface TaskCreate {
  title: string;
  description?: string;
  scheduled_date?: string;
  project_id: number;
  technician_id?: number;
  items: TaskItemCreate[];
}

export interface TaskItemCreate {
  product_id: number;
  quantity_required: number;
}

export interface TaskUpdateBOM {
  items: Array<{
    product_id: number;
    quantity_used: number;
    notes?: string;
  }>;
}

export interface Technician {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  skills?: string[];
  certification_level?: string;
  tasks_assigned: number;
  tasks_completed: number;
  completion_rate: number;
}

export interface TaskStats {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  avg_completion_time: number;
  technician_performance: Technician[];
}

// Task management
export const getTasks = (params?: {
  skip?: number;
  limit?: number;
  project_id?: number;
  technician_id?: number;
  status?: string;
}) => axios.get("/tasks", { params });

export const getTask = (taskId: number) =>
  axios.get(`/tasks/${taskId}`);

export const createTask = (data: TaskCreate) =>
  axios.post("/tasks", data);

export const updateTask = (taskId: number, data: Partial<Task>) =>
  axios.patch(`/tasks/${taskId}`, data);

export const updateTaskBOM = (taskId: number, data: TaskUpdateBOM) =>
  axios.post(`/tasks/${taskId}/update-bom`, data);

export const approveTaskBOM = (taskId: number) =>
  axios.post(`/tasks/${taskId}/approve-bom`);

export const completeTask = (taskId: number, data: {
  completion_notes?: string;
  actual_hours?: number;
}) => axios.post(`/tasks/${taskId}/complete`, data);

// Technician management
export const getTechnicians = (params?: { active_only?: boolean }) =>
  axios.get("/technicians", { params });

export const getTechnicianLeaderboard = (params?: { limit?: number }) =>
  axios.get("/technicians/leaderboard", { params });

export const approveTaskCompletion = (taskId: number, data: {
  approved: boolean;
  notes?: string;
}) => axios.post(`/technicians/tasks/${taskId}/approve`, data);

// Task analytics
export const getTaskStats = () =>
  axios.get("/tasks/stats");

export const getTechnicianPerformance = (technicianId: number, params?: {
  period_start?: string;
  period_end?: string;
}) => axios.get(`/technicians/${technicianId}/performance`, { params });

// BOM variance detection
export const detectTaskVariances = (taskId: number) =>
  axios.post(`/finance/tasks/${taskId}/detect-variances`);

// Customer satisfaction
export const recordCustomerSatisfaction = (taskId: number, data: {
  rating: number;
  feedback?: string;
}) => axios.post(`/technicians/satisfaction`, { task_id: taskId, ...data });
