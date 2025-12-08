// Budget Template Download Component
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from '@/api/axios';

interface BudgetTemplateDownloadProps {
    projectName?: string;
}

export const BudgetTemplateDownload: React.FC<BudgetTemplateDownloadProps> = ({
    projectName = 'New Project'
}) => {
    const [downloading, setDownloading] = useState(false);
    const { toast } = useToast();

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const response = await axios.get(
                `/finance/budget-template`,
                {
                    params: { project_name: projectName },
                    responseType: 'blob',
                }
            ) as unknown as Blob;

            const blob = new Blob([response], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `budget_template_${projectName.replace(/\s+/g, '_')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: 'Success',
                description: 'Budget template downloaded successfully',
            });
        } catch (error: any) {
            console.error('Download failed:', error);
            toast({
                title: 'Error',
                description: 'Failed to download budget template',
                variant: 'destructive',
            });
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Button onClick={handleDownload} disabled={downloading} variant="outline">
            {downloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
                <Download className="h-4 w-4 mr-2" />
            )}
            {downloading ? 'Downloading...' : 'Download Budget Template'}
        </Button>
    );
};
