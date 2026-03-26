'use client';

import type React from 'react';
import { useState } from 'react';
import type { MindMapNode } from '@/content/mindmaps';
import { initializePositions, type NodePosition } from './mindmap-utils';

interface MindMapSVGProps {
	data: MindMapNode;
	selectedNode: string | null;
	onNodeClick: (nodeId: string) => void;
}

export function MindMapSVG({ data, selectedNode, onNodeClick }: MindMapSVGProps) {
	const [positions] = useState<Map<string, NodePosition>>(() => initializePositions(data));

	const renderConnections = (node: MindMapNode, depth = 0): React.ReactNode[] => {
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

	const renderNodes = (node: MindMapNode, depth = 0): React.ReactNode[] => {
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
