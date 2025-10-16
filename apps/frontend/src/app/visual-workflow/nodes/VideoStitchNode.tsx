import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

function VideoStitchNode({ data, selected, id }: NodeProps) {
  const handleClick = data.onHandleClick;
  const pendingConnection = data.pendingConnection;

  // Check if handles are part of a pending connection
  const isPendingSource = pendingConnection?.nodeId === id && pendingConnection?.handleId === 'stitchedVideoPath';
  const canConnect = pendingConnection?.handleType === 'source';

  // Helper function to get handle class
  const getHandleClass = (handleId: string, isTarget: boolean) => {
    if (isTarget && canConnect) {
      return 'bg-green-300 border-green-600 animate-pulse';
    }
    if (!isTarget && isPendingSource) {
      return 'bg-yellow-400 border-yellow-600 animate-pulse';
    }
    return 'bg-white border-green-700 hover:bg-green-200';
  };

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-green-500 to-green-600 border-2 min-w-[200px] ${
        selected ? 'border-yellow-400' : 'border-green-700'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="input1"
        style={{ top: '30%' }}
        className={`w-6 h-6 border-2 hover:scale-125 transition-all cursor-pointer shadow-lg ${getHandleClass('input1', true)}`}
        onClick={(e) => {
          e.stopPropagation();
          if (handleClick) {
            handleClick(id, 'input1', 'target');
          }
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input2"
        style={{ top: '50%' }}
        className={`w-6 h-6 border-2 hover:scale-125 transition-all cursor-pointer shadow-lg ${getHandleClass('input2', true)}`}
        onClick={(e) => {
          e.stopPropagation();
          if (handleClick) {
            handleClick(id, 'input2', 'target');
          }
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="input3"
        style={{ top: '70%' }}
        className={`w-6 h-6 border-2 hover:scale-125 transition-all cursor-pointer shadow-lg ${getHandleClass('input3', true)}`}
        onClick={(e) => {
          e.stopPropagation();
          if (handleClick) {
            handleClick(id, 'input3', 'target');
          }
        }}
      />
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">✂️</span>
        <div className="font-bold text-white">Video Stitch</div>
      </div>
      <div className="text-xs text-green-100 mb-2">
        {data.transitionType || 'Dissolve'} • {data.transitionDuration || 0.5}s
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="stitchedVideoPath"
        className={`w-6 h-6 border-2 hover:scale-125 transition-all cursor-pointer shadow-lg ${getHandleClass('stitchedVideoPath', false)}`}
        onClick={(e) => {
          e.stopPropagation();
          if (handleClick) {
            handleClick(id, 'stitchedVideoPath', 'source');
          }
        }}
      />
    </div>
  );
}

export default memo(VideoStitchNode);
