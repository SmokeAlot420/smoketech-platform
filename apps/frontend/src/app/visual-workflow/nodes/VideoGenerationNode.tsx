import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

function VideoGenerationNode({ data, selected, id }: NodeProps) {
  const handleClick = data.onHandleClick;
  const pendingConnection = data.pendingConnection;

  // Check if handles are part of a pending connection
  const isPendingSource = pendingConnection?.nodeId === id && pendingConnection?.handleId === 'videoPath';
  const canConnect = pendingConnection?.handleType === 'source';

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 border-2 min-w-[200px] ${
        selected ? 'border-yellow-400' : 'border-blue-700'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="characterImagePath"
        className={`w-6 h-6 border-2 hover:scale-125 transition-all cursor-pointer shadow-lg ${
          canConnect
            ? 'bg-green-300 border-green-600 animate-pulse'
            : 'bg-white border-blue-700 hover:bg-blue-200'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          if (handleClick) {
            handleClick(id, 'characterImagePath', 'target');
          }
        }}
      />
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">🎬</span>
        <div className="font-bold text-white">Video Generation</div>
      </div>
      <div className="text-xs text-blue-100 mb-2">
        {data.model || 'VEO3 Fast'} • {data.duration || 8}s • {data.aspectRatio || '16:9'}
      </div>
      <div className="text-xs text-blue-100">
        {data.prompt ? '✓ Prompt set' : '⚠️ No prompt'}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="videoPath"
        className={`w-6 h-6 border-2 hover:scale-125 transition-all cursor-pointer shadow-lg ${
          isPendingSource
            ? 'bg-yellow-400 border-yellow-600 animate-pulse'
            : 'bg-white border-blue-700 hover:bg-blue-200'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          if (handleClick) {
            handleClick(id, 'videoPath', 'source');
          }
        }}
      />
    </div>
  );
}

export default memo(VideoGenerationNode);
