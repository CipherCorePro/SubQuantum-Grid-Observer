
import React from 'react';
import { Agent } from '../types';
import { CELL_SIZE_PX } from '../constants';

interface AgentSpriteProps {
  agent: Agent;
  initialEnergy: number; // Added prop
}

const AgentSprite: React.FC<AgentSpriteProps> = ({ agent, initialEnergy }) => {
  const size = CELL_SIZE_PX * 0.7; // Agent slightly smaller than cell
  const offset = (CELL_SIZE_PX - size) / 2;

  const style = {
    left: `${agent.position.c * CELL_SIZE_PX + offset}px`,
    top: `${agent.position.r * CELL_SIZE_PX + offset}px`,
    width: `${size}px`,
    height: `${size}px`,
    transition: 'top 0.15s linear, left 0.15s linear', // Smooth movement
  };

  const energyPercentage = initialEnergy > 0 ? (agent.energy / initialEnergy) * 100 : 0;

  return (
    <div
      className={`absolute rounded-full ${agent.color} border-2 border-black shadow-lg flex items-center justify-center text-white text-xs font-bold`}
      style={style}
      title={`Agent ${agent.id} (Energy: ${agent.energy.toFixed(0)})`}
    >
      {/* Agent ID */}
      {/* <span>{agent.id}</span> */}
      {/* Energy bar inside agent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-50 rounded-b-full overflow-hidden">
        <div className="h-full bg-green-400" style={{ width: `${energyPercentage}%` }}></div>
      </div>
    </div>
  );
};

export default AgentSprite;