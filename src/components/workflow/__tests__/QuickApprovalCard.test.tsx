import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor, fireEvent } from '@testing-library/dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuickApprovalCard } from '../QuickApprovalCard';
import { workflowsApi } from '@/api/workflows';

vi.mock('@/api/workflows');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('QuickApprovalCard', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with instance ID', () => {
    render(
      <QuickApprovalCard instanceId={123} onComplete={mockOnComplete} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Quick Approval')).toBeInTheDocument();
    expect(screen.getByText('Instance #123')).toBeInTheDocument();
  });

  it('allows entering comments', () => {
    render(
      <QuickApprovalCard instanceId={123} onComplete={mockOnComplete} />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByPlaceholderText('Add your comments here...');
    fireEvent.change(textarea, { target: { value: 'Test comment' } });

    expect(textarea).toHaveValue('Test comment');
  });

  it('handles approve action with comment', async () => {
    (workflowsApi.approveInstance as any).mockResolvedValue({ data: {} });
    (workflowsApi.commentInstance as any).mockResolvedValue({ data: {} });

    render(
      <QuickApprovalCard instanceId={123} onComplete={mockOnComplete} />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByPlaceholderText('Add your comments here...');
    fireEvent.change(textarea, { target: { value: 'Looks good' } });

    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(workflowsApi.approveInstance).toHaveBeenCalledWith(123);
      expect(workflowsApi.commentInstance).toHaveBeenCalledWith(123, 0, 'Looks good');
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('handles approve action without comment', async () => {
    (workflowsApi.approveInstance as any).mockResolvedValue({ data: {} });

    render(
      <QuickApprovalCard instanceId={123} onComplete={mockOnComplete} />,
      { wrapper: createWrapper() }
    );

    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(workflowsApi.approveInstance).toHaveBeenCalledWith(123);
      expect(workflowsApi.commentInstance).not.toHaveBeenCalled();
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('requires comment for rejection', async () => {
    const { toast } = await import('sonner');

    render(
      <QuickApprovalCard instanceId={123} onComplete={mockOnComplete} />,
      { wrapper: createWrapper() }
    );

    const rejectButton = screen.getByText('Reject');
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please provide a reason for rejection');
      expect(workflowsApi.rejectInstance).not.toHaveBeenCalled();
    });
  });

  it('handles reject action with comment', async () => {
    (workflowsApi.rejectInstance as any).mockResolvedValue({ data: {} });
    (workflowsApi.commentInstance as any).mockResolvedValue({ data: {} });

    render(
      <QuickApprovalCard instanceId={123} onComplete={mockOnComplete} />,
      { wrapper: createWrapper() }
    );

    const textarea = screen.getByPlaceholderText('Add your comments here...');
    fireEvent.change(textarea, { target: { value: 'Does not meet requirements' } });

    const rejectButton = screen.getByText('Reject');
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(workflowsApi.rejectInstance).toHaveBeenCalledWith(123);
      expect(workflowsApi.commentInstance).toHaveBeenCalledWith(
        123,
        0,
        'Does not meet requirements'
      );
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('disables buttons during processing', async () => {
    (workflowsApi.approveInstance as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(
      <QuickApprovalCard instanceId={123} onComplete={mockOnComplete} />,
      { wrapper: createWrapper() }
    );

    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);

    expect(approveButton).toBeDisabled();
    expect(screen.getByText('Reject')).toBeDisabled();
  });

  it('handles API errors', async () => {
    const { toast } = await import('sonner');
    (workflowsApi.approveInstance as any).mockRejectedValue(
      new Error('Network error')
    );

    render(
      <QuickApprovalCard instanceId={123} onComplete={mockOnComplete} />,
      { wrapper: createWrapper() }
    );

    const approveButton = screen.getByText('Approve');
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to approve');
      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });
});
