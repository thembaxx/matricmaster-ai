import { create } from 'zustand';

type SimulationType = 'circuits' | 'momentum' | 'waves';

interface CircuitState {
	voltage: number;
	resistors: { id: string; resistance: number; config: 'series' | 'parallel' }[];
}

interface MomentumState {
	mass1: number;
	mass2: number;
	velocity1: number;
	velocity2: number;
	collisionType: 'elastic' | 'inelastic';
	isPlaying: boolean;
}

interface WaveState {
	amplitude: number;
	frequency: number;
}

interface ScienceLabState {
	currentSimulation: SimulationType;
	circuit: CircuitState;
	momentum: MomentumState;
	wave: WaveState;

	setSimulation: (type: SimulationType) => void;
	setCircuit: (partial: Partial<CircuitState>) => void;
	setMomentum: (partial: Partial<MomentumState>) => void;
	setWave: (partial: Partial<WaveState>) => void;
	resetCircuit: () => void;
	resetMomentum: () => void;
	resetWave: () => void;
}

export const useScienceLab = create<ScienceLabState>((set) => ({
	currentSimulation: 'circuits',

	circuit: {
		voltage: 12,
		resistors: [
			{ id: 'r1', resistance: 4, config: 'series' },
			{ id: 'r2', resistance: 6, config: 'parallel' },
			{ id: 'r3', resistance: 3, config: 'series' },
		],
	},

	momentum: {
		mass1: 2,
		mass2: 2,
		velocity1: 5,
		velocity2: -3,
		collisionType: 'elastic',
		isPlaying: false,
	},

	wave: {
		amplitude: 1,
		frequency: 1,
	},

	setSimulation: (type) => set({ currentSimulation: type }),

	setCircuit: (partial) => set((state) => ({ circuit: { ...state.circuit, ...partial } })),

	setMomentum: (partial) => set((state) => ({ momentum: { ...state.momentum, ...partial } })),

	setWave: (partial) => set((state) => ({ wave: { ...state.wave, ...partial } })),

	resetCircuit: () =>
		set({
			circuit: {
				voltage: 12,
				resistors: [
					{ id: 'r1', resistance: 4, config: 'series' },
					{ id: 'r2', resistance: 6, config: 'parallel' },
					{ id: 'r3', resistance: 3, config: 'series' },
				],
			},
		}),

	resetMomentum: () =>
		set({
			momentum: {
				mass1: 2,
				mass2: 2,
				velocity1: 5,
				velocity2: -3,
				collisionType: 'elastic',
				isPlaying: false,
			},
		}),

	resetWave: () =>
		set({
			wave: {
				amplitude: 1,
				frequency: 1,
			},
		}),
}));
