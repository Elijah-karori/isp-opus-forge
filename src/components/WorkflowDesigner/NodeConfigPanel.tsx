import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { X, Plus, Trash2, Shield, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ABACCondition {
  attribute: string;
  operator: string;
  value: any;
}

interface NodeConfigPanelProps {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export default function NodeConfigPanel({ node, onUpdate, onClose }: NodeConfigPanelProps) {
  const [formData, setFormData] = useState<any>({});
  const [abacConditions, setABACConditions] = useState<ABACCondition[]>([]);

  useEffect(() => {
    if (node) {
      setFormData(node.data);
      setABACConditions((node.data.abac_conditions as ABACCondition[]) || []);
    }
  }, [node]);

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(node.id, newData);
  };

  const addABACCondition = () => {
    const newConditions = [
      ...abacConditions,
      { attribute: '', operator: 'eq', value: '' },
    ];
    setABACConditions(newConditions);
    handleChange('abac_conditions', newConditions);
  };

  const updateABACCondition = (index: number, field: string, value: any) => {
    const newConditions = [...abacConditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setABACConditions(newConditions);
    handleChange('abac_conditions', newConditions);
  };

  const removeABACCondition = (index: number) => {
    const newConditions = abacConditions.filter((_, i) => i !== index);
    setABACConditions(newConditions);
    handleChange('abac_conditions', newConditions);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Configure Node</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="node-label">Node Label</Label>
              <Input
                id="node-label"
                value={formData.label || ''}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="e.g., Manager Approval"
              />
            </div>
          </CardContent>
        </Card>

        {/* RBAC Settings for Approval Nodes */}
        {node.type === 'approval' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Role-Based Access (RBAC)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="required-role">Required Role</Label>
                  <Input
                    id="required-role"
                    value={formData.required_role || ''}
                    onChange={(e) => handleChange('required_role', e.target.value)}
                    placeholder="e.g., finance_manager"
                  />
                  <p className="text-sm text-muted-foreground">Single role required for this stage</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="multiple-roles">Multiple Roles (OR logic)</Label>
                  <Input
                    id="multiple-roles"
                    value={formData.required_roles?.join(', ') || ''}
                    onChange={(e) =>
                      handleChange('required_roles', e.target.value.split(',').map((s: string) => s.trim()))
                    }
                    placeholder="e.g., finance_manager, cfo"
                  />
                  <p className="text-sm text-muted-foreground">Comma-separated list. Any role can approve.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approval-type">Approval Type</Label>
                  <Select
                    value={formData.approval_type || 'sequential'}
                    onValueChange={(value) => handleChange('approval_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential (One approver)</SelectItem>
                      <SelectItem value="parallel_all">Parallel - All must approve</SelectItem>
                      <SelectItem value="parallel_any">Parallel - Any can approve</SelectItem>
                      <SelectItem value="parallel_majority">Parallel - Majority required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.approval_type === 'parallel_majority' && (
                  <div className="space-y-2">
                    <Label htmlFor="approvals-count">Required Approvals Count</Label>
                    <Input
                      id="approvals-count"
                      type="number"
                      value={formData.required_approvals_count || 2}
                      onChange={(e) =>
                        handleChange('required_approvals_count', parseInt(e.target.value))
                      }
                      min="1"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ABAC Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Attribute-Based Access (ABAC)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enable-abac"
                    checked={formData.enable_abac || false}
                    onCheckedChange={(checked) => handleChange('enable_abac', checked)}
                  />
                  <Label htmlFor="enable-abac">Enable ABAC Conditions</Label>
                </div>

                {formData.enable_abac && (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <p className="text-sm text-blue-800">
                          These conditions will be evaluated in addition to role requirements.
                        </p>
                      </div>
                    </div>

                    {abacConditions.map((condition, index) => (
                      <Card key={index} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex gap-2 mb-2">
                            <Select
                              value={condition.attribute}
                              onValueChange={(value) => updateABACCondition(index, 'attribute', value)}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select Attribute" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user.department_id">User Department</SelectItem>
                                <SelectItem value="user.division_id">User Division</SelectItem>
                                <SelectItem value="user.job_level">User Job Level</SelectItem>
                                <SelectItem value="user.approval_limit_amount">User Approval Limit</SelectItem>
                                <SelectItem value="resource.department_id">Resource Department</SelectItem>
                                <SelectItem value="resource.amount">Resource Amount</SelectItem>
                                <SelectItem value="resource.status">Resource Status</SelectItem>
                                <SelectItem value="resource.created_by">Resource Creator</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select
                              value={condition.operator}
                              onValueChange={(value) => updateABACCondition(index, 'operator', value)}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="eq">=</SelectItem>
                                <SelectItem value="ne">≠</SelectItem>
                                <SelectItem value="gt">&gt;</SelectItem>
                                <SelectItem value="gte">≥</SelectItem>
                                <SelectItem value="lt">&lt;</SelectItem>
                                <SelectItem value="lte">≤</SelectItem>
                                <SelectItem value="in">in</SelectItem>
                              </SelectContent>
                            </Select>

                            <Input
                              value={condition.value}
                              onChange={(e) => updateABACCondition(index, 'value', e.target.value)}
                              placeholder="Value"
                              className="flex-1"
                            />

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeABACCondition(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Example: user.department_id = {`{{resource.department_id}}`}
                          </p>
                        </CardContent>
                      </Card>
                    ))}

                    <Button
                      onClick={addABACCondition}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add ABAC Condition
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* SLA & Escalation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  SLA & Escalation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sla-hours">SLA (hours)</Label>
                  <Input
                    id="sla-hours"
                    type="number"
                    value={formData.sla_hours || ''}
                    onChange={(e) =>
                      handleChange('sla_hours', e.target.value ? parseInt(e.target.value) : null)
                    }
                    placeholder="e.g., 24"
                  />
                  <p className="text-sm text-muted-foreground">Time limit before escalation</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-escalate"
                    checked={formData.auto_escalate || false}
                    onCheckedChange={(checked) => handleChange('auto_escalate', checked)}
                  />
                  <Label htmlFor="auto-escalate">Auto-escalate on SLA breach</Label>
                </div>

                {formData.auto_escalate && (
                  <div className="space-y-2">
                    <Label htmlFor="escalation-role">Escalation Role</Label>
                    <Input
                      id="escalation-role"
                      value={formData.escalation_role || ''}
                      onChange={(e) => handleChange('escalation_role', e.target.value)}
                      placeholder="e.g., senior_manager"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Condition Node Settings */}
        {node.type === 'condition' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Condition Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="condition-field">Field to Check</Label>
                <Input
                  id="condition-field"
                  value={formData.condition_field || ''}
                  onChange={(e) => handleChange('condition_field', e.target.value)}
                  placeholder="e.g., amount, department"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition-operator">Operator</Label>
                <Select
                  value={formData.condition_operator || '>'}
                  onValueChange={(value) => handleChange('condition_operator', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=">">Greater than (&gt;)</SelectItem>
                    <SelectItem value="<">Less than (&lt;)</SelectItem>
                    <SelectItem value="==">Equal to (==)</SelectItem>
                    <SelectItem value="!=">Not equal to (!=)</SelectItem>
                    <SelectItem value="in">In list (in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition-value">Value</Label>
                <Input
                  id="condition-value"
                  value={formData.condition_value || ''}
                  onChange={(e) => handleChange('condition_value', e.target.value)}
                  placeholder="e.g., 10000 or IT,Finance"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview for Approval Nodes */}
        {node.type === 'approval' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Authorization Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Access Requirements:</h4>
                <ul className="space-y-1 text-sm text-green-700">
                  {formData.required_role && (
                    <li>✓ Role: {formData.required_role}</li>
                  )}
                  {formData.required_roles && formData.required_roles.length > 0 && (
                    <li>✓ Any of roles: {formData.required_roles.join(', ')}</li>
                  )}
                  {formData.enable_abac && abacConditions.length > 0 && (
                    <li>
                      ✓ ABAC Conditions ({abacConditions.length})
                      <ul className="ml-4 mt-1 space-y-1">
                        {abacConditions.map((cond, i) => (
                          <li key={i} className="text-xs">
                            {cond.attribute} {cond.operator} {cond.value}
                          </li>
                        ))}
                      </ul>
                    </li>
                  )}
                  {formData.approval_type !== 'sequential' && (
                    <li>✓ Approval Type: {formData.approval_type}</li>
                  )}
                  {formData.sla_hours && (
                    <li>⏱ SLA: {formData.sla_hours} hours</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
