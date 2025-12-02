// Workflow Designer Component using @xyflow/react
import React, { useState, useCallback } from 'react';
import {
    ReactFlow,
    addEdge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { workflowService, WorkflowGraph } from '@/services/workflow.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus } from 'lucide-react';

export const WorkflowDesigner: React.FC = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [workflowName, setWorkflowName] = useState('New Workflow');
    const [workflowDescription, setWorkflowDescription] = useState('');
    const [modelName, setModelName] = useState('EmployeeProfile');
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const handleSave = async () => {
        if (!workflowName.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Please enter a workflow name',
                variant: 'destructive',
            });
            return;
        }

        setSaving(true);
        try {
            const workflowData: WorkflowGraph = {
                name: workflowName,
                description: workflowDescription,
                model_name: modelName,
                nodes: nodes.map(node => ({
                    id: node.id,
                    type: node.type || 'default',
                    position: node.position,
                    data: node.data,
                })),
                edges: edges.map(edge => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    type: edge.type,
                })),
            };

            await workflowService.createGraph(workflowData);

            toast({
                title: 'Success',
                description: 'Workflow saved successfully!',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.detail || 'Failed to save workflow',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const addNode = () => {
        const newNode = {
            id: `node-${nodes.length + 1}`,
            type: 'default',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: `Node ${nodes.length + 1}` },
        };
        setNodes((nds) => [...nds, newNode]);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Workflow Designer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="workflow-name">Workflow Name</Label>
                            <Input
                                id="workflow-name"
                                value={workflowName}
                                onChange={(e) => setWorkflowName(e.target.value)}
                                placeholder="Enter workflow name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="workflow-description">Description</Label>
                            <Input
                                id="workflow-description"
                                value={workflowDescription}
                                onChange={(e) => setWorkflowDescription(e.target.value)}
                                placeholder="Enter description"
                            />
                        </div>
                        <div>
                            <Label htmlFor="model-name">Model Name</Label>
                            <Input
                                id="model-name"
                                value={modelName}
                                onChange={(e) => setModelName(e.target.value)}
                                placeholder="e.g., EmployeeProfile"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={addNode} variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Node
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Workflow'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <div style={{ width: '100%', height: '600px' }}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            fitView
                        >
                            <Background />
                            <Controls />
                            <MiniMap />
                        </ReactFlow>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
