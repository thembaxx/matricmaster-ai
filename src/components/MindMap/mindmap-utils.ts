import type { MindMapNode } from '@/data/mindmaps';

export interface NodePosition {
	x: number;
	y: number;
}

export function calculateNodePositions(
	node: MindMapNode,
	depth: number,
	angle: number,
	spread: number,
	positions: Map<string, NodePosition>
): void {
	const radius = 120 + depth * 100;
	const x = 300 + radius * Math.cos(angle);
	const y = 250 + radius * Math.sin(angle);

	positions.set(node.id, { x, y });

	if (node.children) {
		const childCount = node.children.length;
		const childSpread = spread / (depth + 1);
		const startAngle = angle - spread / 2;
		const angleStep = spread / Math.max(childCount - 1, 1);

		node.children.forEach((child, index) => {
			const childAngle = childCount === 1 ? angle : startAngle + index * angleStep;
			calculateNodePositions(child, depth + 1, childAngle, childSpread, positions);
		});
	}
}

export function initializePositions(data: MindMapNode): Map<string, NodePosition> {
	const pos = new Map<string, NodePosition>();
	pos.set(data.id, { x: 300, y: 250 });
	if (data.children) {
		const childCount = data.children.length;
		const angleStep = (2 * Math.PI) / childCount;
		data.children.forEach((child, index) => {
			calculateNodePositions(child, 0, index * angleStep - Math.PI / 2, Math.PI * 0.8, pos);
		});
	}
	return pos;
}

export function getNodePath(
	nodeId: string,
	node: MindMapNode,
	path: string[] = []
): string[] | null {
	if (node.id === nodeId) {
		return [...path, node.label];
	}
	if (node.children) {
		for (const child of node.children) {
			const result = getNodePath(nodeId, child, [...path, node.label]);
			if (result) return result;
		}
	}
	return null;
}
