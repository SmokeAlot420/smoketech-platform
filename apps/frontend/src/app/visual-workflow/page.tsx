'use client';

/**
 * Visual Workflow Editor
 *
 * Drag-and-drop workflow builder for non-technical users
 * Built with React Flow for professional node-based editing
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom node types
import CharacterImageNode from './nodes/CharacterImageNode';
import VideoGenerationNode from './nodes/VideoGenerationNode';
import VideoStitchNode from './nodes/VideoStitchNode';

// Progress tracking
import ProgressPanel from './components/ProgressPanel';

const nodeTypes = {
  characterImage: CharacterImageNode,
  videoGeneration: VideoGenerationNode,
  videoStitch: VideoStitchNode,
};

export default function VisualWorkflowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('my-workflow');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Progress tracking state
  const [operationId, setOperationId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState<string>('');

  // Node counter for unique IDs
  const nodeIdRef = useRef(1);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNodeId = `${type}_${nodeIdRef.current++}`;
      const newNode: Node = {
        id: newNodeId,
        type,
        position,
        data: getDefaultNodeData(type),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const getDefaultNodeData = (type: string) => {
    switch (type) {
      case 'characterImage':
        return {
          label: 'Character Image',
          characterPrompt: '',
          model: 'nanobana',
          preserveFeatures: true,
          temperature: 0.3,
        };
      case 'videoGeneration':
        return {
          label: 'Video Generation',
          prompt: '',
          model: 'veo3-fast',
          duration: 8,
          aspectRatio: '16:9',
        };
      case 'videoStitch':
        return {
          label: 'Video Stitch',
          transitionType: 'dissolve',
          transitionDuration: 0.5,
        };
      default:
        return { label: 'Node' };
    }
  };

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const exportWorkflow = () => {
    const workflow = {
      workflowId: workflowName,
      description: 'Visual workflow created with SmokeTech Studio',
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        inputs: convertNodeDataToInputs(node),
        outputs: getNodeOutputs(node.type || ''),
      })),
    };

    // Download as JSON
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

  const convertNodeDataToInputs = (node: Node) => {
    const inputs: Record<string, any> = { ...node.data };
    delete inputs.label;

    // Convert edge connections to {{node.output}} format
    const incomingEdges = edges.filter((e) => e.target === node.id);
    incomingEdges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (sourceNode) {
        const outputName = getNodeOutputs(sourceNode.type || '')[0];
        inputs[edge.targetHandle || 'input'] = `{{${edge.source}.${outputName}}}`;
      }
    });

    return inputs;
  };

  const getNodeOutputs = (nodeType: string): string[] => {
    switch (nodeType) {
      case 'characterImage':
        return ['characterImagePath'];
      case 'videoGeneration':
        return ['videoPath'];
      case 'videoStitch':
        return ['stitchedVideoPath'];
      default:
        return ['output'];
    }
  };

  const importWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workflow = JSON.parse(e.target?.result as string);

        // Convert workflow JSON to React Flow nodes and edges
        const newNodes: Node[] = workflow.nodes.map((node: any, index: number) => ({
          id: node.id,
          type: node.type,
          position: { x: 100 + index * 250, y: 100 + Math.floor(index / 3) * 150 },
          data: {
            label: node.type.replace(/([A-Z])/g, ' $1').trim(),
            ...node.inputs,
          },
        }));

        const newEdges: Edge[] = [];
        workflow.nodes.forEach((node: any) => {
          Object.entries(node.inputs || {}).forEach(([key, value]) => {
            if (typeof value === 'string' && value.match(/\{\{(.+?)\.(.+?)\}\}/)) {
              const match = value.match(/\{\{(.+?)\.(.+?)\}\}/);
              if (match) {
                const [, sourceId] = match;
                newEdges.push({
                  id: `${sourceId}-${node.id}`,
                  source: sourceId,
                  target: node.id,
                  targetHandle: key,
                });
              }
            }
          });
        });

        setNodes(newNodes);
        setEdges(newEdges);
        setWorkflowName(workflow.workflowId || 'imported-workflow');
      } catch (error) {
        console.error('Failed to import workflow:', error);
        alert('Failed to import workflow. Please check the JSON format.');
      }
    };
    reader.readAsText(file);
  };

  const clearWorkflow = () => {
    if (confirm('Are you sure you want to clear the entire workflow?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
    }
  };

  const generateWorkflow = async () => {
    if (nodes.length === 0) {
      alert('Please add at least one node to the workflow before generating');
      return;
    }

    try {
      setIsGenerating(true);

      // Extract video prompt from videoGeneration node for the Extend feature
      const videoGenNode = nodes.find((n) => n.type === 'videoGeneration');
      if (videoGenNode) {
        setVideoPrompt(videoGenNode.data.prompt || '');
      }

      // Build workflow JSON similar to export
      const workflow = {
        workflowId: workflowName,
        description: 'Visual workflow created with SmokeTech Studio',
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type,
          inputs: convertNodeDataToInputs(node),
          outputs: getNodeOutputs(node.type || ''),
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          sourceHandle: edge.sourceHandle,
          target: edge.target,
          targetHandle: edge.targetHandle,
        }))
      };

      console.log('🚀 Sending workflow to Temporal:', workflow);

      // Call API to start Temporal workflow
      const response = await fetch('/api/execute-visual-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflow),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to start workflow');
      }

      console.log('✅ Workflow started:', result.operationId);

      // Set operation ID to start tracking
      setOperationId(result.operationId);

    } catch (error: any) {
      console.error('❌ Failed to generate workflow:', error);
      alert(`Failed to generate workflow: ${error.message}`);
      setIsGenerating(false);
      setOperationId(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">🎨 Visual Workflow Editor</h1>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            placeholder="workflow-name"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors">
            📁 Import
            <input
              type="file"
              accept=".json"
              onChange={importWorkflow}
              className="hidden"
            />
          </label>
          <button
            onClick={exportWorkflow}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            💾 Export JSON
          </button>
          <button
            onClick={generateWorkflow}
            disabled={nodes.length === 0 || isGenerating}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>🚀 Generate Video</>
            )}
          </button>
          <button
            onClick={clearWorkflow}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Node Palette */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🧩 Node Palette</h2>
          <div className="space-y-3">
            <NodePaletteItem
              type="characterImage"
              label="Character Image"
              icon="👤"
              description="Generate character with AI"
            />
            <NodePaletteItem
              type="videoGeneration"
              label="Video Generation"
              icon="🎬"
              description="Create video from prompt"
            />
            <NodePaletteItem
              type="videoStitch"
              label="Video Stitch"
              icon="✂️"
              description="Combine multiple videos"
            />
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Drag nodes to canvas</li>
              <li>• Connect outputs to inputs</li>
              <li>• Click nodes to configure</li>
              <li>• Export to JSON when done</li>
            </ul>
          </div>
        </div>

        {/* Canvas */}
        <div ref={reactFlowWrapper} className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background variant={BackgroundVariant.Dots} />
            <Controls />
            <MiniMap />
            <Panel position="top-right" className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="text-sm">
                <div className="font-semibold text-gray-900">Nodes: {nodes.length}</div>
                <div className="text-gray-600">Connections: {edges.length}</div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Properties Panel */}
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Properties</h2>
          {selectedNode ? (
            <PropertiesPanel node={selectedNode} setNodes={setNodes} />
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">👈</div>
              <p>Click a node to edit its properties</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress Panel */}
      {operationId && (
        <ProgressPanel
          operationId={operationId}
          prompt={videoPrompt}
          onClose={() => {
            setOperationId(null);
            setIsGenerating(false);
          }}
        />
      )}
    </div>
  );
}

// Node Palette Item Component
function NodePaletteItem({
  type,
  label,
  icon,
  description,
}: {
  type: string;
  label: string;
  icon: string;
  description: string;
}) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, type)}
      className="p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-move hover:border-blue-500 hover:bg-blue-50 transition-all"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{icon}</span>
        <span className="font-semibold text-gray-900">{label}</span>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
}

// Properties Panel Component
function PropertiesPanel({ node, setNodes }: { node: Node; setNodes: any }) {
  const updateNodeData = (key: string, value: any) => {
    setNodes((nds: Node[]) =>
      nds.map((n) => {
        if (n.id === node.id) {
          return {
            ...n,
            data: {
              ...n.data,
              [key]: value,
            },
          };
        }
        return n;
      })
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="font-semibold text-gray-900 mb-2">Node ID</div>
        <div className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
          {node.id}
        </div>
      </div>

      {node.type === 'characterImage' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Character Prompt
            </label>
            <textarea
              value={node.data.characterPrompt || ''}
              onChange={(e) => updateNodeData('characterPrompt', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={4}
              placeholder="Describe the character..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={node.data.model || 'nanobana'}
              onChange={(e) => updateNodeData('model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="nanobana">NanoBanana - $0.02/image</option>
              <option value="midjourney">Midjourney - $0.08/image</option>
              <option value="dalle">DALL-E 3 HD - $0.08/image</option>
              <option value="imagen">Imagen 3 - $0.08/image</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={node.data.preserveFeatures || false}
                onChange={(e) => updateNodeData('preserveFeatures', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Preserve Features</span>
            </label>
          </div>
        </>
      )}

      {node.type === 'videoGeneration' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video Prompt
            </label>
            <textarea
              value={node.data.prompt || ''}
              onChange={(e) => updateNodeData('prompt', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={4}
              placeholder="Describe the video action..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={node.data.model || 'veo3-fast'}
              onChange={(e) => updateNodeData('model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="veo3-fast">VEO3 Fast - $0.75/s</option>
              <option value="veo3-standard">VEO3 Standard - $5.00/s</option>
              <option value="sora-2">Sora 2 - $5.00/s</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (seconds)
            </label>
            <input
              type="number"
              value={node.data.duration || 8}
              onChange={(e) => updateNodeData('duration', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              min="1"
              max="60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aspect Ratio
            </label>
            <select
              value={node.data.aspectRatio || '16:9'}
              onChange={(e) => updateNodeData('aspectRatio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="16:9">16:9 (YouTube)</option>
              <option value="9:16">9:16 (TikTok)</option>
              <option value="1:1">1:1 (Instagram)</option>
            </select>
          </div>
        </>
      )}

      {node.type === 'videoStitch' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transition Type
            </label>
            <select
              value={node.data.transitionType || 'dissolve'}
              onChange={(e) => updateNodeData('transitionType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="dissolve">Dissolve</option>
              <option value="fade">Fade</option>
              <option value="wipe">Wipe</option>
              <option value="slide">Slide</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transition Duration (seconds)
            </label>
            <input
              type="number"
              value={node.data.transitionDuration || 0.5}
              onChange={(e) => updateNodeData('transitionDuration', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              min="0"
              max="3"
              step="0.1"
            />
          </div>
        </>
      )}
    </div>
  );
}
