// Marketing API Client
import { apiClient } from '@/lib/api';

const axios = apiClient.axios;

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
    createCampaign: (data: Partial<Campaign>) => axios.post<Campaign>('/marketing/campaigns', data),
    getCampaignPerformance: (campaignId: number) => axios.get(`/marketing/campaigns/${campaignId}/performance`),
    recordLead: (data: Partial<Lead>) => axios.post<Lead>('/marketing/leads', data),
};

export default marketingApi;
