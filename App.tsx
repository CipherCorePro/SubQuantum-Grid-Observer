
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Simulation } from './services/simulationService';
import { SimulationState, Agent as AgentType, SimulationSettings, Preset } from './types';
import GridDisplay from './components/GridDisplay';
import InfoPanel from './components/InfoPanel';
import SettingsPanel from './components/SettingsPanel'; // New
import { DEFAULT_SIMULATION_SETTINGS, PRESETS } from './constants';

const App: React.FC = () => {
  const [appliedSettings, setAppliedSettings] = useState<SimulationSettings>(DEFAULT_SIMULATION_SETTINGS);
  const [simulationService, setSimulationService] = useState(() => new Simulation(appliedSettings));
  const [simulationState, setSimulationState] = useState<SimulationState>(simulationService.state);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState<boolean>(false);
  
  // useRef for the simulation instance to ensure step function uses the latest instance
  const simulationInstanceRef = useRef(simulationService); 
  // Update ref whenever simulationService changes
  useEffect(() => {
    simulationInstanceRef.current = simulationService;
  }, [simulationService]);


  const runSimulationStep = useCallback(async () => {
    if (!isRunning) return;
    // Ensure we are using the most current simulation instance from the ref
    await simulationInstanceRef.current.step();
    setSimulationState({ ...simulationInstanceRef.current.state });
  }, [isRunning]); // Removed simulationService from deps as it's handled by ref

  useEffect(() => {
    if (simulationState.agents.length > 0 && !selectedAgent) {
      setSelectedAgent(simulationState.agents.find(a => a.id === 0) || simulationState.agents[0]);
    } else if (selectedAgent) {
      // Keep selected agent updated if it still exists
      const updatedSelectedAgent = simulationState.agents.find(a => a.id === selectedAgent.id);
      setSelectedAgent(updatedSelectedAgent || (simulationState.agents.length > 0 ? simulationState.agents[0] : null));
    }
  }, [simulationState.agents]);


  useEffect(() => {
    if (!isRunning) return;
    // Use simulationTickMs from the *applied* settings for the current simulation
    const tickMs = simulationInstanceRef.current.state.settings.simulationTickMs;
    const intervalId = setInterval(() => {
      runSimulationStep();
    }, tickMs);

    return () => clearInterval(intervalId);
  }, [runSimulationStep, isRunning, simulationState.settings.simulationTickMs]); // Depend on tickMs from state

  const handleSelectAgent = (agent: AgentType | null) => {
    setSelectedAgent(agent);
  };

  const reinitializeSimulation = (settings: SimulationSettings) => {
    const newSimService = new Simulation(settings);
    setSimulationService(newSimService); // This will trigger the useEffect to update simulationInstanceRef
    setSimulationState(newSimService.state);
    setSelectedAgent(newSimService.state.agents.length > 0 ? newSimService.state.agents[0] : null);
    if (!isRunning) setIsRunning(true);
  };

  const handleApplySettings = (newSettings: SimulationSettings) => {
    setAppliedSettings(newSettings);
    reinitializeSimulation(newSettings);
    setIsSettingsPanelOpen(false);
  };
  
  const handleResetSimulation = () => {
    // Reset with the currently applied settings, or default if preferred
    // Using appliedSettings provides a "restart with current config" behavior
    reinitializeSimulation(appliedSettings); 
  };

  const handleToggleRun = () => {
    setIsRunning(prev => !prev);
  };

  const handleToggleSettingsPanel = () => {
    setIsSettingsPanelOpen(prev => !prev);
     if (isRunning && !isSettingsPanelOpen) setIsRunning(false); // Pause if opening settings
  };


  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white">
      <div className="flex-grow p-4 flex flex-col items-center justify-center overflow-auto">
        <div className="mb-4 flex space-x-2">
            <button 
                onClick={handleToggleRun}
                className={`px-4 py-2 rounded font-semibold transition-colors
                            ${isRunning 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
                {isRunning ? 'Pause Simulation' : 'Resume Simulation'}
            </button>
            <button 
                onClick={handleResetSimulation}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition-colors"
            >
                Reset Simulation
            </button>
            <button
                onClick={handleToggleSettingsPanel}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded transition-colors"
            >
                {isSettingsPanelOpen ? 'Close Settings' : 'Open Settings'}
            </button>
        </div>
        <GridDisplay simulationState={simulationState} />
      </div>
      <div className={`w-full md:w-1/3 md:max-w-md lg:max-w-lg xl:max-w-xl bg-gray-800 shadow-lg overflow-y-auto h-full md:h-screen
                      ${isSettingsPanelOpen ? 'hidden md:block' : ''}`}>
        <InfoPanel 
            simulationState={simulationState} 
            selectedAgent={selectedAgent} 
            onSelectAgent={handleSelectAgent} 
        />
      </div>
      {isSettingsPanelOpen && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-95 z-50 flex items-center justify-center md:static md:w-1/3 md:max-w-md lg:max-w-lg xl:max-w-xl md:h-screen md:overflow-y-auto">
          <SettingsPanel
            initialSettings={appliedSettings} // Show last applied settings
            presets={PRESETS}
            onApplySettings={handleApplySettings}
            onClose={handleToggleSettingsPanel}
          />
        </div>
      )}
    </div>
  );
};

export default App;