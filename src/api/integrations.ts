// =====================================================================
// FILE: src/api/integrations.ts
// Integrations API Client - ClickUp and other third-party services
// =====================================================================

import { apiClient } from '@/lib/api';

const axios = apiClient.axios;

// =====================================================================
// TYPES
// =====================================================================

export interface ClickUpTeam {
    id: string;
    name: string;
    color?: string;
    avatar?: string;
    members?: any[];
}

export interface ClickUpSpace {
    id: string;
    name: string;
    private: boolean;
    statuses?: any[];
    multiple_assignees?: boolean;
    features?: Record<string, any>;
}

export interface ClickUpList {
    id: string;
    name: string;
    orderindex: number;
    status?: Record<string, any>;
    priority?: Record<string, any>;
    assignee?: any;
    task_count?: number;
    due_date?: string;
    start_date?: string;
    folder?: Record<string, any>;
    space?: Record<string, any>;
}

export interface ClickUpWebhookResponse {
    id: string;
    webhook: {
        id: string;
        userid: number;
        team_id: number;
        endpoint: string;
        client_id?: string;
        events: string[];
        task_id?: string;
        list_id?: string;
        folder_id?: string;
        space_id?: string;
        health?: {
            status: string;
            fail_count: number;
        };
        secret?: string;
    };
}

// =====================================================================
// CLICKUP INTEGRATION
// =====================================================================

/**
 * Get ClickUp teams (workspaces)
 */
export const getClickUpTeams = async (): Promise<ClickUpTeam[]> => {
    const response = await axios.get<ClickUpTeam[]>('/integrations/clickup/teams');
    return response.data;
};

/**
 * Get ClickUp spaces for a team
 */
export const getClickUpSpaces = async (teamId: string): Promise<ClickUpSpace[]> => {
    const response = await axios.get<ClickUpSpace[]>(
        `/integrations/clickup/teams/${teamId}/spaces`
    );
    return response.data;
};

/**
 * Get ClickUp lists for a space
 */
export const getClickUpLists = async (spaceId: string): Promise<ClickUpList[]> => {
    const response = await axios.get<ClickUpList[]>(
        `/integrations/clickup/spaces/${spaceId}/lists`
    );
    return response.data;
};

/**
 * Create/Register a ClickUp webhook for a team
 * Uses CLICKUP_WEBHOOK_URL from backend environment
 */
export const createClickUpWebhook = async (
    teamId: string
): Promise<ClickUpWebhookResponse> => {
    const response = await axios.post<ClickUpWebhookResponse>(
        `/integrations/clickup/teams/${teamId}/webhook`
    );
    return response.data;
};

// =====================================================================
// INTEGRATIONS API OBJECT
// =====================================================================

export const integrationsApi = {
    // ClickUp
    clickup: {
        getTeams: getClickUpTeams,
        getSpaces: getClickUpSpaces,
        getLists: getClickUpLists,
        createWebhook: createClickUpWebhook,
    },
};

export default integrationsApi;
