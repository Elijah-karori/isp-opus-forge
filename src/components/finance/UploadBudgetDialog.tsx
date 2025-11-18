import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { uploadBudget } from '@/api/finance';
import { FileSpreadsheet, Upload } from 'lucide-react';

interface UploadBudgetDialogProps {
  open: boolean;
  onClose: () => void;
}

export function UploadBudgetDialog({ open, onClose }: UploadBudgetDialogProps) {
  const [file, setFile] = useState<File | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadBudget(file),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Budget uploaded successfully' });
      queryClient.invalidateQueries({ queryKey: ['masterBudgets'] });
      onClose();
      setFile(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to upload budget',
        variant: 'destructive' 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Budget from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file containing master budget and sub-budget information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="h-12 w-12 text-primary" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-primary hover:underline">Choose a file</span>
                  {' '}or drag and drop
                </Label>
                <p className="text-sm text-muted-foreground">Excel files (.xlsx, .xls)</p>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-sm">Excel Format Requirements:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Row 1: Headers (Master Budget Name, Start Date, End Date, Total Amount, Sub Budget Name, Sub Budget Amount)</li>
              <li>Row 2: Master budget details</li>
              <li>Row 3+: Sub-budget entries</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || uploadMutation.isPending}>
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Budget'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
