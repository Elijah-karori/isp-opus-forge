import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play, CheckCircle, GitBranch, CircleStop, Shield, Clock } from 'lucide-react';

// Start Node
export function StartNode({ data, selected }: NodeProps) {
  return (
    <div className={`
      relative w-24 h-24 rounded-full flex items-center justify-center
      ${selected ? 'bg-green-100 border-2 border-green-500' : 'bg-green-500 border-2 border-green-600'}
      text-white font-bold shadow-lg cursor-pointer
    `}>
      <div className="text-center">
        <Play size={32} />
        <div className="text-sm mt-1">Start</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-600 border-2 border-white"
      />
    </div>
  );
}

// Approval Node
export function ApprovalNode({ data, selected }: NodeProps) {
  const hasABAC = data?.enable_abac && Array.isArray(data?.abac_conditions) && data.abac_conditions.length > 0;
  const hasSLA = data?.sla_hours && Number(data.sla_hours) > 0;

  return (
    <div className={`
      relative min-w-64 p-4 rounded-lg shadow-lg cursor-pointer
      ${selected ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white border border-gray-300'}
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="h-5 w-5 text-blue-500" />
        <span className="font-bold text-blue-500 text-sm uppercase tracking-wide">
          APPROVAL
        </span>
      </div>

      {/* Label */}
      <div className="font-bold text-gray-900 mb-2 text-lg">
        {String(data?.label || 'Approval Node')}
      </div>

      {/* Role Info */}
      {data?.required_role && (
        <div className="text-sm text-gray-600 mb-1">
          <strong>Role:</strong> {String(data.required_role)}
        </div>
      )}

      {Array.isArray(data?.required_roles) && data.required_roles.length > 0 && (
        <div className="text-sm text-gray-600 mb-1">
          <strong>Roles:</strong> {data.required_roles.join(', ')}
        </div>
      )}

      {/* Approval Type */}
      {data?.approval_type && String(data.approval_type) !== 'sequential' && (
        <div className="text-sm text-gray-600 mb-1">
          <strong>Type:</strong> {String(data.approval_type).replace(/_/g, ' ')}
        </div>
      )}

      {/* Badges */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {hasABAC && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
            <Shield className="h-3 w-3" />
            ABAC
          </span>
        )}

        {hasSLA && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-200">
            <Clock className="h-3 w-3" />
            {String(data.sla_hours)}h
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
}

// Condition Node
export function ConditionNode({ data, selected }: NodeProps) {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-amber-500 border-2 border-white"
      />

      <div className={`
        relative w-48 h-48 transform rotate-45
        ${selected ? 'bg-amber-50 border-2 border-amber-500' : 'bg-white border border-gray-300'}
        rounded-lg shadow-lg cursor-pointer
      `}>
        <div className="transform rotate-[-45deg] w-full h-full flex flex-col items-center justify-center p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="h-5 w-5 text-amber-500" />
            <span className="font-bold text-amber-500 text-sm uppercase tracking-wide">
              CONDITION
            </span>
          </div>

          <div className="font-bold text-gray-900 mb-2 text-center text-lg">
            {String(data?.label || 'If...')}
          </div>

          {data?.condition_field && (
            <div className="text-xs text-gray-600 text-center">
              {String(data.condition_field)} {String(data.condition_operator || '>')} {String(data.condition_value || '')}
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ left: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-3 h-3 bg-red-500 border-2 border-white"
        style={{ left: '75%' }}
      />
    </div>
  );
}

// End Node
export function EndNode({ data, selected }: NodeProps) {
  return (
    <div className={`
      relative w-24 h-24 rounded-full flex items-center justify-center
      ${selected ? 'bg-red-100 border-2 border-red-500' : 'bg-red-500 border-2 border-red-600'}
      text-white font-bold shadow-lg cursor-pointer
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-red-600 border-2 border-white"
      />

      <div className="text-center">
        <CircleStop size={32} />
        <div className="text-sm mt-1">End</div>
      </div>
    </div>
  );
}

// Export node types
export const nodeTypes = {
  start: StartNode,
  approval: ApprovalNode,
  condition: ConditionNode,
  end: EndNode,
};
