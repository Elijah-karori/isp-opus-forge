import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wifi,
  Radio,
  Cable,
  Network,
  Server,
  MoreHorizontal,
  User,
  MapPin,
  Calendar,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type { Task, TaskStatus } from "@/api/tasks";

interface TaskCardProps {
  task: Task;
  viewMode?: "grid" | "list";
}

// Infrastructure type icons and colors
const INFRASTRUCTURE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pppoe: { icon: Cable, color: "bg-blue-500/10 text-blue-600 border-blue-500/30", label: "PPPoE" },
  hotspot: { icon: Wifi, color: "bg-purple-500/10 text-purple-600 border-purple-500/30", label: "Hotspot" },
  fiber: { icon: Radio, color: "bg-green-500/10 text-green-600 border-green-500/30", label: "Fiber" },
  wireless: { icon: Network, color: "bg-orange-500/10 text-orange-600 border-orange-500/30", label: "Wireless" },
  network_infrastructure: { icon: Server, color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30", label: "Network Infra" },
  other: { icon: MoreHorizontal, color: "bg-gray-500/10 text-gray-600 border-gray-500/30", label: "Other" },
};

// Status configurations
const STATUS_CONFIG: Record<TaskStatus, { color: string; label: string }> = {
  pending: { color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", label: "Pending" },
  in_progress: { color: "bg-blue-500/10 text-blue-600 border-blue-500/30", label: "In Progress" },
  awaiting_approval: { color: "bg-orange-500/10 text-orange-600 border-orange-500/30", label: "Awaiting Approval" },
  completed: { color: "bg-green-500/10 text-green-600 border-green-500/30", label: "Completed" },
  cancelled: { color: "bg-red-500/10 text-red-600 border-red-500/30", label: "Cancelled" },
};

// Priority configurations
const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
  low: { color: "bg-gray-500/10 text-gray-600", label: "Low" },
  medium: { color: "bg-blue-500/10 text-blue-600", label: "Medium" },
  high: { color: "bg-orange-500/10 text-orange-600", label: "High" },
  critical: { color: "bg-red-500/10 text-red-600", label: "Critical" },
};

export default function TaskCard({ task, viewMode = "grid" }: TaskCardProps) {
  const navigate = useNavigate();
  
  const infraConfig = task.infrastructure_type 
    ? INFRASTRUCTURE_CONFIG[task.infrastructure_type] || INFRASTRUCTURE_CONFIG.other
    : null;
  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const InfraIcon = infraConfig?.icon || MoreHorizontal;

  const handleClick = () => {
    navigate(`/tasks/${task.id}`);
  };

  if (viewMode === "list") {
    return (
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Infrastructure Icon */}
              {infraConfig && (
                <div className={`p-2 rounded-lg ${infraConfig.color}`}>
                  <InfraIcon className="h-5 w-5" />
                </div>
              )}
              
              {/* Task Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{task.title}</h3>
                  {infraConfig && (
                    <Badge variant="outline" className={`${infraConfig.color} text-xs`}>
                      {infraConfig.label}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {task.project?.customer_name && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.project.customer_name}
                    </span>
                  )}
                  {task.scheduled_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.scheduled_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status & Priority */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={priorityConfig.color}>
                {priorityConfig.label}
              </Badge>
              <Badge variant="outline" className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
              {task.bom_approved ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer group"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {infraConfig && (
              <div className={`p-2 rounded-lg ${infraConfig.color}`}>
                <InfraIcon className="h-4 w-4" />
              </div>
            )}
            <Badge variant="outline" className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>
          <Badge variant="outline" className={priorityConfig.color}>
            {priorityConfig.label}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-2 line-clamp-2 group-hover:text-primary transition-colors">
          {task.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Infrastructure Badge */}
        {infraConfig && (
          <Badge variant="secondary" className={`${infraConfig.color}`}>
            {infraConfig.label}
          </Badge>
        )}

        {/* Description */}
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Customer & Location */}
        <div className="space-y-1 text-sm">
          {task.project?.customer_name && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{task.project.customer_name}</span>
            </div>
          )}
          {task.project?.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{task.project.address}</span>
            </div>
          )}
        </div>

        {/* Schedule & BOM Status */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {task.scheduled_date 
              ? new Date(task.scheduled_date).toLocaleDateString()
              : "Not scheduled"
            }
          </div>
          <div className="flex items-center gap-1">
            {task.bom_approved ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                BOM Approved
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                BOM Pending
              </Badge>
            )}
          </div>
        </div>

        {/* Technician */}
        {task.technician && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm">{task.technician.full_name}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
