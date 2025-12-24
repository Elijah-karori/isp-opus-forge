
import { AuditLogs } from '@/components/audit/AuditLogs';

export default function AuditLogsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                <p className="text-muted-foreground">
                    Monitor sensitive actions and changes within the system.
                </p>
            </div>
            <AuditLogs />
        </div>
    );
}
