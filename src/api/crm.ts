// =====================================================================
// FILE: src/api/crm.ts
// CRM API Client - Leads, Deals, and Activities
// =====================================================================

import { apiClient } from '@/lib/api';
import type {
    LeadCreate,
    LeadUpdate,
    LeadOut,
    DealCreate,
    DealOut,
    ActivityCreate,
    ActivityOut,
} from '@/types/api.types';

const axios = apiClient.axios;

// =====================================================================
// LEADS
// =====================================================================

/**
 * Create a new lead
 */
export const createLead = async (data: LeadCreate): Promise<LeadOut> => {
    const response = await axios.post<LeadOut>('/crm/leads', data);
    return response.data;
};

/**
 * Get all leads with pagination
 */
export const getLeads = async (params?: {
    skip?: number;
    limit?: number;
}): Promise<LeadOut[]> => {
    const response = await axios.get<LeadOut[]>('/crm/leads', { params });
    return response.data;
};

/**
 * Update a lead
 */
export const updateLead = async (
    leadId: number,
    data: LeadUpdate
): Promise<LeadOut> => {
    const response = await axios.put<LeadOut>(`/crm/leads/${leadId}`, data);
    return response.data;
};

// =====================================================================
// DEALS
// =====================================================================

/**
 * Create a new deal from a lead
 */
export const createDeal = async (data: DealCreate): Promise<DealOut> => {
    const response = await axios.post<DealOut>('/crm/deals', data);
    return response.data;
};

// =====================================================================
// ACTIVITIES
// =====================================================================

/**
 * Log an activity (call, email, meeting, note, site survey)
 */
export const logActivity = async (
    data: ActivityCreate
): Promise<ActivityOut> => {
    const response = await axios.post<ActivityOut>('/crm/activities', data);
    return response.data;
};

// =====================================================================
// CRM API OBJECT
// =====================================================================

export const crmApi = {
    // Leads
    createLead,
    getLeads,
    updateLead,

    // Deals
    createDeal,

    // Activities
    logActivity,
};

export default crmApi;
