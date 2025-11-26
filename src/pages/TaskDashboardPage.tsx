import { TaskDashboard } from '@/components/tasks/TaskDashboard';
import PermissionGate from '@/components/PermissionGate';
import { PERMISSIONS } from '@/constants/permissions';

const TaskDashboardPage = () => {
    return (
        <PermissionGate anyPermission={[PERMISSIONS.DASHBOARD.VIEW_ALL, PERMISSIONS.TASK.READ_ALL, PERMISSIONS.TASK.READ_ASSIGNED]}>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Task Management Dashboard</h1>
                    <p className="text-muted-foreground">
                        Monitor task allocation, team workload, and project progress
                    </p>
                </div>

                {/* Dashboard Content */}
                <TaskDashboard />
            </div>
        </PermissionGate>
    );
};

export default TaskDashboardPage;
