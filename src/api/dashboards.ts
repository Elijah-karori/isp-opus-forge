// src/api/dashboards.ts
import axios from "./axios";

/**
 * Dashboard API client for RBAC v2 endpoints
 * Provides access to aggregated dashboard data with permission-based filtering
 */

export interface ProjectsOverviewResponse {
    total_projects: number;
    by_status: {
        planning: number;
        in_progress: number;
        completed: number;
        on_hold: number;
        cancelled: number;
    };
    by_department: Record<string, {
        department_name: string;
        project_count: number;
    }>;
}

export interface TaskAllocationResponse {
    total_tasks: number;
    by_role: {
        tech_lead: number;
        project_manager: number;
        technician: number;
        customer_support: number;
        marketing: number;
    };
    by_department: Record<string, {
        department_name: string;
        task_count: number;
    }>;
}

export interface BudgetTrackingResponse {
    total_allocated: number;
    total_spent: number;
    variance: number;
    variance_percent: number;
    by_project: Array<{
        project_id: number;
        project_name: string;
        allocated: number;
        spent: number;
        variance: number;
    }>;
}

export interface TeamWorkloadResponse {
    team_members: Array<{
        user_id: number;
        full_name: string;
        role: string;
        active_tasks: number;
        completed_tasks: number;
        workload_percent: number;
    }>;
}

export interface DepartmentOverviewResponse {
    department_id: number;
    department_name: string;
    total_projects: number;
    total_tasks: number;
    total_budget: number;
    team_size: number;
    projects_by_status: Record<string, number>;
    tasks_by_status: Record<string, number>;
}

/**
 * Dashboard APIs
 */
export const dashboardsApi = {
    /**
     * Get overview of all projects by status and department
     * Requires: dashboard:view:all OR dashboard:view:department
     */
    getProjectsOverview: () =>
        axios.get<ProjectsOverviewResponse>("/dashboards/projects-overview"),

    /**
     * Get task distribution by role and department
     * Requires: dashboard:view:all OR dashboard:view:department
     */
    getTaskAllocation: () =>
        axios.get<TaskAllocationResponse>("/dashboards/task-allocation"),

    /**
     * Get budget vs actual spending across all projects
     * Requires: dashboard:view:all OR finance:read:all
     */
    getBudgetTracking: () =>
        axios.get<BudgetTrackingResponse>("/dashboards/budget-tracking"),

    /**
     * Get current workload per team member
     * Requires: dashboard:view:all OR hr:read:all
     */
    getTeamWorkload: () =>
        axios.get<TeamWorkloadResponse>("/dashboards/team-workload"),

    /**
     * Get comprehensive overview for a specific department
     * Requires: dashboard:view:all OR dashboard:view:department (own department only)
     */
    getDepartmentOverview: (departmentId: number) =>
        axios.get<DepartmentOverviewResponse>(`/dashboards/department/${departmentId}/overview`),
};
