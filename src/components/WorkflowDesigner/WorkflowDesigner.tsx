import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Rocket,
  Play,
  CheckCircle,
  GitBranch,
  CircleStop,
  Loader2,
  ArrowLeft,
  Settings,
} from 'lucide-react';

import { nodeTypes } from './WorkflowNodes';
import NodeConfigPanel from './NodeConfigPanel';
import { workflowsApi } from '@/api/workflows';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function WorkflowDesigner() {
  const { workflowId } = useParams();
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [modelName, setModelName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (workflowId) {
      loadWorkflow(parseInt(workflowId));
    } else {
      setNodes([
        {
          id: 'start-1',
          type: 'start',
          position: { x: 400, y: 50 },
          data: { label: 'Start' },
        },
      ]);
    }
  }, [workflowId]);

  const loadWorkflow = async (id: number) => {
    try {
      const workflow = await workflowsApi.getWorkflow(id);
      setWorkflowName(workflow.name);
      setModelName(workflow.model_name);

      if (workflow.workflow_graph) {
        setNodes(workflow.workflow_graph.nodes || []);
        setEdges(workflow.workflow_graph.edges || []);
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
      toast.error('Failed to load workflow');
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: {
        x: Math.random() * 400 + 200,
        y: Math.random() * 300 + 150,
      },
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        required_role: '',
        approval_type: 'sequential',
        enable_abac: false,
        abac_conditions: [],
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const updateNodeData = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const deleteNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
      setSelectedNode(null);
      toast.success('Node deleted');
    }
  };

  const saveWorkflow = async () => {
    if (!workflowName || !modelName) {
      toast.error('Please provide workflow name and model name');
      return;
    }

    setIsSaving(true);
    try {
      const graphData = {
        name: workflowName,
        model_name: modelName,
        nodes,
        edges,
      };

      let response;
      if (workflowId) {
        response = await workflowsApi.updateWorkflowGraph(parseInt(workflowId), graphData);
      } else {
        response = await workflowsApi.createWorkflowGraph(graphData);
      }

      toast.success('Workflow saved successfully!');

      if (!workflowId && response.id) {
        navigate(`/workflows/designer/${response.id}`);
      }
    } catch (error: any) {
      console.error('Failed to save workflow:', error);
      toast.error(error.message || 'Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const publishWorkflow = async () => {
    if (!workflowId) {
      toast.error('Please save the workflow first');
      return;
    }

    if (!window.confirm('Are you sure you want to publish this workflow? It will become active.')) {
      return;
    }

    setIsPublishing(true);
    try {
      await workflowsApi.publishWorkflow(parseInt(workflowId));
      toast.success('Workflow published successfully!');
      navigate('/workflows');
    } catch (error: any) {
      console.error('Failed to publish workflow:', error);
      toast.error(error.message || 'Failed to publish workflow');
    } finally {
      setIsPublishing(false);
    }
  };

  const testWorkflow = () => {
    const hasStart = nodes.some((n) => n.type === 'start');
    const hasEnd = nodes.some((n) => n.type === 'end');

    if (!hasStart) {
      toast.error('Workflow must have a START node');
      return;
    }

    if (!hasEnd) {
      toast.error('Workflow must have an END node');
      return;
    }

    const approvalNodes = nodes.filter((n) => n.type === 'approval');
    const invalidNodes = approvalNodes.filter(
      (n) => !n.data.required_role && (!n.data.required_roles || n.data.required_roles.length === 0)
    );

    if (invalidNodes.length > 0) {
      toast.error(`The following nodes are missing required roles:\n${invalidNodes.map((n) => n.data.label).join('\n')}`);
      return;
    }

    toast.success('Workflow validation passed!');
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls className="bg-card shadow-lg border rounded-lg" />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'start':
                  return '#10b981';
                case 'approval':
                  return 'hsl(var(--primary))';
                case 'condition':
                  return '#f59e0b';
                case 'end':
                  return '#ef4444';
                default:
                  return 'hsl(var(--muted))';
              }
            }}
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="bg-card shadow-lg border rounded-lg"
          />

          <Panel position="top-left" className="ml-4 mt-4">
            <Card className="w-auto shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/workflows')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>

                  <div className="flex flex-col gap-2">
                    <Input
                      type="text"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="Workflow Name"
                      className="w-64"
                    />
                    <Input
                      type="text"
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      placeholder="Model Name (e.g., Invoice)"
                      className="w-64 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Panel>

          <Panel position="top-right" className="mr-4 mt-4">
            <Card className="w-auto shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testWorkflow}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Test
                  </Button>

                  <Button
                    onClick={saveWorkflow}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>

                  {workflowId && (
                    <Button
                      onClick={publishWorkflow}
                      disabled={isPublishing}
                      variant="default"
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4" />
                          Publish
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </Panel>

          <Panel position="top-right" className="mr-4 mt-32">
            <Card className="w-64 shadow-lg">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Add Nodes
                  </h3>
                  
                  <div className="space-y-2">
                    <Button
                      onClick={() => addNode('approval')}
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approval Node
                    </Button>
                    
                    <Button
                      onClick={() => addNode('condition')}
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <GitBranch className="h-4 w-4" />
                      Condition Node
                    </Button>
                    
                    <Button
                      onClick={() => addNode('end')}
                      variant="outline"
                      className="w-full justify-start gap-2"
                    >
                      <CircleStop className="h-4 w-4" />
                      End Node
                    </Button>
                  </div>

                  {selectedNode && (
                    <div className="border-t pt-3">
                      <Button
                        onClick={deleteNode}
                        variant="destructive"
                        size="sm"
                        className="w-full"
                      >
                        Delete Selected Node
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Panel>
        </ReactFlow>
      </div>

      {selectedNode && (
        <div className="w-96 bg-card border-l shadow-lg">
          <NodeConfigPanel
            node={selectedNode}
            onUpdate={updateNodeData}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      )}
    </div>
  );
}
