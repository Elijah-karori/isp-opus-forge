// =====================================================================
// FILE: src/api/marketing.ts
// Marketing API Client - Campaigns and Lead Recording
// =====================================================================

import { apiClient } from '@/lib/api';
import type { CampaignCreate, MarketingLeadCreate } from '@/types/api.types';

const axios = apiClient.axios;

// =====================================================================
// TYPES
// =====================================================================

export interface Campaign {
  id: number;
  name: string;
  description?: string;
  target_leads?: number;
  budget?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  created_at: string;
}

export interface CampaignPerformance {
  campaign_id: number;
  campaign_name: string;
  leads_generated: number;
  target_leads: number;
  conversion_rate: number;
  budget_used: string;
  roi: number;
}

// =====================================================================
// CAMPAIGNS
// =====================================================================

/**
 * Create a new marketing campaign
 */
export const createCampaign = async (data: CampaignCreate): Promise<Campaign> => {
  const response = await axios.post<Campaign>('/marketing/campaigns', data);
  return response.data;
};

/**
 * Get all campaigns
 */
export const getCampaigns = async (): Promise<Campaign[]> => {
  const response = await axios.get<Campaign[]>('/marketing/campaigns');
  return response.data;
};

/**
 * Get campaign performance metrics
 */
export const getCampaignPerformance = async (
  campaignId: number
): Promise<CampaignPerformance> => {
  const response = await axios.get<CampaignPerformance>(
    `/marketing/campaigns/${campaignId}/performance`
  );
  return response.data;
};

// =====================================================================
// LEADS
// =====================================================================

/**
 * Record a marketing lead
 */
export const recordLead = async (data: MarketingLeadCreate): Promise<any> => {
  const response = await axios.post('/marketing/leads', data);
  return response.data;
};

// =====================================================================
// LEGACY FUNCTIONS (kept for backward compatibility)
// =====================================================================

export const postMarketing = (payload: any) =>
  axios.post('/marketing/posts', payload);

export const listMarketing = () => axios.get('/marketing/posts');

export async function approveCampaign(
  id: number,
  action: string,
  comment?: string
) {
  return axios.post('/workflow/actions', {
    instance_id: id,
    action,
    comment,
  });
}

// =====================================================================
// MARKETING API OBJECT
// =====================================================================

export const marketingApi = {
  // Campaigns
  createCampaign,
  getCampaigns,
  getCampaignPerformance,
  approveCampaign,

  // Leads
  recordLead,

  // Legacy
  postMarketing,
  listMarketing,
};

export default marketingApi;
