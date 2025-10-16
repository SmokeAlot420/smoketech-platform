import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

function CharacterImageNode({ data, selected, id }: NodeProps) {
  const handleClick = data.onHandleClick;
  const pendingConnection = data.pendingConnection;

  // Check if this handle is part of a pending connection
  const isPendingSource = pendingConnection?.nodeId === id && pendingConnection?.handleId === 'characterImagePath';

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 border-2 min-w-[200px] ${
        selected ? 'border-yellow-400' : 'border-purple-700'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">👤</span>
        <div className="font-bold text-white">Character Image</div>
      </div>
      <div className="text-xs text-purple-100 mb-2">
        {data.model || 'NanoBanana'} • {data.characterPrompt ? '✓ Configured' : '⚠️ Not configured'}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="characterImagePath"
        className={`w-6 h-6 border-2 hover:scale-125 transition-all cursor-pointer shadow-lg ${
          isPendingSource
            ? 'bg-yellow-400 border-yellow-600 animate-pulse'
            : 'bg-white border-purple-700 hover:bg-purple-200'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          if (handleClick) {
            handleClick(id, 'characterImagePath', 'source');
          }
        }}
      />
    </div>
  );
}

export default memo(CharacterImageNode);
