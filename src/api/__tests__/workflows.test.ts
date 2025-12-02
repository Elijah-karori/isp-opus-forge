import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workflowsApi } from '../workflows';
import { apiClient } from '@/lib/api';

vi.mock('@/lib/api');

describe('workflowsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listPending', () => {
    it('calls API to get my approvals', async () => {
      const mockData = [{ id: 1, status: 'pending' }];
      (apiClient.get as any).mockResolvedValue(mockData);

      const result = await workflowsApi.listPending();

      expect(apiClient.get).toHaveBeenCalledWith('/workflow/my-approvals');
      expect(result).toEqual(mockData);
    });

    it('ignores role parameter (uses my-approvals)', async () => {
      const mockData = [{ id: 1, status: 'pending' }];
      (apiClient.get as any).mockResolvedValue(mockData);

      const result = await workflowsApi.listPending('finance');

      expect(apiClient.get).toHaveBeenCalledWith('/workflow/my-approvals');
      expect(result).toEqual(mockData);
    });
  });

  describe('approveInstance', () => {
    it('sends approve request without comment', async () => {
      const mockResponse = { data: { success: true } };
      (apiClient.request as any).mockResolvedValue(mockResponse);

      const result = await workflowsApi.approveInstance(123);

      expect(apiClient.request).toHaveBeenCalledWith({
        url: '/workflow/123/approve',
        method: 'POST',
        params: { comment: undefined }
      });
      expect(result).toEqual(mockResponse);
    });

    it('sends approve request with comment', async () => {
      const mockResponse = { data: { success: true } };
      (apiClient.request as any).mockResolvedValue(mockResponse);

      const result = await workflowsApi.approveInstance(123, 'Looks good');

      expect(apiClient.request).toHaveBeenCalledWith({
        url: '/workflow/123/approve',
        method: 'POST',
        params: { comment: 'Looks good' }
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles approval errors', async () => {
      const error = new Error('Approval failed');
      (apiClient.request as any).mockRejectedValue(error);

      await expect(workflowsApi.approveInstance(123)).rejects.toThrow(
        'Approval failed'
      );
    });
  });

  describe('rejectInstance', () => {
    it('sends reject request without comment', async () => {
      const mockResponse = { data: { success: true } };
      (apiClient.request as any).mockResolvedValue(mockResponse);

      const result = await workflowsApi.rejectInstance(456);

      expect(apiClient.request).toHaveBeenCalledWith({
        url: '/workflow/456/reject',
        method: 'POST',
        params: { comment: undefined }
      });
      expect(result).toEqual(mockResponse);
    });

    it('sends reject request with comment', async () => {
      const mockResponse = { data: { success: true } };
      (apiClient.request as any).mockResolvedValue(mockResponse);

      const result = await workflowsApi.rejectInstance(456, 'Needs revision');

      expect(apiClient.request).toHaveBeenCalledWith({
        url: '/workflow/456/reject',
        method: 'POST',
        params: { comment: 'Needs revision' }
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('commentInstance', () => {
    it('sends comment as query parameter', async () => {
      const mockResponse = { data: { success: true } };
      (apiClient.request as any).mockResolvedValue(mockResponse);

      const result = await workflowsApi.commentInstance(123, 456, 'Test comment');

      expect(apiClient.request).toHaveBeenCalledWith({
        url: '/workflow/123/comment',
        method: 'POST',
        params: { comment: 'Test comment' }
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles empty comments', async () => {
      const mockResponse = { data: { success: true } };
      (apiClient.request as any).mockResolvedValue(mockResponse);

      await workflowsApi.commentInstance(123, 456, '');

      expect(apiClient.request).toHaveBeenCalledWith({
        url: '/workflow/123/comment',
        method: 'POST',
        params: { comment: '' }
      });
    });
  });

  // Escalate is no longer in the API spec, commenting out these tests
  // describe('escalate', () => {
  //   it('escalates without comment', async () => {
  //     const mockResponse = { data: { success: true } };
  //     (apiClient.post as any).mockResolvedValue(mockResponse);
  //
  //     const result = await workflowsApi.escalate(789);
  //
  //     expect(apiClient.post).toHaveBeenCalledWith('/workflow/789/escalate');
  //     expect(result).toEqual(mockResponse);
  //   });
  // });

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
      (apiClient.request as any).mockRejectedValue(serverError);

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

      await expect(workflowsApi.listPending()).rejects.toMatchObject(
        authError
      );
    });
  });
});
