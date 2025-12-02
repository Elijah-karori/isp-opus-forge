import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from "@/api/tasks";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, MapPin, Building } from "lucide-react";

interface TaskDetailsProps {
    task: Task;
    onClose: () => void;
}

export function TaskDetails({ task, onClose }: TaskDetailsProps) {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Task Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div>
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-xl">{task.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline">{task.status.replace('_', ' ')}</Badge>
                                    {task.priority && <Badge variant="secondary">{task.priority}</Badge>}
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">{task.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Assignment</h4>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Technician</div>
                                    <div className="text-sm text-muted-foreground">{task.technician?.full_name || 'Unassigned'}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                    <Calendar className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Scheduled Date</div>
                                    <div className="text-sm text-muted-foreground">
                                        {task.scheduled_date ? new Date(task.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Project Info</h4>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Building className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Project</div>
                                    <div className="text-sm text-muted-foreground">{task.project?.name || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <MapPin className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">Location</div>
                                    <div className="text-sm text-muted-foreground">{task.project?.address || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
