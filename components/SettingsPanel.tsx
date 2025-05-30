
import React, { useState, useEffect, ChangeEvent } from 'react';
import { SimulationSettings, Preset } from '../types';
import { DEFAULT_SIMULATION_SETTINGS } from '../constants';

interface SettingsPanelProps {
  initialSettings: SimulationSettings;
  presets: Preset[];
  onApplySettings: (settings: SimulationSettings) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ initialSettings, presets, onApplySettings, onClose }) => {
  const [currentSettings, setCurrentSettings] = useState<SimulationSettings>(initialSettings);

  useEffect(() => {
    setCurrentSettings(initialSettings);
  }, [initialSettings]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean = value;

    if (type === 'number') {
      processedValue = parseFloat(value);
      if (isNaN(processedValue)) {
        // Attempt to handle empty string or invalid number more gracefully.
        const originalSetting = DEFAULT_SIMULATION_SETTINGS[name as keyof SimulationSettings];
        // Ensure processedValue is number for number fields, matching SimulationSettings types
        processedValue = typeof originalSetting === 'number' ? 0 : (originalSetting || 0); 
      }
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }
    
    setCurrentSettings(prev => ({ ...prev, [name]: processedValue as any })); // Cast to any here is for general compatibility, SimulationSettings types are the source of truth
  };
  
  const handlePresetSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const presetName = e.target.value;
    const selectedPreset = presets.find(p => p.name === presetName);
    if (selectedPreset) {
      setCurrentSettings(prev => ({
        ...DEFAULT_SIMULATION_SETTINGS, 
        // ...prev, // Spreading prev first might be better to ensure all default fields are present
        ...selectedPreset.settings // Then apply preset specifics
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure all number fields are indeed numbers before applying
    const validatedSettings = { ...currentSettings };
    for (const key in validatedSettings) {
        if (Object.prototype.hasOwnProperty.call(validatedSettings, key)) {
            const typedKey = key as keyof SimulationSettings;
            // Check against DEFAULT_SIMULATION_SETTINGS to identify numeric fields
            if (typeof DEFAULT_SIMULATION_SETTINGS[typedKey] === 'number') {
                // Ensure the value is a number; if not (e.g. from bad state), parse or default.
                const currentValue = validatedSettings[typedKey];
                const numVal = parseFloat(String(currentValue));

                if (isNaN(numVal)) {
                    // If parsing fails (e.g. it was an empty string or malformed),
                    // fall back to the default value for that specific numeric setting.
                    validatedSettings[typedKey] = DEFAULT_SIMULATION_SETTINGS[typedKey];
                } else {
                    validatedSettings[typedKey] = numVal;
                }
            }
            // Boolean fields are typically handled by their 'checked' state and should be correct.
        }
    }
    onApplySettings(validatedSettings);
  };

  const renderInputField = (label: string, name: keyof SimulationSettings, type: string = 'number', step: string = "1", min?: string, max?: string) => (
    <div className="mb-3">
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 capitalize">{label.replace(/([A-Z])/g, ' $1')}:</label>
      <input
        type={type}
        id={name}
        name={name}
        value={String(currentSettings[name])} // Explicitly convert to string for the input value
        onChange={handleChange}
        step={step}
        min={min}
        max={max}
        className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
      />
    </div>
  );

  const renderCheckboxField = (label: string, name: keyof SimulationSettings) => (
    <div className="mb-3 flex items-center">
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={Boolean(currentSettings[name])} // Ensure it's a boolean for the checkbox
        onChange={handleChange}
        className="h-4 w-4 text-indigo-600 border-gray-500 rounded focus:ring-indigo-500 bg-gray-700"
      />
      <label htmlFor={name} className="ml-2 block text-sm font-medium text-gray-300 capitalize">{label.replace(/([A-Z])/g, ' $1')}:</label>
    </div>
  );


  return (
    <div className="p-6 bg-gray-800 text-gray-100 w-full max-w-2xl mx-auto h-full overflow-y-auto rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-purple-400 border-b-2 border-purple-500 pb-2 mb-6">Simulation Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="preset" className="block text-sm font-medium text-gray-300">Load Preset:</label>
          <select
            id="preset"
            name="preset"
            onChange={handlePresetSelect}
            defaultValue=""
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-white"
          >
            <option value="" disabled>Select a preset...</option>
            {presets.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <fieldset className="border border-gray-600 p-4 rounded-md">
                <legend className="text-lg font-semibold text-purple-300 px-2">Grid & Agents</legend>
                {renderInputField("Grid Rows", "gridRows", "number", "1", "5", "50")}
                {renderInputField("Grid Cols", "gridCols", "number", "1", "5", "50")}
                {renderInputField("Num Agents", "numAgents", "number", "1", "1", "10")}
                {renderInputField("Initial Energy", "initialEnergy", "number", "10", "10", "1000")}
                {renderInputField("Energy Depletion Rate", "energyDepletionRate", "number", "0.1", "0", "10")}
                {renderInputField("Low Energy Threshold", "lowEnergyThreshold", "number", "5", "0", "500")}
                {renderInputField("Agent Base Speed", "agentBaseSpeed", "number", "1", "1", "5")}
                {renderInputField("Agent Carry Capacity", "agentBaseCarryCapacity", "number", "1", "1", "10")}
            </fieldset>
            
            <fieldset className="border border-gray-600 p-4 rounded-md">
                <legend className="text-lg font-semibold text-purple-300 px-2">Resources & Charging</legend>
                {renderInputField("Resource Recharge Amount", "resourceRechargeAmount", "number", "1", "0", "100")}
                {renderInputField("Plant Recharge Multiplier", "plantRechargeMultiplier", "number", "0.1", "1", "5")}
                {renderInputField("Obstacle Density", "obstacleDensity", "number", "0.01", "0", "0.5")}
                {renderInputField("Resource Respawn Rate", "resourceRespawnRate", "number", "0.001", "0", "0.1")}
                {renderInputField("Charging Station Recharge", "chargingStationRechargePerStep", "number", "1", "0", "50")}
            </fieldset>
        </div>

        <fieldset className="border border-gray-600 p-4 rounded-md">
            <legend className="text-lg font-semibold text-purple-300 px-2">SubQuantum System (SQS)</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                {renderInputField("SQS F Energy", "sqsFEnergy", "number", "0.0001", "0.0001", "0.1")}
                {renderInputField("SQS F Phase", "sqsFPhase", "number", "0.0001", "0.0001", "0.1")}
                {renderInputField("SQS Noise Factor", "sqsNoiseFactor", "number", "0.01", "0", "1")}
                {renderInputField("SQS Threshold S", "sqsThresholdS", "number", "0.01", "0.1", "1.5")}
                {renderInputField("SQS Decimal Precision", "sqsDecimalPrecision", "number", "1", "0", "5")}
                {renderInputField("SQS Max Sim Time Period", "sqsMaxSimTimePeriod", "number", "10", "50", "2000")}
                {renderInputField("SQS Re(s) Projection C", "sqsReSProjectionC", "number", "0.01", "0.01", "1")}
                {renderInputField("SQS Comm Threshold Factor", "sqsCommThresholdFactor", "number", "0.01", "0.1", "1")}
                {renderInputField("SQS Comm Decimal Precision", "sqsCommDecimalPrecision", "number", "1", "0", "5")}
            </div>
        </fieldset>

        <fieldset className="border border-gray-600 p-4 rounded-md">
            <legend className="text-lg font-semibold text-purple-300 px-2">SQK Effects & Simulation</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                {renderInputField("SQK Effect Duration Min", "sqkEffectBaseDurationMin", "number", "1", "5", "100")}
                {renderInputField("SQK Effect Duration Max", "sqkEffectBaseDurationMax", "number", "1", "10", "200")}
                {renderInputField("SQK Speed Boost Min", "sqkSpeedBoostMultiplierMin", "number", "0.1", "1", "3")}
                {renderInputField("SQK Speed Boost Max", "sqkSpeedBoostMultiplierMax", "number", "0.1", "1.1", "5")}
                {renderInputField("Simulation Tick (ms)", "simulationTickMs", "number", "10", "50", "2000")}
            </div>
        </fieldset>
        
        <fieldset className="border border-gray-600 p-4 rounded-md">
            <legend className="text-lg font-semibold text-purple-300 px-2">Display Options</legend>
             {renderCheckboxField("Show Internal SQS Wave Values", "showInternalWaveValues")}
        </fieldset>


        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
          >
            Apply Settings & Restart
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPanel;
