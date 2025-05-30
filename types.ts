
export enum ResourceType {
  EMPTY = 0,
  ORE = 1,
  TREE = 2,
  WATER = 3,
  PLANT = 4,
  OBSTACLE = 5,
  NEW_RESOURCE = 6,
  GOAL = 7,
  CHARGING_STATION = 8, // New
}

export interface GridCell {
  type: ResourceType;
  isBoosted?: boolean;
}

export interface Agent {
  id: number;
  position: { r: number; c: number };
  color: string;
  energy: number;
  inventory: Record<ResourceType, number>;
  speed: number;
  carryCapacity: number;
}

export interface SQSState {
  energyWaveValue: number;
  phaseWaveValue: number;
  isCommunicationConducive: boolean;
  knotHistory: GlobalKnotInfo[];
  // showInternalWaveValues is more of a display setting, managed in App/InfoPanel based on SimulationSettings
}

export interface GlobalKnotInfo {
  timeStepAbs: number;
  energyVal: number;
  phaseVal: number;
  reSProjection: number;
}

export enum SQKEffectType {
  NONE = "none",
  RESOURCE_BOOST = "resource_boost",
  AGENT_SPEED_BOOST = "agent_speed_boost",
  GOAL_REVEAL = "goal_reveal", // More for narrative
}

export interface SQKEffect {
  type: SQKEffectType;
  duration: number;
  description?: string; // For Gemini generated text
  details?: {
    boostedCells?: { r: number; c: number }[];
    targetAgentId?: number | "all";
    speedMultiplier?: number;
  };
}

export interface SimulationSettings {
  gridRows: number;
  gridCols: number;
  numAgents: number;
  initialEnergy: number;
  energyDepletionRate: number;
  resourceRechargeAmount: number;
  plantRechargeMultiplier: number;
  obstacleDensity: number;
  resourceRespawnRate: number;
  agentBaseSpeed: number;
  agentBaseCarryCapacity: number;
  lowEnergyThreshold: number; // Percentage of initialEnergy or absolute value
  chargingStationRechargePerStep: number;

  sqsFEnergy: number;
  sqsFPhase: number;
  sqsNoiseFactor: number;
  sqsThresholdS: number;
  sqsDecimalPrecision: number;
  sqsMaxSimTimePeriod: number;
  sqsReSProjectionC: number;
  sqsCommThresholdFactor: number;
  sqsCommDecimalPrecision: number;

  sqkEffectBaseDurationMin: number;
  sqkEffectBaseDurationMax: number;
  sqkSpeedBoostMultiplierMin: number;
  sqkSpeedBoostMultiplierMax: number;
  
  simulationTickMs: number;
  showInternalWaveValues: boolean; // For the checkbox
}

export interface Preset {
  name: string;
  settings: Partial<SimulationSettings>;
}


export interface SimulationState {
  grid: GridCell[][];
  agents: Agent[];
  sqsState: SQSState;
  activeSQKEffect: SQKEffect | null;
  step: number;
  simulationTime: number; // Overall simulation time for SQS
  settings: SimulationSettings; // Applied settings for the current simulation
}

export type AgentAction = "NORTH" | "SOUTH" | "EAST" | "WEST" | "COLLECT" | "IDLE" | "CHARGE"; // New