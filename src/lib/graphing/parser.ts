import { evaluate, parse } from 'mathjs';

const BUILT_IN = ['x', 'y', 'f', 'sin', 'cos', 'tan', 'log', 'ln', 'e', 'exp', 'sqrt', 'abs', 'pi'];

export function parseExpression(expression: string): {
	params: string[];
} {
	const normalized = expression.toLowerCase().replace(/y\s*=\s*/i, '');
	const node = parse(normalized);

	const params: string[] = [];
	node.traverse((n: unknown) => {
		const symbolNode = n as { type?: string; name?: string };
		if (
			symbolNode.type === 'SymbolNode' &&
			symbolNode.name &&
			!BUILT_IN.includes(symbolNode.name) &&
			!params.includes(symbolNode.name)
		) {
			params.push(symbolNode.name);
		}
	});

	return { params };
}

export function evaluateExpression(
	expression: string,
	x: number,
	params: Record<string, number> = {}
): number {
	const normalized = expression.toLowerCase().replace(/y\s*=\s*/i, '');
	try {
		return evaluate(normalized, { x, ...params }) as number;
	} catch {
		return Number.NaN;
	}
}

export function getParameters(expression: string): string[] {
	const { params } = parseExpression(expression);
	return params;
}
