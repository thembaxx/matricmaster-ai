export interface PhysicalConstant {
	value: number;
	unit: string;
	symbol: string;
}

export const PHYSICAL_CONSTANTS: Record<string, PhysicalConstant> = {
	speedOfLight: { value: 3e8, unit: 'm/s', symbol: 'c' },
	gravitationalAcceleration: { value: 9.8, unit: 'm/s²', symbol: 'g' },
	planckConstant: { value: 6.626e-34, unit: 'J·s', symbol: 'h' },
	elementaryCharge: { value: 1.602e-19, unit: 'C', symbol: 'e' },
	avogadroConstant: { value: 6.022e23, unit: 'mol⁻¹', symbol: 'NA' },
	universalGasConstant: { value: 8.314, unit: 'J/(mol·K)', symbol: 'R' },
	boltzmannConstant: { value: 1.381e-23, unit: 'J/K', symbol: 'k' },
	stefanBoltzmann: { value: 5.67e-8, unit: 'W/(m²·K⁴)', symbol: 'σ' },
};

export const COMMON_ELEMENTS: Record<string, { name: string; atomicMass: number }> = {
	H: { name: 'Hydrogen', atomicMass: 1.008 },
	O: { name: 'Oxygen', atomicMass: 15.999 },
	C: { name: 'Carbon', atomicMass: 12.011 },
	N: { name: 'Nitrogen', atomicMass: 14.007 },
	Fe: { name: 'Iron', atomicMass: 55.845 },
	Na: { name: 'Sodium', atomicMass: 22.99 },
	Cl: { name: 'Chlorine', atomicMass: 35.453 },
	K: { name: 'Potassium', atomicMass: 39.098 },
	Ca: { name: 'Calcium', atomicMass: 40.078 },
	Mg: { name: 'Magnesium', atomicMass: 24.305 },
	S: { name: 'Sulfur', atomicMass: 32.065 },
	P: { name: 'Phosphorus', atomicMass: 30.974 },
	Cu: { name: 'Copper', atomicMass: 63.546 },
	Zn: { name: 'Zinc', atomicMass: 65.38 },
	Ag: { name: 'Silver', atomicMass: 107.87 },
	Au: { name: 'Gold', atomicMass: 196.97 },
};

export function formatConstant(name: string): string {
	const constant = PHYSICAL_CONSTANTS[name];
	if (!constant) return name;
	return `${constant.symbol} = ${constant.value.toExponential(3)} ${constant.unit}`;
}

export function getElementInfo(symbol: string) {
	return COMMON_ELEMENTS[symbol] || null;
}
