// Workflow API Service
import { apiClient } from '@/lib/api';

export interface WorkflowNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: any;
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    type?: string;
}

export interface WorkflowGraph {
    id?: number;
    name: string;
    description: string;
    model_name: string;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    is_active?: boolean;
}

export const workflowService = {
    async list() {
        return apiClient.get('/workflows/');
    },

    async getGraph(id: number) {
        return apiClient.get(`/workflows/graph/${id}`);
    },

    async createGraph(data: WorkflowGraph) {
        return apiClient.post('/workflows/graph', data);
    },

    async updateGraph(id: number, data: Partial<WorkflowGraph>) {
        return apiClient.put(`/workflows/graph/${id}`, data);
    },

    async deleteGraph(id: number) {
        await apiClient.delete(`/workflows/graph/${id}`);
    }
};