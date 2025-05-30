
import { ResourceType, SimulationSettings, Preset } from './types';

// Non-Dynamic Constants (or less frequently changed)
export const CELL_SIZE_PX = 28; // Adjust for desired visual size
export const AGENT_COLORS = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-yellow-500"];
export const CHARGING_STATION_POSITION = { r: 0, c: 0 };

export const RESOURCE_COLORS: Record<ResourceType, string> = {
  [ResourceType.EMPTY]: "bg-gray-200",
  [ResourceType.ORE]: "bg-gray-500",
  [ResourceType.TREE]: "bg-green-700",
  [ResourceType.WATER]: "bg-blue-600",
  [ResourceType.PLANT]: "bg-teal-500",
  [ResourceType.OBSTACLE]: "bg-neutral-800",
  [ResourceType.NEW_RESOURCE]: "bg-yellow-400",
  [ResourceType.GOAL]: "bg-red-700",
  [ResourceType.CHARGING_STATION]: "bg-purple-600",
};

export const RESOURCE_NAMES: Record<ResourceType, string> = {
  [ResourceType.EMPTY]: "Empty",
  [ResourceType.ORE]: "Ore",
  [ResourceType.TREE]: "Tree",
  [ResourceType.WATER]: "Water",
  [ResourceType.PLANT]: "Energy Plant",
  [ResourceType.OBSTACLE]: "Obstacle",
  [ResourceType.NEW_RESOURCE]: "Nova Crystal",
  [ResourceType.GOAL]: "Target Beacon",
  [ResourceType.CHARGING_STATION]: "Charging Station",
};

export const RESOURCE_CONFIG: Partial<Record<ResourceType, number>> = {
  [ResourceType.ORE]: 0.08,
  [ResourceType.TREE]: 0.06,
  [ResourceType.WATER]: 0.05,
  [ResourceType.PLANT]: 0.03,
  [ResourceType.NEW_RESOURCE]: 0.02,
};


// Default Simulation Settings
export const DEFAULT_SIMULATION_SETTINGS: SimulationSettings = {
  gridRows: 20,
  gridCols: 20,
  numAgents: 2,
  initialEnergy: 200,
  energyDepletionRate: 0.5,
  resourceRechargeAmount: 20,
  plantRechargeMultiplier: 2,
  obstacleDensity: 0.05,
  resourceRespawnRate: 0.01,
  agentBaseSpeed: 1,
  agentBaseCarryCapacity: 2,
  lowEnergyThreshold: 50, // Absolute value, can be calculated as INITIAL_ENERGY * 0.25 in logic if needed
  chargingStationRechargePerStep: 15,

  sqsFEnergy: 0.008,
  sqsFPhase: 0.0082,
  sqsNoiseFactor: 0.03,
  sqsThresholdS: 0.96,
  sqsDecimalPrecision: 3,
  sqsMaxSimTimePeriod: 500,
  sqsReSProjectionC: 0.10,
  sqsCommThresholdFactor: 0.90,
  sqsCommDecimalPrecision: 2,

  sqkEffectBaseDurationMin: 20,
  sqkEffectBaseDurationMax: 40,
  sqkSpeedBoostMultiplierMin: 1.3,
  sqkSpeedBoostMultiplierMax: 1.8,
  
  simulationTickMs: 200,
  showInternalWaveValues: false,
};

// Simulation Presets
export const PRESETS: Preset[] = [
  {
    name: "Default",
    settings: { ...DEFAULT_SIMULATION_SETTINGS },
  },
  {
    name: "Chaotisch",
    settings: {
      sqsNoiseFactor: 0.25,
      sqsThresholdS: 0.85,
      sqsFEnergy: 0.02,
      sqsFPhase: 0.025,
      sqkEffectBaseDurationMin: 10,
      sqkEffectBaseDurationMax: 25,
      resourceRespawnRate: 0.05,
      energyDepletionRate: 0.7,
    },
  },
  {
    name: "Harmonisch",
    settings: {
      sqsNoiseFactor: 0.01,
      sqsThresholdS: 0.98,
      sqsFEnergy: 0.005,
      sqsFPhase: 0.005, // Same frequency, more coherence
      sqkEffectBaseDurationMin: 30,
      sqkEffectBaseDurationMax: 60,
      sqsCommThresholdFactor: 0.95,
      energyDepletionRate: 0.3,
    },
  },
  {
    name: "Resonanzanfällig",
    settings: {
      sqsThresholdS: 0.90,
      sqsDecimalPrecision: 2, // Easier to match
      sqsCommDecimalPrecision: 1,
      sqsCommThresholdFactor: 0.85,
    }
  },
  {
    name: "Resonanzresistent",
    settings: {
        sqsThresholdS: 1.1, // Harder to reach
        sqsDecimalPrecision: 4, // Harder to match
        sqsNoiseFactor: 0.05,
    }
  }
];
