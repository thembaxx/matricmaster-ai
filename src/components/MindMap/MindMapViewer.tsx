'use client';

import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface MindMapNode {
	id: string;
	label: string;
	children?: MindMapNode[];
}

const mathMindMap: MindMapNode = {
	id: 'math',
	label: 'Mathematics',
	children: [
		{
			id: 'algebra',
			label: 'Algebra',
			children: [
				{ id: 'eq', label: 'Equations' },
				{ id: 'ineq', label: 'Inequalities' },
				{ id: 'expo', label: 'Exponents' },
				{ id: 'logs', label: 'Logarithms' },
			],
		},
		{
			id: 'geometry',
			label: 'Geometry',
			children: [
				{ id: 'triangles', label: 'Triangles' },
				{ id: 'circles', label: 'Circles' },
				{ id: 'quads', label: 'Quadrilaterals' },
				{ id: '3d', label: '3D Shapes' },
			],
		},
		{
			id: 'trig',
			label: 'Trigonometry',
			children: [
				{ id: 'ratios', label: 'Ratios' },
				{ id: 'identities', label: 'Identities' },
				{ id: 'laws', label: 'Laws' },
				{ id: 'graphs', label: 'Graphs' },
			],
		},
		{
			id: 'calculus',
			label: 'Calculus',
			children: [
				{ id: 'limits', label: 'Limits' },
				{ id: 'diff', label: 'Differentiation' },
				{ id: 'int', label: 'Integration' },
			],
		},
		{
			id: 'stats',
			label: 'Statistics',
			children: [
				{ id: 'data', label: 'Data Handling' },
				{ id: 'prob', label: 'Probability' },
				{ id: 'dist', label: 'Distributions' },
			],
		},
	],
};

const physicsMindMap: MindMapNode = {
	id: 'physics',
	label: 'Physical Sciences',
	children: [
		{
			id: 'mechanics',
			label: 'Mechanics',
			children: [
				{ id: 'kin', label: 'Kinematics' },
				{ id: 'dyn', label: 'Dynamics' },
				{ id: 'work', label: 'Work & Energy' },
				{ id: 'mom', label: 'Momentum' },
			],
		},
		{
			id: 'waves',
			label: 'Waves & Sound',
			children: [
				{ id: 'prop', label: 'Properties' },
				{ id: 'sound', label: 'Sound' },
				{ id: 'light', label: 'Light' },
				{ id: 'doppler', label: 'Doppler' },
			],
		},
		{
			id: 'electricity',
			label: 'Electricity',
			children: [
				{ id: 'circuits', label: 'Circuits' },
				{ id: 'electro', label: 'Electrostatics' },
				{ id: 'magnetism', label: 'Magnetism' },
				{ id: 'induction', label: 'Electromagnetic Induction' },
			],
		},
		{
			id: 'matter',
			label: 'Matter',
			children: [
				{ id: 'particles', label: 'Particles' },
				{ id: 'thermal', label: 'Thermal' },
				{ id: ' gases', label: 'Gases' },
			],
		},
	],
};

const chemistryMindMap: MindMapNode = {
	id: 'chemistry',
	label: 'Chemistry',
	children: [
		{
			id: 'matter',
			label: 'Matter',
			children: [
				{ id: 'atomic', label: 'Atomic Structure' },
				{ id: 'periodic', label: 'Periodic Table' },
				{ id: 'bonding', label: 'Chemical Bonding' },
			],
		},
		{
			id: 'reactions',
			label: 'Reactions',
			children: [
				{ id: 'types', label: 'Reaction Types' },
				{ id: 'redox', label: 'Redox' },
				{ id: 'acidbase', label: 'Acids & Bases' },
			],
		},
		{
			id: 'quant',
			label: 'Quantitative',
			children: [
				{ id: 'moles', label: 'Moles & Mass' },
				{ id: 'conc', label: 'Concentration' },
				{ id: 'stoich', label: 'Stoichiometry' },
			],
		},
		{
			id: 'organic',
			label: 'Organic Chemistry',
			children: [
				{ id: 'hydrocarbons', label: 'Hydrocarbons' },
				{ id: 'functional', label: 'Functional Groups' },
				{ id: 'polymers', label: 'Polymers' },
			],
		},
	],
};

interface NodePosition {
	x: number;
	y: number;
}

function calculateNodePositions(
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

function MindMapSVG({
	data,
	selectedNode,
	onNodeClick,
}: {
	data: MindMapNode;
	selectedNode: string | null;
	onNodeClick: (nodeId: string) => void;
}) {
	const [positions] = useState(() => {
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
	});

	const renderConnections = (node: MindMapNode, depth = 0) => {
		const lines: React.ReactNode[] = [];
		const parentPos = positions.get(node.id);

		if (node.children && parentPos) {
			node.children.forEach((child) => {
				const childPos = positions.get(child.id);
				if (childPos) {
					lines.push(
						<line
							key={`${node.id}-${child.id}`}
							x1={parentPos.x}
							y1={parentPos.y}
							x2={childPos.x}
							y2={childPos.y}
							stroke="currentColor"
							strokeWidth={depth === 0 ? 3 : 2}
							className="text-muted-foreground/30"
						/>
					);
					lines.push(...renderConnections(child, depth + 1));
				}
			});
		}

		return lines;
	};

	const renderNodes = (node: MindMapNode, depth = 0) => {
		const nodes: React.ReactNode[] = [];
		const pos = positions.get(node.id);
		const isSelected = selectedNode === node.id;
		const isRoot = depth === 0;

		if (pos) {
			nodes.push(
				<g
					key={node.id}
					role="button"
					tabIndex={0}
					onClick={() => onNodeClick(node.id)}
					onKeyDown={(e) => e.key === 'Enter' && onNodeClick(node.id)}
					className="cursor-pointer"
				>
					<circle
						cx={pos.x}
						cy={pos.y}
						r={isRoot ? 35 : isSelected ? 28 : 22}
						fill={isRoot ? 'var(--primary)' : isSelected ? 'var(--primary)' : 'var(--card)'}
						stroke={isSelected ? 'var(--primary)' : 'var(--border)'}
						strokeWidth={isSelected ? 3 : 2}
					/>
					<text
						x={pos.x}
						y={pos.y}
						textAnchor="middle"
						dominantBaseline="middle"
						fill={isRoot || isSelected ? 'var(--card-foreground)' : 'var(--foreground)'}
						fontSize={isRoot ? 12 : 10}
						fontWeight={isRoot ? 'bold' : 'medium'}
						className="pointer-events-none"
					>
						{node.label.length > 12 ? `${node.label.slice(0, 10)}...` : node.label}
					</text>
				</g>
			);
		}

		if (node.children) {
			node.children.forEach((child) => {
				nodes.push(...renderNodes(child, depth + 1));
			});
		}

		return nodes;
	};

	return (
		<svg
			viewBox="0 0 600 500"
			className="w-full h-full min-h-[400px]"
			role="img"
			aria-label={`${data.label} mind map`}
		>
			{renderConnections(data)}
			{renderNodes(data)}
		</svg>
	);
}

export function MindMapViewer() {
	const [selectedSubject, setSelectedSubject] = useState<string>('math');
	const [selectedNode, setSelectedNode] = useState<string | null>(null);

	const mindMaps: Record<string, MindMapNode> = {
		math: mathMindMap,
		physics: physicsMindMap,
		chemistry: chemistryMindMap,
	};

	const subjectLabels: Record<string, string> = {
		math: 'Mathematics',
		physics: 'Physical Sciences',
		chemistry: 'Chemistry',
	};

	const currentMap = mindMaps[selectedSubject];

	const getNodePath = (nodeId: string, node: MindMapNode, path: string[] = []): string[] | null => {
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
	};

	const nodePath = selectedNode ? getNodePath(selectedNode, currentMap) : null;

	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				{Object.entries(subjectLabels).map(([key, label]) => (
					<Button
						type="button"
						variant="ghost"
						key={key}
						onClick={() => {
							setSelectedSubject(key);
							setSelectedNode(null);
						}}
						className={`px-3 py-1.5 h-auto rounded-lg text-sm font-medium ${
							selectedSubject === key
								? 'bg-primary text-primary-foreground'
								: 'bg-muted hover:bg-muted/80'
						}`}
					>
						{label}
					</Button>
				))}
			</div>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-base">{subjectLabels[selectedSubject]} Mind Map</CardTitle>
				</CardHeader>
				<CardContent>
					<ScrollArea className="h-[420px]">
						<MindMapSVG
							data={currentMap}
							selectedNode={selectedNode}
							onNodeClick={setSelectedNode}
						/>
					</ScrollArea>
				</CardContent>
			</Card>

			{nodePath && (
				<Card className="bg-muted/50">
					<CardContent className="py-3">
						<p className="text-sm">
							<span className="text-muted-foreground">Path: </span>
							<span className="font-medium">{nodePath.join(' → ')}</span>
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
