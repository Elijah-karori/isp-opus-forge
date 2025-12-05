import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, createTask, type Task, type InfrastructureType, type TaskStatus } from "@/api/tasks";
import TaskCard from "@/modules/tasks/components/TaskCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Wifi,
  Radio,
  Cable,
  Network,
  Server,
  MoreHorizontal,
  Filter,
  ClipboardList,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useToast } from "@/hooks/use-toast";
import PermissionGate from "@/components/PermissionGate";
import { PERMISSIONS } from "@/constants/permissions";

// Infrastructure type configurations with icons and colors
const INFRASTRUCTURE_CATEGORIES = [
  { value: "all", label: "All Tasks", icon: ClipboardList, color: "bg-primary/10 text-primary border-primary/20" },
  { value: "pppoe", label: "PPPoE", icon: Cable, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { value: "hotspot", label: "Hotspot", icon: Wifi, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { value: "fiber", label: "Fiber", icon: Radio, color: "bg-green-500/10 text-green-600 border-green-500/20" },
  { value: "wireless", label: "Wireless", icon: Network, color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  { value: "network_infrastructure", label: "Network Infra", icon: Server, color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  { value: "other", label: "Other", icon: MoreHorizontal, color: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
] as const;

const STATUS_FILTERS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_approval", label: "Awaiting Approval" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function TaskListPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: tasksResponse, isLoading, isError } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => getTasks(),
  });

  const tasks = tasksResponse?.data || [];

  // Filter tasks based on category, status, and search
  const filteredTasks = tasks.filter((task: Task) => {
    const matchesCategory = selectedCategory === "all" || task.infrastructure_type === selectedCategory;
    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.project?.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Get task counts by category
  const getCategoryCount = (category: string) => {
    if (category === "all") return tasks.length;
    return tasks.filter((t: Task) => t.infrastructure_type === category).length;
  };

  // Get task counts by status
  const getStatusCount = (status: string) => {
    if (status === "all") return filteredTasks.length;
    return filteredTasks.filter((t: Task) => t.status === status).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <ClipboardList className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Error fetching tasks. Please try again.</p>
        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["tasks"] })}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">
            Manage and track installation tasks by infrastructure type
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.TASK.CREATE_ALL}>
          <Button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </PermissionGate>
      </div>

      {/* Infrastructure Category Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter by Infrastructure Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {INFRASTRUCTURE_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const count = getCategoryCount(category.value);
              const isActive = selectedCategory === category.value;
              
              return (
                <Button
                  key={category.value}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={`flex items-center gap-2 ${!isActive ? category.color : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                  <Badge variant={isActive ? "secondary" : "outline"} className="ml-1">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search and Status Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tasks by title, customer, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList>
              {STATUS_FILTERS.slice(0, 4).map((status) => (
                <TabsTrigger key={status.value} value={status.value} className="text-xs">
                  {status.label}
                  {status.value !== "all" && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {getStatusCount(status.value)}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Task Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending", status: "pending", color: "text-yellow-600 bg-yellow-500/10" },
          { label: "In Progress", status: "in_progress", color: "text-blue-600 bg-blue-500/10" },
          { label: "Awaiting Approval", status: "awaiting_approval", color: "text-orange-600 bg-orange-500/10" },
          { label: "Completed", status: "completed", color: "text-green-600 bg-green-500/10" },
        ].map((stat) => (
          <Card key={stat.status} className={`${stat.color} border-0`}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {tasks.filter((t: Task) => t.status === stat.status).length}
              </div>
              <div className="text-sm opacity-80">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tasks Grid/List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || selectedCategory !== "all" || selectedStatus !== "all"
                ? "Try adjusting your filters or search query"
                : "Get started by creating your first task"}
            </p>
            <PermissionGate permission={PERMISSIONS.TASK.CREATE_ALL}>
              <Button onClick={() => setShowTaskForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </PermissionGate>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" 
          : "flex flex-col gap-3"
        }>
          {filteredTasks.map((task: Task) => (
            <TaskCard key={task.id} task={task} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
      />
    </div>
  );
}
