'use client';

/**
 * Enhanced Workflow Generator Page
 *
 * Supports three workflow creation modes:
 * - Simple Mode: Template-based video generation (existing functionality)
 * - Advanced Mode: ComfyUI JSON workflows with model selection
 * - Visual Mode: Drag-and-drop node-based workflow editor
 * - A/B Testing: Compare different models and configurations
 *
 * Uses Temporal workflow orchestrator for reliable execution
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import TemplateSelector, { TemplateType } from '@/components/omega/TemplateSelector';
import WorkflowConfig, { WorkflowConfiguration } from '@/components/omega/WorkflowConfig';
import { ReactFlow, Background, Controls, MiniMap, Node, Edge, Connection, addEdge, useNodesState, useEdgesState, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CharacterImageNode from '../visual-workflow/nodes/CharacterImageNode';
import VideoGenerationNode from '../visual-workflow/nodes/VideoGenerationNode';
import VideoStitchNode from '../visual-workflow/nodes/VideoStitchNode';

type Step = 'template' | 'configure' | 'generating' | 'results';
type Mode = 'simple' | 'advanced' | 'visual';

interface ModelSelection {
  characterModel: 'nanobana' | 'midjourney' | 'dalle' | 'imagen';
  videoModel: 'veo3-fast' | 'veo3-standard' | 'sora-2';
}

// Node types for React Flow
const nodeTypes = {
  characterImage: CharacterImageNode,
  videoGeneration: VideoGenerationNode,
  videoStitch: VideoStitchNode,
};

// Pending connection type for click-to-connect mode
interface PendingConnection {
  nodeId: string;
  handleId: string;
  handleType: 'source' | 'target';
}

// Visual Workflow Editor Component
function VisualWorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [pendingConnection, setPendingConnection] = useState<PendingConnection | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const nodeIdRef = useRef(1);
  const reactFlowInstance = useReactFlow();
  const isFirstRender = useRef(true);

  // Restore state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('visualWorkflowState');
    if (savedState) {
      try {
        const { nodes: savedNodes, edges: savedEdges, workflowName: savedName } = JSON.parse(savedState);
        if (savedNodes) setNodes(savedNodes);
        if (savedEdges) setEdges(savedEdges);
        if (savedName) setWorkflowName(savedName);
      } catch (error) {
        console.error('Failed to restore workflow state:', error);
      }
    }
  }, [setNodes, setEdges]);

  // Save state to localStorage on changes (skip initial mount until state is set)
  useEffect(() => {
    // On first mount, wait until we have actual state before enabling saves
    if (isFirstRender.current && nodes.length === 0 && edges.length === 0 && workflowName === 'My Workflow') {
      // Still on initial empty state, mark as first render complete but don't save
      isFirstRender.current = false;
      return;
    }

    // After first real state change, always save
    isFirstRender.current = false;

    const stateToSave = {
      nodes,
      edges,
      workflowName
    };
    localStorage.setItem('visualWorkflowState', JSON.stringify(stateToSave));
  }, [nodes, edges, workflowName]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  // Click-to-connect handler
  const handleHandleClick = useCallback((nodeId: string, handleId: string, handleType: 'source' | 'target') => {
    if (!pendingConnection) {
      // First click: start a pending connection from a source handle
      if (handleType === 'source') {
        setPendingConnection({ nodeId, handleId, handleType });
      }
    } else {
      // Second click: complete the connection
      if (handleType === 'target' && pendingConnection.handleType === 'source') {
        // Valid connection: source -> target
        onConnect({
          source: pendingConnection.nodeId,
          sourceHandle: pendingConnection.handleId,
          target: nodeId,
          targetHandle: handleId,
        });
        setPendingConnection(null);
      } else if (handleType === 'source' && pendingConnection.handleType === 'source') {
        // Clicked another source: switch to new source
        setPendingConnection({ nodeId, handleId, handleType });
      } else {
        // Invalid connection attempt: clear pending
        setPendingConnection(null);
      }
    }
  }, [pendingConnection, onConnect]);

  // Cancel pending connection when clicking canvas
  const onPaneClick = useCallback(() => {
    setPendingConnection(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeId = `${type}_${nodeIdRef.current++}`;
      const getDefaultNodeData = (nodeType: string) => {
        switch (nodeType) {
          case 'characterImage':
            return { model: 'NanoBanana', characterPrompt: '' };
          case 'videoGeneration':
            return { model: 'VEO3 Fast', prompt: '', duration: 8, aspectRatio: '16:9' };
          case 'videoStitch':
            return { transitionType: 'Dissolve', transitionDuration: 0.5 };
          default:
            return {};
        }
      };

      const newNode: Node = {
        id: newNodeId,
        type,
        position,
        data: {
          ...getDefaultNodeData(type),
          onHandleClick: handleHandleClick,
          pendingConnection,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes, handleHandleClick, pendingConnection]
  );

  // Update existing nodes when pendingConnection changes to show visual feedback
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onHandleClick: handleHandleClick,
          pendingConnection,
        },
      }))
    );
  }, [pendingConnection, handleHandleClick]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Handle node deletion - close properties panel if deleted node was selected
  const onNodesDelete = useCallback((deleted: Node[]) => {
    const deletedIds = deleted.map(n => n.id);
    setSelectedNode((prev) => (prev && deletedIds.includes(prev.id) ? null : prev));
  }, []);

  // Handle edge deletion
  const onEdgesDelete = useCallback((deleted: any[]) => {
    // Edges deleted, no additional action needed
  }, []);

  // Delete selected node
  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes]);

  // Update node data when properties change
  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
    // Update selectedNode to reflect changes
    setSelectedNode((prev) => prev && prev.id === nodeId ? { ...prev, data: { ...prev.data, ...newData } } : prev);
  }, [setNodes]);

  // Validate workflow before execution
  const validateWorkflow = useCallback((): string[] => {
    const errors: string[] = [];

    // Check if workflow has nodes
    if (nodes.length === 0) {
      errors.push('Workflow must have at least one node');
      return errors;
    }

    // Validate each node
    nodes.forEach((node) => {
      const nodeLabel = `${node.type} (${node.id})`;

      switch (node.type) {
        case 'characterImage':
          if (!node.data.model) {
            errors.push(`${nodeLabel}: Model not selected`);
          }
          if (!node.data.characterPrompt || node.data.characterPrompt.trim() === '') {
            errors.push(`${nodeLabel}: Character prompt is required`);
          }
          break;

        case 'videoGeneration':
          if (!node.data.model) {
            errors.push(`${nodeLabel}: Model not selected`);
          }
          if (!node.data.prompt || node.data.prompt.trim() === '') {
            errors.push(`${nodeLabel}: Prompt is required`);
          }
          if (!node.data.duration || node.data.duration <= 0) {
            errors.push(`${nodeLabel}: Duration must be greater than 0`);
          }
          if (!node.data.aspectRatio) {
            errors.push(`${nodeLabel}: Aspect ratio not selected`);
          }
          // Check if it has required input (character image)
          const hasCharacterInput = edges.some(
            (edge) => edge.target === node.id && edge.targetHandle === 'characterImagePath'
          );
          if (!hasCharacterInput) {
            errors.push(`${nodeLabel}: Missing character image input connection`);
          }
          break;

        case 'videoStitch':
          // Check if it has at least 2 inputs
          const inputCount = edges.filter((edge) => edge.target === node.id).length;
          if (inputCount < 2) {
            errors.push(`${nodeLabel}: Requires at least 2 video inputs (currently has ${inputCount})`);
          }
          break;
      }
    });

    return errors;
  }, [nodes, edges]);

  // Generate video from workflow
  const generateVideo = useCallback(async () => {
    const errors = validateWorkflow();
    setValidationErrors(errors);

    if (errors.length > 0) {
      alert(`Workflow has validation errors:\n\n${errors.join('\n')}`);
      return;
    }

    try {
      console.log('🚀 Sending workflow to backend...');

      // Prepare workflow for backend
      const workflowData = {
        workflowId: workflowName,
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          data: {
            ...node.data,
            // Remove React Flow specific properties
            onHandleClick: undefined,
            pendingConnection: undefined,
          }
        })),
        edges,
      };

      // Send to backend
      const response = await fetch('http://localhost:3007/api/visual-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow: workflowData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Workflow started successfully!\n\nOperation ID: ${result.operationId}\n\nYou can track progress in the Temporal UI at http://localhost:8233`);
        console.log('✅ Workflow started:', result);
      } else {
        alert(`❌ Workflow failed to start:\n\n${result.error}`);
        console.error('❌ Workflow error:', result);
      }
    } catch (error) {
      alert(`❌ Failed to send workflow to backend:\n\n${(error as Error).message}`);
      console.error('❌ Backend communication error:', error);
    }
  }, [validateWorkflow, workflowName, nodes, edges]);

  const exportWorkflow = () => {
    const workflow = {
      workflowId: workflowName,
      description: 'Visual workflow created with SmokeTech Studio',
      nodes: nodes.map((node) => {
        // Remove internal properties before export
        const { onHandleClick, pendingConnection, ...inputs } = node.data;
        return {
          id: node.id,
          type: node.type,
          inputs,
          outputs: [],
        };
      }),
      edges: edges,
    };

    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workflow = JSON.parse(e.target?.result as string);

        // Transform workflow nodes to React Flow format
        const importedNodes = (workflow.nodes || []).map((node: any, index: number) => ({
          id: node.id,
          type: node.type,
          position: { x: 100 + index * 250, y: 100 + (index % 2) * 150 }, // Auto-layout
          data: {
            ...node.inputs, // Spread inputs into data
            onHandleClick: handleHandleClick,
            pendingConnection: pendingConnection,
          },
        }));

        setNodes(importedNodes);
        setEdges(workflow.edges || []);
        setWorkflowName(workflow.workflowId || 'Imported Workflow');
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to import workflow: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Node Palette */}
      <div className="w-64 bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">🎨 Node Palette</h3>
          <div className="space-y-2">
            <div
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'characterImage')}
              className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg cursor-move hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">👤</span>
                <div className="text-sm font-medium">Character Image</div>
              </div>
            </div>
            <div
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'videoGeneration')}
              className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg cursor-move hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🎬</span>
                <div className="text-sm font-medium">Video Generation</div>
              </div>
            </div>
            <div
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'videoStitch')}
              className="p-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg cursor-move hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">✂️</span>
                <div className="text-sm font-medium">Video Stitch</div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Controls */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">⚙️ Controls</h3>
          <div className="space-y-2">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Workflow name"
            />
            <button
              onClick={exportWorkflow}
              className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              💾 Export JSON
            </button>
            <label className="w-full block">
              <input
                type="file"
                accept=".json"
                onChange={importWorkflow}
                className="hidden"
              />
              <div className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center cursor-pointer">
                📁 Import JSON
              </div>
            </label>
            <button
              onClick={generateVideo}
              className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium shadow-lg"
            >
              🚀 Generate Video
            </button>
            {validationErrors.length > 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-xs font-semibold text-red-800 mb-1">⚠️ Validation Errors:</div>
                <ul className="text-xs text-red-700 space-y-0.5">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          deleteKeyCode="Delete"
          fitView
        >
          <Background color="#94a3b8" gap={16} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <div className="w-80 bg-white rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">📋 Properties</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Node ID</label>
              <input
                type="text"
                value={selectedNode.id}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Node Type</label>
              <input
                type="text"
                value={selectedNode.type || 'unknown'}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
              />
            </div>

            {/* Character Image Properties */}
            {selectedNode.type === 'characterImage' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <select
                    value={selectedNode.data.model || 'NanoBanana'}
                    onChange={(e) => updateNodeData(selectedNode.id, { model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="NanoBanana">NanoBanana</option>
                    <option value="Imagen 3">Imagen 3</option>
                    <option value="Imagen 4">Imagen 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Character Prompt</label>
                  <textarea
                    value={selectedNode.data.characterPrompt || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { characterPrompt: e.target.value })}
                    rows={4}
                    placeholder="Describe the character appearance..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              </>
            )}

            {/* Video Generation Properties */}
            {selectedNode.type === 'videoGeneration' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <select
                    value={selectedNode.data.model || 'VEO3 Fast'}
                    onChange={(e) => updateNodeData(selectedNode.id, { model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="VEO3 Fast">VEO3 Fast</option>
                    <option value="VEO3 High Quality">VEO3 High Quality</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video Prompt</label>
                  <textarea
                    value={selectedNode.data.prompt || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { prompt: e.target.value })}
                    rows={4}
                    placeholder="Describe the video scene..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
                  <input
                    type="number"
                    value={selectedNode.data.duration || 8}
                    onChange={(e) => updateNodeData(selectedNode.id, { duration: parseInt(e.target.value) })}
                    min="2"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
                  <select
                    value={selectedNode.data.aspectRatio || '16:9'}
                    onChange={(e) => updateNodeData(selectedNode.id, { aspectRatio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                    <option value="1:1">1:1 (Square)</option>
                  </select>
                </div>
              </>
            )}

            {/* Video Stitch Properties */}
            {selectedNode.type === 'videoStitch' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transition Type</label>
                  <select
                    value={selectedNode.data.transitionType || 'Dissolve'}
                    onChange={(e) => updateNodeData(selectedNode.id, { transitionType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Dissolve">Dissolve</option>
                    <option value="Fade">Fade</option>
                    <option value="Wipe">Wipe</option>
                    <option value="Slide">Slide</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
                  <input
                    type="number"
                    value={selectedNode.data.transitionDuration || 0.5}
                    onChange={(e) => updateNodeData(selectedNode.id, { transitionDuration: parseFloat(e.target.value) })}
                    min="0.1"
                    max="2"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </>
            )}

            {/* Delete Node Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={deleteSelectedNode}
                className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                🗑️ Delete Node
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkflowGeneratorPage() {
  const [mode, setMode] = useState<Mode>('simple');
  const [currentStep, setCurrentStep] = useState<Step>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('single');
  const [configuration, setConfiguration] = useState<WorkflowConfiguration>({
    templateType: 'single',
    character: {
      prompt: 'Professional contractor, 35 years old, natural outdoor lighting, authentic appearance',
      temperature: 0.3
    },
    scenarios: [{
      name: 'Demo Video',
      mainPrompt: 'Professional demonstrating a process',
      timing: {
        '0-2s': 'Introduction',
        '2-6s': 'Main content',
        '6-8s': 'Conclusion'
      },
      environment: {
        location: 'Professional setting',
        atmosphere: 'Natural lighting',
        interactionElements: []
      }
    }],
    veo3Options: {
      duration: 8,
      aspectRatio: '9:16',
      quality: 'high',
      enableSoundGeneration: true
    }
  });
  const [modelSelection, setModelSelection] = useState<ModelSelection>({
    characterModel: 'nanobana',
    videoModel: 'veo3-fast'
  });
  const [abTestingEnabled, setABTestingEnabled] = useState(false);
  const [workflowJSON, setWorkflowJSON] = useState('');
  const [jsonEditorVisible, setJsonEditorVisible] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [abTestResults, setABTestResults] = useState<any>(null);

  const handleTemplateChange = (template: TemplateType) => {
    setSelectedTemplate(template);
    setConfiguration({
      ...configuration,
      templateType: template
    });
  };

  const handleNextStep = () => {
    const steps: Step[] = ['template', 'configure', 'generating', 'results'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePreviousStep = () => {
    const steps: Step[] = ['template', 'configure', 'generating', 'results'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const generateWorkflowJSON = () => {
    // Generate ComfyUI-style workflow JSON from current configuration
    const workflow = {
      workflowId: `workflow-${Date.now()}`,
      description: `${selectedTemplate} video workflow`,
      nodes: [
        {
          id: 'character_image_1',
          type: 'character_image',
          inputs: {
            characterPrompt: configuration.character.prompt,
            model: modelSelection.characterModel,
            preserveFeatures: true,
            temperature: configuration.character.temperature
          },
          outputs: ['characterImagePath']
        },
        ...configuration.scenarios.map((scenario, index) => ({
          id: `video_gen_${index + 1}`,
          type: 'video_generation',
          inputs: {
            characterImagePath: '{{character_image_1.characterImagePath}}',
            prompt: scenario.mainPrompt,
            model: modelSelection.videoModel,
            duration: configuration.veo3Options.duration,
            aspectRatio: configuration.veo3Options.aspectRatio
          }
        }))
      ]
    };

    return JSON.stringify(workflow, null, 2);
  };

  const startGeneration = async () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      alert('Please set your GEMINI_API_KEY in settings');
      return;
    }

    setCurrentStep('generating');

    try {
      let response;

      if (abTestingEnabled && mode === 'advanced') {
        // A/B Testing mode - compare models
        response = await fetch('/api/ab-test-workflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testDefinition: {
              testId: `abtest-${Date.now()}`,
              description: 'Model comparison test',
              variants: [
                {
                  variantId: 'variant-a',
                  workflowId: `workflow-a-${Date.now()}`,
                  nodes: JSON.parse(workflowJSON).nodes
                },
                {
                  variantId: 'variant-b',
                  workflowId: `workflow-b-${Date.now()}`,
                  nodes: JSON.parse(workflowJSON.replace(modelSelection.videoModel,
                    modelSelection.videoModel === 'veo3-fast' ? 'veo3-standard' : 'veo3-fast'
                  )).nodes
                }
              ]
            },
            apiKey
          })
        });

        const data = await response.json();

        if (response.ok) {
          setABTestResults(data);
          setResults({
            success: true,
            abTest: true,
            testId: data.testId,
            winner: data.winner,
            confidence: data.confidence,
            variants: data.variants
          });
        }
      } else if (mode === 'advanced') {
        // Advanced mode - use ComfyUI workflow JSON
        response = await fetch('/api/comfyui-workflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workflow: JSON.parse(workflowJSON),
            apiKey
          })
        });

        const data = await response.json();
        setResults(data);
      } else {
        // Simple mode - use template-based generation
        response = await fetch('/api/generate-workflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateType: configuration.templateType,
            config: {
              ...configuration,
              modelSelection
            },
            apiKey
          })
        });

        const data = await response.json();
        setResults(data);
      }

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      setCurrentStep('results');
    } catch (error) {
      console.error('Generation error:', error);
      setResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        videos: [],
        metadata: {
          templateType: configuration.templateType,
          totalCost: 0,
          duration: 0,
          format: '9:16',
          videosGenerated: 0
        },
        timestamp: new Date().toISOString()
      });
      setCurrentStep('results');
    }
  };

  // Load workflow JSON when switching to advanced mode
  React.useEffect(() => {
    if (mode === 'advanced' && !workflowJSON) {
      setWorkflowJSON(generateWorkflowJSON());
    }
  }, [mode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🎬 Workflow Generator
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {mode === 'simple'
                  ? 'Template-based video generation with Omega Workflow (12 engines)'
                  : mode === 'advanced'
                    ? 'Advanced ComfyUI workflow execution with Temporal orchestration'
                    : 'Drag-and-drop node-based workflow editor for visual workflow creation'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Mode Toggle */}
              <div className="bg-gray-100 rounded-lg p-1 flex items-center">
                <button
                  onClick={() => setMode('simple')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === 'simple'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Simple Mode
                </button>
                <button
                  onClick={() => setMode('advanced')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === 'advanced'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Advanced Mode
                </button>
                <button
                  onClick={() => setMode('visual')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === 'visual'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Visual Mode
                </button>
              </div>
              <div className="text-sm text-gray-500">
                Powered by SmokeTech Studio 🚬
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps - Hide for visual mode */}
      {currentStep !== 'results' && mode !== 'visual' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-4">
            {[
              { id: 'template', label: mode === 'simple' ? 'Choose Template' : 'Load Workflow', icon: '📋' },
              { id: 'configure', label: mode === 'simple' ? 'Configure' : 'Edit & Models', icon: '⚙️' },
              { id: 'generating', label: 'Generate', icon: '🎨' }
            ].map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = ['template', 'configure', 'generating'].indexOf(currentStep as any) > index;

              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center ${isActive ? 'scale-110' : ''} transition-transform`}>
                    <div className={`
                      flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
                      ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                      ${isActive ? `bg-${mode === 'simple' ? 'blue' : 'purple'}-600 border-${mode === 'simple' ? 'blue' : 'purple'}-600 text-white` : ''}
                      ${!isActive && !isCompleted ? 'bg-white border-gray-300 text-gray-400' : ''}
                    `}>
                      {isCompleted ? '✓' : step.icon}
                    </div>
                    <div className={`ml-3 ${isActive ? 'font-semibold' : ''}`}>
                      <div className={`text-sm ${isActive ? `text-${mode === 'simple' ? 'blue' : 'purple'}-600` : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                        Step {index + 1}
                      </div>
                      <div className={`text-xs ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                        {step.label}
                      </div>
                    </div>
                  </div>
                  {index < 2 && (
                    <div className={`w-16 h-1 transition-colors ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Visual Mode Editor */}
        {mode === 'visual' && (
          <ReactFlowProvider>
            <VisualWorkflowEditor />
          </ReactFlowProvider>
        )}

        {/* Simple and Advanced Mode Content */}
        {mode !== 'visual' && currentStep === 'template' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {mode === 'simple' ? (
              <TemplateSelector value={selectedTemplate} onChange={handleTemplateChange} />
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Load ComfyUI Workflow</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-500 hover:bg-purple-50 transition-all text-center">
                    <div className="text-4xl mb-2">📄</div>
                    <div className="font-medium text-gray-900">Load Example</div>
                    <div className="text-sm text-gray-600 mt-1">text-to-video.json</div>
                  </button>
                  <button className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-500 hover:bg-purple-50 transition-all text-center">
                    <div className="text-4xl mb-2">👤</div>
                    <div className="font-medium text-gray-900">Load Example</div>
                    <div className="text-sm text-gray-600 mt-1">character-video.json</div>
                  </button>
                  <button className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-500 hover:bg-purple-50 transition-all text-center">
                    <div className="text-4xl mb-2">🎞️</div>
                    <div className="font-medium text-gray-900">Load Example</div>
                    <div className="text-sm text-gray-600 mt-1">multi-video-series.json</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode !== 'visual' && currentStep === 'configure' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {mode === 'simple' ? (
                <div className="space-y-6">
                  <WorkflowConfig
                    templateType={selectedTemplate}
                    value={configuration}
                    onChange={setConfiguration}
                  />

                  {/* Model Selection for Simple Mode */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Model Selection</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Character Image Model
                        </label>
                        <select
                          value={modelSelection.characterModel}
                          onChange={(e) => setModelSelection({
                            ...modelSelection,
                            characterModel: e.target.value as any
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="nanobana">NanoBanana - $0.02/image (Recommended)</option>
                          <option value="midjourney">Midjourney - $0.08/image</option>
                          <option value="dalle">DALL-E 3 HD - $0.08/image</option>
                          <option value="imagen">Imagen 3 - $0.08/image</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video Generation Model
                        </label>
                        <select
                          value={modelSelection.videoModel}
                          onChange={(e) => setModelSelection({
                            ...modelSelection,
                            videoModel: e.target.value as any
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="veo3-fast">VEO3 Fast - $0.75/second (Recommended)</option>
                          <option value="veo3-standard">VEO3 Standard - $5.00/second</option>
                          <option value="sora-2">Sora 2 - $5.00/second (Coming Soon)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Model Selection for Advanced Mode */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Model Selection</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Character Image Model
                        </label>
                        <select
                          value={modelSelection.characterModel}
                          onChange={(e) => setModelSelection({
                            ...modelSelection,
                            characterModel: e.target.value as any
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="nanobana">NanoBanana - $0.02/image</option>
                          <option value="midjourney">Midjourney - $0.08/image</option>
                          <option value="dalle">DALL-E 3 HD - $0.08/image</option>
                          <option value="imagen">Imagen 3 - $0.08/image</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Video Generation Model
                        </label>
                        <select
                          value={modelSelection.videoModel}
                          onChange={(e) => setModelSelection({
                            ...modelSelection,
                            videoModel: e.target.value as any
                          })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="veo3-fast">VEO3 Fast - $0.75/second</option>
                          <option value="veo3-standard">VEO3 Standard - $5.00/second</option>
                          <option value="sora-2">Sora 2 - $5.00/second</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* A/B Testing Toggle */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">🧪 A/B Testing</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Compare different models to find the best performance
                        </p>
                      </div>
                      <button
                        onClick={() => setABTestingEnabled(!abTestingEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          abTestingEnabled ? 'bg-purple-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            abTestingEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    {abTestingEnabled && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-800">
                          <strong>A/B Test Enabled:</strong> The workflow will be executed with both {modelSelection.videoModel} and
                          {modelSelection.videoModel === 'veo3-fast' ? ' veo3-standard' : ' veo3-fast'} for comparison.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* JSON Editor */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">📝 Workflow JSON</h3>
                      <button
                        onClick={() => setJsonEditorVisible(!jsonEditorVisible)}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {jsonEditorVisible ? 'Hide Editor' : 'Show Editor'}
                      </button>
                    </div>
                    {jsonEditorVisible && (
                      <textarea
                        value={workflowJSON}
                        onChange={(e) => setWorkflowJSON(e.target.value)}
                        className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Paste your ComfyUI workflow JSON here..."
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {mode !== 'visual' && currentStep === 'generating' && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {abTestingEnabled ? 'Running A/B Test...' : 'Generating with Temporal Workflow...'}
            </h3>
            <p className="text-gray-600">
              {mode === 'simple'
                ? 'Using 12 engines for maximum viral potential'
                : 'Executing ComfyUI workflow with fault tolerance'
              }
            </p>
          </div>
        )}

        {mode !== 'visual' && currentStep === 'results' && results && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Success or Error State */}
              {results.success ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    🎉 Generation Complete!
                  </h2>

                  {/* A/B Test Results */}
                  {results.abTest && abTestResults && (
                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
                      <h3 className="text-xl font-semibold text-purple-900 mb-4">
                        🧪 A/B Test Results
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <div className="text-sm text-purple-700">Winner</div>
                          <div className="text-2xl font-bold text-purple-900">
                            {results.winner}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-purple-700">Confidence</div>
                          <div className="text-2xl font-bold text-purple-900">
                            {(results.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-purple-700">Variants Tested</div>
                          <div className="text-2xl font-bold text-purple-900">
                            {results.variants?.length || 2}
                          </div>
                        </div>
                      </div>

                      {/* Variant Comparison */}
                      <div className="space-y-4">
                        {results.variants?.map((variant: any, index: number) => (
                          <div key={index} className={`border-2 rounded-lg p-4 ${
                            variant.variantId === results.winner
                              ? 'border-purple-500 bg-purple-100'
                              : 'border-gray-300 bg-white'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-gray-900">
                                {variant.variantId}
                                {variant.variantId === results.winner && (
                                  <span className="ml-2 text-purple-600">👑 Winner</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {variant.success ? '✅ Success' : '❌ Failed'}
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Duration:</span>
                                <span className="ml-2 font-medium">{(variant.duration / 1000).toFixed(1)}s</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Cost:</span>
                                <span className="ml-2 font-medium">${variant.cost?.toFixed(4)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Quality:</span>
                                <span className="ml-2 font-medium">{variant.qualityScore || 'N/A'}/10</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Omega Metrics - Only show on success in simple mode */}
                  {mode === 'simple' && results.metadata?.viralScore !== undefined && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        🔥 Omega Workflow Metrics
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Viral Score</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {results.metadata.viralScore}/100
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Quality Score</div>
                          <div className="text-2xl font-bold text-green-600">
                            {results.metadata.qualityScore}/100
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Engines Used</div>
                          <div className="text-2xl font-bold text-purple-600">
                            {results.metadata.enginesUsed}/12
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Utilization</div>
                          <div className="text-2xl font-bold text-orange-600">
                            {results.metadata.utilizationRate?.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {results.videos && results.videos.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Generated Videos</h3>
                      {results.videos.map((video: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{video.name}</div>
                                <div className="text-sm text-gray-600">{video.scenario}</div>
                              </div>
                              <a
                                href={video.url || `/workflow-videos/${video.path.split(/[\\/]/).pop()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                View Video
                              </a>
                            </div>
                            {(video.url || video.path) && (
                              <video
                                className="w-full rounded-lg"
                                controls
                                preload="metadata"
                              >
                                <source src={video.url || `/workflow-videos/${video.path.split(/[\\/]/).pop()}`} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Character Image */}
                  {results.characterImage && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Character</h3>
                      <img
                        src={`file:///${results.characterImage}`}
                        alt="Generated character"
                        className="rounded-lg max-w-md"
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-red-600 mb-2">
                    ❌ Generation Failed
                  </h2>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium mb-2">Error:</p>
                    <p className="text-red-700">{results.error || 'Unknown error occurred'}</p>
                  </div>
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => {
                        setCurrentStep('configure');
                        setResults(null);
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Generate Another */}
            <div className="text-center">
              <button
                onClick={() => {
                  setCurrentStep('template');
                  setResults(null);
                  setABTestResults(null);
                }}
                className={`px-8 py-3 bg-gradient-to-r ${
                  mode === 'simple'
                    ? 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    : 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                } text-white rounded-lg transition-all shadow-lg font-semibold`}
              >
                Generate Another Workflow
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons - Hide for visual mode */}
        {mode !== 'visual' && currentStep !== 'generating' && currentStep !== 'results' && (
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handlePreviousStep}
              disabled={currentStep === 'template'}
              className={`
                px-6 py-3 rounded-lg font-medium transition-colors
                ${currentStep === 'template'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              ← Previous
            </button>

            {currentStep !== 'configure' ? (
              <button
                onClick={handleNextStep}
                className={`px-6 py-3 bg-gradient-to-r ${
                  mode === 'simple'
                    ? 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                    : 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                } text-white rounded-lg transition-colors font-medium`}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={startGeneration}
                className={`px-8 py-3 bg-gradient-to-r ${
                  mode === 'simple'
                    ? 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    : 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                } text-white rounded-lg transition-all shadow-lg font-semibold`}
              >
                {abTestingEnabled
                  ? '🧪 Run A/B Test'
                  : mode === 'simple'
                    ? '🚀 Generate with Omega Workflow'
                    : '⚡ Execute ComfyUI Workflow'
                }
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
