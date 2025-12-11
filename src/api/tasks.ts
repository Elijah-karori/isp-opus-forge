// src/api/tasks.ts
import { apiClient } from '@/lib/api';

const axios = apiClient.axios;

// ===========================================================================
// TASK INTERFACES
// ===========================================================================

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'awaiting_approval'
  | 'completed'
  | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type AssignedRole =
  | 'tech_lead'
  | 'project_manager'
  | 'technician'
  | 'customer_support'
  | 'marketing';

export type InfrastructureType =
  | 'pppoe'
  | 'hotspot'
  | 'fiber'
  | 'wireless'
  | 'network_infrastructure'
  | 'other';

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  status: TaskStatus;

  // Assignment
  assigned_role?: AssignedRole;
  assigned_to_id?: number;
  department_id?: number;

  // Tracking
  priority: TaskPriority;
  estimated_hours?: number;
  actual_hours?: number;
  infrastructure_type?: InfrastructureType;

  // Dates
  due_date?: string;
  scheduled_date?: string;
  completed_date?: string;
  created_at?: string;
  updated_at?: string;

  // Relations
  assignee?: {
    id: number;
    full_name: string;
    email: string;
  };
  technician?: {
    id: number;
    full_name: string;
    email: string;
  };
  project?: {
    id: number;
    name: string;
    customer_name: string;
    address?: string;
  };
  bom_approved?: boolean;
  items?: TaskItem[];
}

export type TaskCreate = Omit<Task, 'id' | 'created_at' | 'updated_at' | 'assignee'>;
export type TaskUpdate = Partial<TaskCreate>;

// ===========================================================================
// TASK DEPENDENCY INTERFACES
// ===========================================================================

export type DependencyType =
  | 'finish_to_start'
  | 'start_to_start'
  | 'finish_to_finish'
  | 'start_to_finish';

export interface TaskDependency {
  id: number;
  task_id: number;
  depends_on_task_id: number;
  dependency_type: DependencyType;
  created_at?: string;
}

export interface TaskWithDependencies extends Task {
  dependencies: Array<{
    id: number;
    depends_on_task_id: number;
    dependency_type: DependencyType;
    task: {
      id: number;
      title: string;
      status: TaskStatus;
    };
  }>;
  dependent_tasks: Array<{
    id: number;
    task_id: number;
    dependency_type: DependencyType;
    task: {
      id: number;
      title: string;
      status: TaskStatus;
    };
  }>;
}

// ===========================================================================
// TASK HOURS LOGGING
// ===========================================================================

export interface TaskHoursLog {
  actual_hours: number;
  notes?: string;
}

// ===========================================================================
// TASK ASSIGNMENT BY ROLE
// ===========================================================================

export interface TaskAssignByRole {
  task_id: number;
  assigned_role: AssignedRole;
  department_id?: number;
  priority?: TaskPriority;
}

// ===========================================================================
// TASK CRUD API
// ===========================================================================

/**
 * List all tasks with optional filtering
 */
export const getTasks = (params?: {
  skip?: number;
  limit?: number;
  project_id?: number;
  status?: TaskStatus;
  assigned_role?: AssignedRole;
  department_id?: number;
  priority?: TaskPriority;
}) => axios.get<Task[]>("/tasks", { params });

/**
 * Get task by ID
 */
export const getTask = (taskId: number) =>
  axios.get<Task>(`/tasks/${taskId}`);

/**
 * Create new task
 */
export const createTask = (data: TaskCreate) =>
  axios.post<Task>("/tasks", data);

/**
 * Update task
 */
export const updateTask = (taskId: number, data: TaskUpdate) =>
  axios.put<Task>(`/tasks/${taskId}`, data);

/**
 * Delete task
 */
export const deleteTask = (taskId: number) =>
  axios.delete(`/tasks/${taskId}`);

// ===========================================================================
// MY TASKS API
// ===========================================================================

/**
 * Get tasks assigned to current user
 */
export const getMyTasks = () =>
  axios.get<Task[]>("/tasks/my-assignments");

/**
 * Get tasks by department
 */
export const getTasksByDepartment = (departmentId: number) =>
  axios.get<Task[]>(`/tasks/by-department/${departmentId}`);

// ===========================================================================
// TASK ASSIGNMENT API
// ===========================================================================

/**
 * Assign task by role - auto-selects available user with that role
 */
export const assignTaskByRole = (data: TaskAssignByRole) =>
  axios.post<Task>("/tasks/assign-by-role", data);

// ===========================================================================
// TASK HOURS LOGGING API
// ===========================================================================

/**
 * Log actual hours worked on a task
 */
export const logTaskHours = (taskId: number, data: TaskHoursLog) =>
  axios.put<Task>(`/tasks/${taskId}/hours`, data);

// ===========================================================================
// TASK DEPENDENCY API
// ===========================================================================

/**
 * Add dependency to a task
 */
export const addTaskDependency = (
  taskId: number,
  dependsOnTaskId: number,
  dependencyType: DependencyType = 'finish_to_start'
) =>
  axios.post(`/tasks/${taskId}/dependencies`, null, {
    params: {
      depends_on_task_id: dependsOnTaskId,
      dependency_type: dependencyType
    }
  });

/**
 * Get task with all its dependencies
 */
export const getTaskDependencies = (taskId: number) =>
  axios.get<TaskWithDependencies>(`/tasks/${taskId}/dependencies`);

/**
 * Remove task dependency
 */
export const removeTaskDependency = (taskId: number, dependencyId: number) =>
  axios.delete(`/tasks/${taskId}/dependencies/${dependencyId}`);

// ===========================================================================
// TECHNICIAN INTERFACES
// ===========================================================================

export interface Technician {
  id: number;
  full_name: string;
  email: string;
  certification_level?: string;
  skills?: string[];
  tasks_assigned: number;
  tasks_completed: number;
  completion_rate: number;
}

// ===========================================================================
// BOM INTERFACES
// ===========================================================================

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
  };
}

// ===========================================================================
// ADDITIONAL TASK API
// ===========================================================================

/**
 * Get all technicians
 */
export const getTechnicians = () =>
  axios.get<Technician[]>("/technicians");

/**
 * Get task statistics
 */
export const getTaskStats = () =>
  axios.get("/tasks/stats");

/**
 * Update Task BOM
 */
export const updateTaskBOM = (taskId: number, data: { items: Partial<TaskItem>[] }) =>
  axios.put(`/tasks/${taskId}/bom`, data);

/**
 * Approve Task BOM
 */
export const approveTaskBOM = (taskId: number) =>
  axios.post(`/tasks/${taskId}/bom/approve`);

/**
 * Complete Task
 */
export const completeTask = (taskId: number, data: { completion_notes?: string; actual_hours?: number }) =>
  axios.post(`/tasks/${taskId}/complete`, data);
