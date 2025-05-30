
import React from 'react';
import { SimulationState } from '../types';
import ResourceCell from './ResourceCell';
import AgentSprite from './AgentSprite';
import { CELL_SIZE_PX } from '../constants'; // CELL_SIZE_PX remains constant for now

interface GridDisplayProps {
  simulationState: SimulationState;
}

const GridDisplay: React.FC<GridDisplayProps> = ({ simulationState }) => {
  const { grid, agents, settings } = simulationState;
  const { gridCols, gridRows } = settings;

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridCols}, ${CELL_SIZE_PX}px)`,
    gridTemplateRows: `repeat(${gridRows}, ${CELL_SIZE_PX}px)`,
    width: `${gridCols * CELL_SIZE_PX}px`,
    height: `${gridRows * CELL_SIZE_PX}px`,
    // Ensure the container can shrink if the grid becomes very small
    minWidth: `${gridCols * CELL_SIZE_PX}px`, 
    minHeight: `${gridRows * CELL_SIZE_PX}px`,
  };

  return (
    <div className="relative border-2 border-gray-700 bg-gray-800 shadow-2xl" style={gridStyle}>
      {grid.map((row, rIndex) =>
        row.map((cell, cIndex) => (
          <ResourceCell key={`${rIndex}-${cIndex}`} cell={cell} />
        ))
      )}
      {agents.map(agent => (
        agent.energy > 0 && <AgentSprite key={agent.id} agent={agent} initialEnergy={settings.initialEnergy} />
      ))}
    </div>
  );
};

export default GridDisplay;