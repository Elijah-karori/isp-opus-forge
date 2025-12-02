// Budget Template Upload Component
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BudgetTemplateUploadProps {
    onSuccess?: (data: any) => void;
}

export const BudgetTemplateUpload: React.FC<BudgetTemplateUploadProps> = ({ onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.xlsx')) {
                toast({
                    title: 'Invalid File',
                    description: 'Please select an Excel file (.xlsx)',
                    variant: 'destructive',
                });
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast({
                title: 'No File Selected',
                description: 'Please select a file to upload',
                variant: 'destructive',
            });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('access_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

            const response = await fetch(
                `${apiUrl}/api/v1/finance/upload-budget/`,
                {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Upload failed');
            }

            const data = await response.json();

            toast({
                title: 'Success',
                description: 'Budget uploaded successfully!',
            });

            onSuccess?.(data);
            setFile(null);

            // Reset file input
            const fileInput = document.getElementById('budget-file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (error: any) {
            console.error('Upload failed:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to upload budget',
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="budget-file-input">Select Budget File</Label>
                <div className="flex items-center gap-2 mt-2">
                    <Input
                        id="budget-file-input"
                        type="file"
                        accept=".xlsx"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="flex-1"
                    />
                    {file && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileSpreadsheet className="h-4 w-4" />
                            <span>{file.name}</span>
                        </div>
                    )}
                </div>
            </div>

            <Button onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                    <Upload className="h-4 w-4 mr-2" />
                )}
                {uploading ? 'Uploading...' : 'Upload Budget'}
            </Button>
        </div>
    );
};
