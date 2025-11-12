import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workflowsApi } from '../workflows';
import { apiClient } from '@/lib/api';

vi.mock('@/lib/api');

describe('workflowsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listPending', () => {
    it('calls API without role parameter', async () => {
      const mockData = [{ id: 1, status: 'pending' }];
      (apiClient.get as any).mockResolvedValue({ data: mockData });

      const result = await workflowsApi.listPending();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/workflows/pending');
      expect(result.data).toEqual(mockData);
    });

    it('calls API with role parameter', async () => {
      const mockData = [{ id: 1, status: 'pending' }];
      (apiClient.get as any).mockResolvedValue({ data: mockData });

      const result = await workflowsApi.listPending('finance');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/workflows/pending/by-role/finance'
      );
      expect(result.data).toEqual(mockData);
    });

    it('encodes special characters in role', async () => {
      const mockData = [{ id: 1, status: 'pending' }];
      (apiClient.get as any).mockResolvedValue({ data: mockData });

      await workflowsApi.listPending('finance manager');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/workflows/pending/by-role/finance%20manager'
      );
    });
  });

  describe('approveInstance', () => {
    it('sends approve request', async () => {
      const mockResponse = { data: { success: true } };
      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await workflowsApi.approveInstance(123);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/workflows/123/approve');
      expect(result).toEqual(mockResponse);
    });

    it('handles approval errors', async () => {
      const error = new Error('Approval failed');
      (apiClient.post as any).mockRejectedValue(error);

      await expect(workflowsApi.approveInstance(123)).rejects.toThrow(
        'Approval failed'
      );
    });
  });

  describe('rejectInstance', () => {
    it('sends reject request', async () => {
      const mockResponse = { data: { success: true } };
      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await workflowsApi.rejectInstance(456);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/workflows/456/reject');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('commentInstance', () => {
    it('sends comment with all parameters', async () => {
      const mockResponse = { data: { success: true } };
      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await workflowsApi.commentInstance(123, 456, 'Test comment');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/workflows/123/comment',
        {
          instance_id: 123,
          action: 'comment',
          user_id: 456,
          comment: 'Test comment',
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles empty comments', async () => {
      const mockResponse = { data: { success: true } };
      (apiClient.post as any).mockResolvedValue(mockResponse);

      await workflowsApi.commentInstance(123, 456, '');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/workflows/123/comment',
        {
          instance_id: 123,
          action: 'comment',
          user_id: 456,
          comment: '',
        }
      );
    });
  });

  describe('escalate', () => {
    it('escalates without comment', async () => {
      const mockResponse = { data: { success: true } };
      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await workflowsApi.escalate(789);

      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/workflows/789/escalate');
      expect(result).toEqual(mockResponse);
    });

    it('escalates with comment', async () => {
      const mockResponse = { data: { success: true } };
      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await workflowsApi.escalate(789, 'Needs senior approval');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/workflows/789/escalate?comment=Needs%20senior%20approval'
      );
      expect(result).toEqual(mockResponse);
    });

    it('encodes special characters in comment', async () => {
      const mockResponse = { data: { success: true } };
      (apiClient.post as any).mockResolvedValue(mockResponse);

      await workflowsApi.escalate(789, 'Urgent: Needs review ASAP!');

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/workflows/789/escalate?comment=Urgent%3A%20Needs%20review%20ASAP!'
      );
    });
  });

  describe('error handling', () => {
    it('propagates network errors', async () => {
      const networkError = new Error('Network error');
      (apiClient.get as any).mockRejectedValue(networkError);

      await expect(workflowsApi.listPending()).rejects.toThrow('Network error');
    });

    it('propagates server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { detail: 'Internal server error' },
        },
      };
      (apiClient.post as any).mockRejectedValue(serverError);

      await expect(workflowsApi.approveInstance(123)).rejects.toMatchObject(
        serverError
      );
    });

    it('propagates authentication errors', async () => {
      const authError = {
        response: {
          status: 401,
          data: { detail: 'Unauthorized' },
        },
      };
      (apiClient.get as any).mockRejectedValue(authError);

      await expect(workflowsApi.listPending('finance')).rejects.toMatchObject(
        authError
      );
    });
  });
});
