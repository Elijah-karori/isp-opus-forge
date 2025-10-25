
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  project_id: number;
  project_title: string;
  created_at: string;
}

interface BOMItem {
  item: string;
  quantity: number;
}

const getStatusBadge = (status: Task['status']) => {
    const variants = {
      pending: { class: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Pending' },
      in_progress: { class: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'In Progress' },
      completed: { class: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Completed' },
      on_hold: { class: 'bg-orange-500/10 text-orange-500 border-orange-500/20', label: 'On Hold' },
      cancelled: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Cancelled' },
    };
    return variants[status] || variants.pending;
};

const TechnicianTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const fetchTasks = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // Assuming the API returns tasks for the logged-in technician
            const response = await apiClient.getTasks();
            setTasks(response);
        } catch (error) {
            toast.error("Failed to fetch tasks.", { description: "Please try refreshing the page." });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [user]);

    const handleStatusUpdate = async (taskId: number, status: Task['status'], comment?: string) => {
        try {
            await apiClient.updateTask(taskId, { status, comment });
            toast.success(`Task status updated to ${status.replace('_', ' ')}.`);
            fetchTasks(); // Refresh tasks list
        } catch (error) {
            toast.error("Failed to update task status.");
            console.error(error);
        }
    };
    
    const handleBOMSubmit = async (taskId: number, bom: BOMItem[]) => {
        try {
            await apiClient.createTaskBOM(taskId, { bom_items: bom });
            toast.success("BOM submitted for approval.", { description: "Your lead technician has been notified." });
            fetchTasks();
        } catch (error) {
            toast.error("Failed to submit BOM.");
            console.error(error);
        }
    };

    if (isLoading) {
        return <div>Loading tasks...</div>;
    }
    
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
    const completedTasks = tasks.filter(task => task.status === 'completed');

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                <p className="text-muted-foreground">View and manage your assigned tasks.</p>
            </header>

            <TaskSection title="Pending" tasks={pendingTasks} onStatusUpdate={handleStatusUpdate} />
            <TaskSection title="In Progress" tasks={inProgressTasks} onStatusUpdate={handleStatusUpdate} onBOMSubmit={handleBOMSubmit} />
            <TaskSection title="Completed" tasks={completedTasks} />
        </div>
    );
};

// =====================================================================
// Task Section Component
// =====================================================================

interface TaskSectionProps {
    title: string;
    tasks: Task[];
    onStatusUpdate?: (taskId: number, status: Task['status'], comment?: string) => void;
    onBOMSubmit?: (taskId: number, bom: BOMItem[]) => void;
}

const TaskSection = ({ title, tasks, onStatusUpdate, onBOMSubmit }: TaskSectionProps) => {
    if (tasks.length === 0) return null;

    return (
        <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">{title}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} onStatusUpdate={onStatusUpdate} onBOMSubmit={onBOMSubmit} />
                ))}
            </div>
        </section>
    );
};

// =====================================================================
// Task Card Component
// =====================================================================

interface TaskCardProps {
    task: Task;
    onStatusUpdate?: (taskId: number, status: Task['status'], comment?: string) => void;
    onBOMSubmit?: (taskId: number, bom: BOMItem[]) => void;
}

const TaskCard = ({ task, onStatusUpdate, onBOMSubmit }: TaskCardProps) => {
    const statusInfo = getStatusBadge(task.status);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-start">
                    <span>{task.title}</span>
                    <Badge variant="outline" className={statusInfo.class}>{statusInfo.label}</Badge>
                </CardTitle>
                <CardDescription>
                    Project: {task.project_title} | Created: {new Date(task.created_at).toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{task.description}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                {task.status === 'pending' && onStatusUpdate && (
                    <Button onClick={() => onStatusUpdate(task.id, 'in_progress')}>Start Task</Button>
                )}
                {task.status === 'in_progress' && onStatusUpdate && onBOMSubmit &&(
                    <>
                        <UpdateTaskDialog taskId={task.id} onUpdate={onStatusUpdate} />
                        <AddBOMDialog taskId={task.id} onSubmit={onBOMSubmit} />
                        <CompleteTaskDialog taskId={task.id} onComplete={onStatusUpdate} />
                    </>
                )}
            </CardFooter>
        </Card>
    );
};

// =====================================================================
// Dialog Components
// =====================================================================

const UpdateTaskDialog = ({ taskId, onUpdate }: { taskId: number, onUpdate: (taskId: number, status: Task['status'], comment: string) => void }) => {
    const [comment, setComment] = useState('');
    const [open, setOpen] = useState(false);

    const handleSubmit = () => {
        if (!comment.trim()) {
            toast.warning("Comment cannot be empty.");
            return;
        }
        onUpdate(taskId, 'in_progress', comment);
        setOpen(false);
        setComment('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Update</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Task Update</DialogTitle>
                </DialogHeader>
                <Textarea 
                    placeholder="Provide an update on your progress..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
                <DialogFooter>
                    <Button onClick={handleSubmit}>Submit Update</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const CompleteTaskDialog = ({ taskId, onComplete }: { taskId: number, onComplete: (taskId: number, status: Task['status'], comment: string) => void }) => {
    const [notes, setNotes] = useState('');
    const [open, setOpen] = useState(false);

    const handleSubmit = () => {
        if (!notes.trim()) {
            toast.warning("Completion notes cannot be empty.");
            return;
        }
        onComplete(taskId, 'completed', notes);
        setOpen(false);
        setNotes('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Complete</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Complete Task</DialogTitle>
                </DialogHeader>
                <Textarea 
                    placeholder="Add final completion notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <DialogFooter>
                    <Button onClick={handleSubmit}>Confirm Completion</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const AddBOMDialog = ({ taskId, onSubmit }: { taskId: number, onSubmit: (taskId: number, bom: BOMItem[]) => void }) => {
    const [bomItems, setBomItems] = useState<BOMItem[]>([{ item: '', quantity: 1 }]);
    const [open, setOpen] = useState(false);

    const handleItemChange = (index: number, field: 'item' | 'quantity', value: string | number) => {
        const newItems = [...bomItems];
        if(field === 'quantity') {
            newItems[index][field] = Number(value) < 1 ? 1 : Number(value);
        } else {
            newItems[index][field] = String(value);
        }
        setBomItems(newItems);
    };
    
    const addItem = () => setBomItems([...bomItems, { item: '', quantity: 1 }]);
    const removeItem = (index: number) => setBomItems(bomItems.filter((_, i) => i !== index));

    const handleSubmit = () => {
        const validItems = bomItems.filter(i => i.item.trim() && i.quantity > 0);
        if (validItems.length === 0) {
            toast.warning("Please add at least one valid BOM item.");
            return;
        }
        onSubmit(taskId, validItems);
        setOpen(false);
        setBomItems([{ item: '', quantity: 1 }]);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Add BOM</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create Bill of Materials (BOM)</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item Name</TableHead>
                                <TableHead className="w-[100px]">Quantity</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bomItems.map((bomItem, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Input 
                                            placeholder="e.g., Cat-6 Cable"
                                            value={bomItem.item}
                                            onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input 
                                            type="number"
                                            value={bomItem.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                            min="1"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={bomItems.length <= 1}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     <Button variant="outline" size="sm" onClick={addItem} className="gap-2">
                        <PlusCircle className="h-4 w-4" /> Add Item
                    </Button>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Submit for Approval</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TechnicianTasks;
