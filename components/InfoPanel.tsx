
import React from 'react';
import { SimulationState, Agent, ResourceType } from '../types';
import { RESOURCE_NAMES } from '../constants';

interface InfoPanelProps {
  simulationState: SimulationState;
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent | null) => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ simulationState, selectedAgent, onSelectAgent }) => {
  const { sqsState, activeSQKEffect, step, agents, settings } = simulationState;
  const { initialEnergy, showInternalWaveValues } = settings;


  const renderInventory = (inventory: Record<ResourceType, number>) => {
    const items = Object.entries(inventory)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => {
        const resourceType = parseInt(type) as ResourceType;
        return (
          <li key={type} className="text-sm">
            {RESOURCE_NAMES[resourceType] || 'Unknown Resource'}: {count}
          </li>
        );
      });
    return items.length > 0 ? <ul className="list-disc list-inside">{items}</ul> : <p className="text-sm text-gray-400">Empty</p>;
  };

  return (
    <div className="p-4 space-y-4 bg-gray-800 text-gray-100 w-full md:w-96 overflow-y-auto">
      <h2 className="text-2xl font-bold text-cyan-400 border-b-2 border-cyan-500 pb-2">Simulation Status</h2>
      
      <div className="p-3 bg-gray-700 rounded-lg shadow">
        <p className="text-lg">Step: <span className="font-semibold text-yellow-400">{step}</span></p>
        <p className="text-lg">SQS Time: <span className="font-semibold text-yellow-400">{simulationState.simulationTime}</span></p>
      </div>

      <div className="p-3 bg-gray-700 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-teal-400 mb-2">SubQuantum System</h3>
        {showInternalWaveValues && (
          <>
            <p>Energy Wave (Raw): <span className="font-mono text-lime-400">{sqsState.energyWaveValue.toFixed(5)}</span></p>
            <p>Phase Wave (Raw): <span className="font-mono text-lime-400">{sqsState.phaseWaveValue.toFixed(5)}</span></p>
          </>
        )}
        <p>Energy Wave (Rounded): <span className="font-mono text-lime-400">{sqsState.energyWaveValue.toFixed(settings.sqsDecimalPrecision)}</span></p>
        <p>Phase Wave (Rounded): <span className="font-mono text-lime-400">{sqsState.phaseWaveValue.toFixed(settings.sqsDecimalPrecision)}</span></p>
        <p>Communication: 
          <span className={sqsState.isCommunicationConducive ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
            {sqsState.isCommunicationConducive ? " OPEN" : " CLOSED"}
          </span>
        </p>
        {sqsState.knotHistory.length > 0 && (
            <p className="text-xs mt-1 text-gray-400">Last Knot Re(s): {sqsState.knotHistory[sqsState.knotHistory.length-1].reSProjection.toFixed(3)}</p>
        )}
      </div>

      {activeSQKEffect && (
        <div className="p-3 bg-purple-700 rounded-lg shadow animate-pulse border-2 border-purple-400">
          <h3 className="text-xl font-semibold text-purple-300 mb-1">Active SQK Effect!</h3>
          <p className="capitalize font-bold text-lg text-white">{activeSQKEffect.type.replace(/_/g, ' ')}</p>
          <p className="text-sm text-purple-200">Duration: {activeSQKEffect.duration} steps</p>
          {activeSQKEffect.description && (
            <div className="mt-2 p-2 bg-purple-800 rounded">
              <p className="text-sm font-medium text-yellow-300">Gemini Narrative:</p>
              <p className="text-sm text-purple-100 italic">"{activeSQKEffect.description}"</p>
            </div>
          )}
        </div>
      )}

      <div className="p-3 bg-gray-700 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-orange-400 mb-2">Agents ({agents.length})</h3>
        {agents.map(agent => (
          <div 
            key={agent.id} 
            className={`p-2 mb-2 rounded cursor-pointer ${selectedAgent?.id === agent.id ? 'bg-blue-600 border-2 border-blue-300' : 'bg-gray-600 hover:bg-gray-500'}`}
            onClick={() => onSelectAgent(agent)}
          >
            <p className="font-bold">Agent {agent.id} <span className={`w-3 h-3 inline-block rounded-full ${agent.color} ml-2`}></span></p>
            <p className="text-sm">Energy: {agent.energy.toFixed(0)} / {initialEnergy}</p>
            {agent.energy <=0 && <p className="text-sm font-bold text-red-400">(INACTIVE)</p>}
          </div>
        ))}
      </div>
      
      {selectedAgent && selectedAgent.energy > 0 && (
        <div className="p-3 bg-gray-700 rounded-lg shadow border-2 border-blue-400">
          <h3 className="text-xl font-semibold text-blue-400 mb-2">Selected: Agent {selectedAgent.id}</h3>
           <p className="text-sm">Energy: {selectedAgent.energy.toFixed(0)} / {initialEnergy}</p>
           <div className="w-full bg-gray-600 rounded-full h-2.5 mb-2">
             <div className={`${selectedAgent.color} h-2.5 rounded-full`} style={{ width: `${(selectedAgent.energy/initialEnergy)*100}%` }}></div>
           </div>
          <p className="text-sm">Position: (R: {selectedAgent.position.r}, C: {selectedAgent.position.c})</p>
          <p className="text-sm">Speed: {selectedAgent.speed} (Base: {settings.agentBaseSpeed})</p>
          <p className="text-sm">Capacity: {selectedAgent.carryCapacity} (Base: {settings.agentBaseCarryCapacity})</p>
          <h4 className="text-md font-semibold mt-2 mb-1 text-gray-300">Inventory:</h4>
          {renderInventory(selectedAgent.inventory)}
        </div>
      )}
       {selectedAgent && selectedAgent.energy <= 0 && (
        <div className="p-3 bg-red-800 rounded-lg shadow border-2 border-red-500">
            <h3 className="text-xl font-semibold text-red-300 mb-2">Selected: Agent {selectedAgent.id} (INACTIVE)</h3>
            <p className="text-sm">This agent has depleted its energy.</p>
        </div>
       )}
    </div>
  );
};

export default InfoPanel;