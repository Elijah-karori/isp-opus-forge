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
        const response = await apiClient.get('/workflows/');
        return response.data;
    },

    async getGraph(id: number) {
        const response = await apiClient.get(`/workflows/graph/${id}`);
        return response.data;
    },

    async createGraph(data: WorkflowGraph) {
        const response = await apiClient.post('/workflows/graph', data);
        return response.data;
    },

    async updateGraph(id: number, data: Partial<WorkflowGraph>) {
        const response = await apiClient.put(`/workflows/graph/${id}`, data);
        return response.data;
    },

    async deleteGraph(id: number) {
        await apiClient.delete(`/workflows/graph/${id}`);
    }
};
