// Marketing API Client
import apiClient from './axios';

export interface Campaign {
    id: number;
    name: string;
    description?: string;
    target_leads?: number;
    budget?: number;
    start_date?: string;
    end_date?: string;
    created_at: string;
}

export interface Lead {
    id: number;
    name: string;
    email?: string;
    phone: string;
    company?: string;
    source: 'website' | 'referral' | 'social_media' | 'cold_call' | 'walk_in' | 'other';
    status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'converted' | 'lost';
    notes?: string;
    assigned_to?: number;
    converted_to_project_id?: number;
    created_at: string;
}

export const marketingApi = {
    // Campaigns
    createCampaign: (data: Partial<Campaign>) =>
        apiClient.post<Campaign>('/api/v1/marketing/campaigns', data),

    getCampaignPerformance: (campaignId: number) =>
        apiClient.get(`/api/v1/marketing/campaigns/${campaignId}/performance`),

    // Leads
    recordLead: (data: Partial<Lead>) =>
        apiClient.post<Lead>('/api/v1/marketing/leads', data),
};

export default marketingApi;
