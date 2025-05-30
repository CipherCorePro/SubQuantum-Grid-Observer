
import React from 'react';
import { GridCell, ResourceType } from '../types';
import { RESOURCE_COLORS, CELL_SIZE_PX, RESOURCE_NAMES } from '../constants';

interface ResourceCellProps {
  cell: GridCell;
}

const ResourceCell: React.FC<ResourceCellProps> = ({ cell }) => {
  const color = RESOURCE_COLORS[cell.type] || 'bg-black';
  const title = RESOURCE_NAMES[cell.type] || 'Unknown';

  const style = {
    width: `${CELL_SIZE_PX}px`,
    height: `${CELL_SIZE_PX}px`,
  };

  return (
    <div
      className={`border border-gray-400 flex items-center justify-center ${color} relative`}
      style={style}
      title={title}
    >
      {cell.isBoosted && (
        <div 
          className="absolute inset-0 border-2 border-yellow-400 animate-pulse"
          style={{ boxShadow: '0 0 8px 2px rgba(250, 204, 21, 0.7)' }}
        ></div>
      )}
       {/* Optionally display a small icon or letter for resource type */}
       {/* {cell.type !== ResourceType.EMPTY && cell.type !== ResourceType.OBSTACLE && (
         <span className="text-xs text-white mix-blend-difference">{title.substring(0,1)}</span>
       )} */}
    </div>
  );
};

export default ResourceCell;
