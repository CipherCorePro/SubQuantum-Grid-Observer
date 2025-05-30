
import {
  GridCell,
  Agent,
  SQSState,
  SQKEffect,
  SimulationState,
  ResourceType,
  AgentAction,
  GlobalKnotInfo,
  SQKEffectType,
  SimulationSettings,
} from '../types';
import {
  AGENT_COLORS,
  RESOURCE_CONFIG,
  CHARGING_STATION_POSITION,
} from '../constants'; // Keep constants not part of SimulationSettings
import { generateSQKEffectNarrative } from './geminiService';

// Helper to get a random empty cell
const getRandomEmptyCell = (grid: GridCell[][], occupiedByAgents: Set<string>, settings: SimulationSettings): { r: number; c: number } | null => {
  const emptyCells: { r: number; c: number }[] = [];
  for (let r = 0; r < settings.gridRows; r++) {
    for (let c = 0; c < settings.gridCols; c++) {
      if (grid[r][c].type === ResourceType.EMPTY && !occupiedByAgents.has(`${r},${c}`)) {
        emptyCells.push({ r, c });
      }
    }
  }
  return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
};


class SubQuantumSystem {
  private settings: Pick<SimulationSettings, 
    'sqsFEnergy' | 'sqsFPhase' | 'sqsNoiseFactor' | 'sqsThresholdS' | 
    'sqsDecimalPrecision' | 'sqsMaxSimTimePeriod' | 'sqsReSProjectionC' | 
    'sqsCommThresholdFactor' | 'sqsCommDecimalPrecision'
  >;

  public state: SQSState;

  constructor(settings: SimulationSettings, simulationTime: number = 0) {
    this.settings = settings; // Store relevant SQS settings
    
    this.state = {
      energyWaveValue: 0.0,
      phaseWaveValue: 0.0,
      isCommunicationConducive: false,
      knotHistory: [],
    };
    this.update(simulationTime);
  }

  private calculateWaveValue(frequency: number, timeStep: number): number {
    const normTime = (timeStep % this.settings.sqsMaxSimTimePeriod) / this.settings.sqsMaxSimTimePeriod;
    const baseValue = (Math.sin(2 * Math.PI * frequency * this.settings.sqsMaxSimTimePeriod * normTime) + 1) / 2;
    const noise = (Math.random() - 0.5) * 2 * this.settings.sqsNoiseFactor;
    return Math.max(0, Math.min(1.5, baseValue + noise));
  }

  public update(currentTimeStep: number): boolean { 
    this.state.energyWaveValue = this.calculateWaveValue(this.settings.sqsFEnergy, currentTimeStep);
    this.state.phaseWaveValue = this.calculateWaveValue(this.settings.sqsFPhase, currentTimeStep);

    let globalKnotDetectedThisStep = false;
    if (this.state.energyWaveValue > this.settings.sqsThresholdS && this.state.phaseWaveValue > this.settings.sqsThresholdS) {
      const valERounded = parseFloat(this.state.energyWaveValue.toFixed(this.settings.sqsDecimalPrecision));
      const valPRounded = parseFloat(this.state.phaseWaveValue.toFixed(this.settings.sqsDecimalPrecision));

      if (Math.abs(valERounded - valPRounded) < Math.pow(10, -(this.settings.sqsDecimalPrecision + 1))) {
        globalKnotDetectedThisStep = true;
        const knotStrengthMetric = (this.state.energyWaveValue + this.state.phaseWaveValue) / 2.0;
        const newKnot: GlobalKnotInfo = {
          timeStepAbs: currentTimeStep,
          energyVal: this.state.energyWaveValue,
          phaseVal: this.state.phaseWaveValue,
          reSProjection: this.projectToReS(knotStrengthMetric),
        };
        this.state.knotHistory = [...this.state.knotHistory.slice(-20), newKnot];
      }
    }
    this.state.isCommunicationConducive = this.checkCommunicationConduciveness();
    return globalKnotDetectedThisStep;
  }

  private projectToReS(knotMetric: number): number {
    const baseReS = 0.45;
    const effectiveScaling = this.settings.sqsReSProjectionC * 5;
    const projectedValue = baseReS + (knotMetric - this.settings.sqsThresholdS) * effectiveScaling;
    return Math.max(0.01, Math.min(0.99, projectedValue));
  }

  private checkCommunicationConduciveness(): boolean {
    const commActualThreshold = this.settings.sqsThresholdS * this.settings.sqsCommThresholdFactor;
    if (this.state.energyWaveValue > commActualThreshold && this.state.phaseWaveValue > commActualThreshold) {
      const valER = parseFloat(this.state.energyWaveValue.toFixed(this.settings.sqsCommDecimalPrecision));
      const valPR = parseFloat(this.state.phaseWaveValue.toFixed(this.settings.sqsCommDecimalPrecision));
      if (Math.abs(valER - valPR) < Math.pow(10, -(this.settings.sqsCommDecimalPrecision + 1))) {
        return true;
      }
    }
    return false;
  }

  public getLastGlobalKnotInfo(): GlobalKnotInfo | null {
    return this.state.knotHistory.length > 0 ? this.state.knotHistory[this.state.knotHistory.length - 1] : null;
  }
}


export class Simulation {
  public state: SimulationState;
  private sqs: SubQuantumSystem;
  private settings: SimulationSettings;

  constructor(settings: SimulationSettings) {
    this.settings = settings;
    this.sqs = new SubQuantumSystem(this.settings);
    this.state = this.getInitialState();
  }

  private getInitialState(): SimulationState {
    const grid: GridCell[][] = Array(this.settings.gridRows).fill(null).map(() =>
      Array(this.settings.gridCols).fill(null).map(() => ({ type: ResourceType.EMPTY }))
    );

    const numObstacles = Math.floor(this.settings.gridRows * this.settings.gridCols * this.settings.obstacleDensity);
    for (let i = 0; i < numObstacles; i++) {
      const r = Math.floor(Math.random() * this.settings.gridRows);
      const c = Math.floor(Math.random() * this.settings.gridCols);
      if (grid[r][c].type === ResourceType.EMPTY) {
        grid[r][c].type = ResourceType.OBSTACLE;
      }
    }
    
    Object.entries(RESOURCE_CONFIG).forEach(([resTypeStr, density]) => {
        const resType = parseInt(resTypeStr) as ResourceType;
        if (isNaN(resType) || density === undefined) return;
        const numToPlace = Math.floor(this.settings.gridRows * this.settings.gridCols * density);
        for (let i = 0; i < numToPlace; i++) {
            const r = Math.floor(Math.random() * this.settings.gridRows);
            const c = Math.floor(Math.random() * this.settings.gridCols);
            if (grid[r][c].type === ResourceType.EMPTY) {
                grid[r][c].type = resType;
            }
        }
    });

    grid[CHARGING_STATION_POSITION.r][CHARGING_STATION_POSITION.c] = { type: ResourceType.CHARGING_STATION, isBoosted: false };

    const agents: Agent[] = [];
    const occupiedStarts = new Set<string>();
    occupiedStarts.add(`${CHARGING_STATION_POSITION.r},${CHARGING_STATION_POSITION.c}`);

    for (let i = 0; i < this.settings.numAgents; i++) {
      let r: number, c: number;
      do {
        r = Math.floor(Math.random() * this.settings.gridRows);
        c = Math.floor(Math.random() * this.settings.gridCols);
      } while (r < 0 || r >= this.settings.gridRows || c < 0 || c >= this.settings.gridCols || grid[r][c].type === ResourceType.OBSTACLE || occupiedStarts.has(`${r},${c}`));
      occupiedStarts.add(`${r},${c}`);
      agents.push({
        id: i,
        position: { r, c },
        color: AGENT_COLORS[i % AGENT_COLORS.length],
        energy: this.settings.initialEnergy,
        inventory: {
            [ResourceType.ORE]: 0, [ResourceType.TREE]: 0, [ResourceType.WATER]: 0,
            [ResourceType.PLANT]: 0, [ResourceType.NEW_RESOURCE]: 0,
            [ResourceType.EMPTY]:0, [ResourceType.OBSTACLE]:0, [ResourceType.GOAL]:0, [ResourceType.CHARGING_STATION]:0
        },
        speed: this.settings.agentBaseSpeed,
        carryCapacity: this.settings.agentBaseCarryCapacity,
      });
    }
    
    this.sqs.update(0);

    return {
      grid,
      agents,
      sqsState: this.sqs.state,
      activeSQKEffect: null,
      step: 0,
      simulationTime: 0,
      settings: this.settings, // Store current settings in state
    };
  }

  // Reset is handled by creating a new Simulation instance in App.tsx

  private async applySQKEffect(knotInfo: GlobalKnotInfo | null): Promise<void> {
    if (this.state.activeSQKEffect || !knotInfo) return; 

    const possibleEffects: SQKEffectType[] = [SQKEffectType.RESOURCE_BOOST, SQKEffectType.AGENT_SPEED_BOOST, SQKEffectType.GOAL_REVEAL];
    const effectType = possibleEffects[Math.floor(Math.random() * possibleEffects.length)];
    const duration = Math.floor(Math.random() * (this.settings.sqkEffectBaseDurationMax - this.settings.sqkEffectBaseDurationMin + 1)) + this.settings.sqkEffectBaseDurationMin;
    
    let newEffect: SQKEffect = { type: effectType, duration, details: {} };

    if (effectType === SQKEffectType.RESOURCE_BOOST) {
      const numBoosted = Math.floor(Math.random() * (this.settings.gridCols / 4)) + (this.settings.gridCols / 5);
      const boostedCells: { r: number; c: number }[] = [];
      for (let i = 0; i < numBoosted && boostedCells.length < numBoosted; i++) {
          let attempts = 0;
          while (attempts < 10) {
            const r = Math.floor(Math.random() * this.settings.gridRows);
            const c = Math.floor(Math.random() * this.settings.gridCols);
            if (this.state.grid[r][c].type !== ResourceType.EMPTY && this.state.grid[r][c].type !== ResourceType.OBSTACLE && this.state.grid[r][c].type !== ResourceType.CHARGING_STATION) {
                boostedCells.push({ r, c });
                if(this.state.grid[r][c]) this.state.grid[r][c].isBoosted = true;
                break;
            }
            attempts++;
          }
      }
      newEffect.details = { boostedCells };

    } else if (effectType === SQKEffectType.AGENT_SPEED_BOOST) {
      const targetAgentId = Math.random() < 0.3 ? "all" : Math.floor(Math.random() * this.state.agents.length);
      const speedMultiplier = parseFloat((Math.random() * (this.settings.sqkSpeedBoostMultiplierMax - this.settings.sqkSpeedBoostMultiplierMin) + this.settings.sqkSpeedBoostMultiplierMin).toFixed(1));
      newEffect.details = { targetAgentId, speedMultiplier };
    }

    const narrative = await generateSQKEffectNarrative(newEffect);
    newEffect.description = narrative || `Event: ${effectType}`;
    this.state.activeSQKEffect = newEffect;
  }

  private decaySQKEffect(): void {
    if (this.state.activeSQKEffect) {
      this.state.activeSQKEffect.duration--;
      if (this.state.activeSQKEffect.duration <= 0) {
        if (this.state.activeSQKEffect.type === SQKEffectType.RESOURCE_BOOST && this.state.activeSQKEffect.details?.boostedCells) {
            this.state.activeSQKEffect.details.boostedCells.forEach(bc => {
                if(this.state.grid[bc.r]?.[bc.c]) this.state.grid[bc.r][bc.c].isBoosted = false;
            });
        }
        this.state.activeSQKEffect = null;
      }
    }
  }

  private getValidMoves(agentR: number, agentC: number, grid: GridCell[][]): AgentAction[] {
    const validActions: AgentAction[] = [];
    const potentialMoves: {action: AgentAction, dr: number, dc: number}[] = [
        {action: "NORTH", dr: -1, dc: 0}, {action: "SOUTH", dr: 1, dc: 0},
        {action: "WEST", dr: 0, dc: -1}, {action: "EAST", dr: 0, dc: 1}
    ];

    for (const move of potentialMoves) {
        const nextR = agentR + move.dr;
        const nextC = agentC + move.dc;
        if (nextR >= 0 && nextR < this.settings.gridRows && nextC >= 0 && nextC < this.settings.gridCols &&
            grid[nextR][nextC].type !== ResourceType.OBSTACLE) {
            validActions.push(move.action);
        }
    }
    return validActions;
  }


  private chooseActionForAgent(agent: Agent, grid: GridCell[][]): AgentAction {
    const lowEnergyActualThreshold = typeof this.settings.lowEnergyThreshold === 'number' 
        ? this.settings.lowEnergyThreshold 
        : this.settings.initialEnergy * this.settings.lowEnergyThreshold;

    if (agent.energy <= lowEnergyActualThreshold) {
        const { r: stationR, c: stationC } = CHARGING_STATION_POSITION;
        const { r: agentR, c: agentC } = agent.position;

        if (agentR === stationR && agentC === stationC) {
            return "CHARGE";
        }

        let preferredMove: AgentAction | null = null;
        let nextR = agentR;
        let nextC = agentC;

        const deltaR = stationR - agentR;
        const deltaC = stationC - agentC;
        
        const primaryVertical = Math.abs(deltaR) >= Math.abs(deltaC);

        if (primaryVertical && deltaR !== 0) {
            preferredMove = deltaR > 0 ? "SOUTH" : "NORTH";
            nextR = agentR + (deltaR > 0 ? 1 : -1);
            nextC = agentC;
        } else if (!primaryVertical && deltaC !== 0) {
            preferredMove = deltaC > 0 ? "EAST" : "WEST";
            nextC = agentC + (deltaC > 0 ? 1 : -1);
            nextR = agentR;
        } else if (deltaR !== 0) { 
             preferredMove = deltaR > 0 ? "SOUTH" : "NORTH";
            nextR = agentR + (deltaR > 0 ? 1 : -1);
            nextC = agentC;
        } else if (deltaC !== 0) { 
            preferredMove = deltaC > 0 ? "EAST" : "WEST";
            nextC = agentC + (deltaC > 0 ? 1 : -1);
            nextR = agentR;
        }

        if (preferredMove) {
            const clampedNextR = Math.max(0, Math.min(this.settings.gridRows - 1, nextR));
            const clampedNextC = Math.max(0, Math.min(this.settings.gridCols - 1, nextC));
            if (grid[clampedNextR]?.[clampedNextC]?.type !== ResourceType.OBSTACLE || (clampedNextR === agentR && clampedNextC === agentC) ) {
                return preferredMove;
            }
        }
        
        const validMoves = this.getValidMoves(agentR, agentC, grid);
        if (validMoves.length > 0) {
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        }
        return "IDLE"; 

    } else { 
        const currentCell = grid[agent.position.r][agent.position.c];
        const canCollect = currentCell.type !== ResourceType.EMPTY &&
                           currentCell.type !== ResourceType.OBSTACLE &&
                           currentCell.type !== ResourceType.CHARGING_STATION &&
                           agent.inventory[currentCell.type] < agent.carryCapacity;

        if (canCollect && Math.random() < 0.6) return "COLLECT";
        if (Math.random() < 0.15) return "IDLE";

        const validMoves = this.getValidMoves(agent.position.r, agent.position.c, grid);
        if (validMoves.length > 0) {
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        }
        return "IDLE";
    }
}


  public async step(): Promise<void> {
    const globalKnotDetected = this.sqs.update(this.state.simulationTime);
    if (globalKnotDetected) {
      await this.applySQKEffect(this.sqs.getLastGlobalKnotInfo());
    }
    this.decaySQKEffect();

    const agentActions: AgentAction[] = [];
    for (const agent of this.state.agents) {
        if (agent.energy > 0) {
            agentActions.push(this.chooseActionForAgent(agent, this.state.grid));
        } else {
            agentActions.push("IDLE"); 
        }
    }
    
    this.state.agents.forEach((agent, i) => {
      if (agent.energy <= 0 && agentActions[i] !== "CHARGE") { 
          agent.energy = 0; 
          return;
      }

      const action = agentActions[i];
      const { r: oldR, c: oldC } = agent.position;
      let newR = oldR;
      let newC = oldC;

      let currentSpeed = agent.speed; // Base speed from agent object (set during init from settings)
      if (this.state.activeSQKEffect?.type === SQKEffectType.AGENT_SPEED_BOOST) {
        const effectDetails = this.state.activeSQKEffect.details;
        if (effectDetails && (effectDetails.targetAgentId === "all" || effectDetails.targetAgentId === agent.id)) {
          currentSpeed = Math.floor(this.settings.agentBaseSpeed * (effectDetails.speedMultiplier || 1));
        }
      }
      currentSpeed = Math.max(1, currentSpeed);

      if (action === "CHARGE") {
        if (agent.position.r === CHARGING_STATION_POSITION.r && agent.position.c === CHARGING_STATION_POSITION.c) {
          agent.energy = Math.min(this.settings.initialEnergy, agent.energy + this.settings.chargingStationRechargePerStep);
        }
      } else if (action === "COLLECT") {
        const resourceHere = this.state.grid[oldR][oldC].type;
        if (resourceHere !== ResourceType.EMPTY && resourceHere !== ResourceType.OBSTACLE && resourceHere !== ResourceType.CHARGING_STATION) {
          if (agent.inventory[resourceHere] < agent.carryCapacity) { // Carry capacity from agent object
            agent.inventory[resourceHere]++;
            let energyGain = resourceHere === ResourceType.PLANT ? this.settings.resourceRechargeAmount * this.settings.plantRechargeMultiplier : this.settings.resourceRechargeAmount;
            if (this.state.grid[oldR][oldC].isBoosted) {
                 energyGain += this.settings.resourceRechargeAmount; // Bonus for boosted
            }
            agent.energy = Math.min(this.settings.initialEnergy, agent.energy + energyGain);
            this.state.grid[oldR][oldC].type = ResourceType.EMPTY; 
            this.state.grid[oldR][oldC].isBoosted = false;
          }
        }
      } else if (action === "NORTH") newR = Math.max(0, oldR - currentSpeed);
      else if (action === "SOUTH") newR = Math.min(this.settings.gridRows - 1, oldR + currentSpeed);
      else if (action === "WEST") newC = Math.max(0, oldC - currentSpeed);
      else if (action === "EAST") newC = Math.min(this.settings.gridCols - 1, oldC + currentSpeed);

      if (action === "NORTH" || action === "SOUTH" || action === "WEST" || action === "EAST") {
        if (this.state.grid[newR]?.[newC]?.type !== ResourceType.OBSTACLE) {
          agent.position = { r: newR, c: newC };
        }
      }
      
      if (!(action === "CHARGE" && this.settings.chargingStationRechargePerStep > this.settings.energyDepletionRate)) {
          agent.energy -= this.settings.energyDepletionRate;
      }

      if (agent.energy < 0) agent.energy = 0; 

      agent.position.r = Math.max(0, Math.min(this.settings.gridRows - 1, agent.position.r));
      agent.position.c = Math.max(0, Math.min(this.settings.gridCols - 1, agent.position.c));
    });

    if (Math.random() < this.settings.resourceRespawnRate * this.settings.gridRows * this.settings.gridCols * 0.1) { 
        const occupiedByAgents = new Set(this.state.agents.map(a => `${a.position.r},${a.position.c}`));
        const cellToRespawn = getRandomEmptyCell(this.state.grid, occupiedByAgents, this.settings);
        if (cellToRespawn) {
            const resourceTypes = Object.keys(RESOURCE_CONFIG).map(Number) as ResourceType[];
            if (resourceTypes.length > 0) {
                 this.state.grid[cellToRespawn.r][cellToRespawn.c].type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
            }
        }
    }
    
    this.state.step++;
    this.state.simulationTime++;
  }
}