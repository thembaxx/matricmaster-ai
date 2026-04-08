'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
	Background,
	BackgroundVariant,
	Controls,
	type Edge,
	MiniMap,
	type Node,
	type NodeMouseHandler,
	type NodeTypes,
	useEdgesState,
	useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getPrerequisites, TOPIC_PREREQUISITES } from '@/services/topicPrerequisites';
import { MapNode } from './MapNode';
import type { MapNodeData, MasteryState, SubjectMapProps } from './types';

const nodeTypes: NodeTypes = {
	mapNode: MapNode,
};

const SUBJECT_COLORS: Record<string, string> = {
	Mathematics: '#6366f1',
	'Physical Sciences': '#f59e0b',
	'Life Sciences': '#10b981',
};

function buildGraphData(
	masteryOverride: Record<string, MasteryState> | undefined,
	filterSubject: string | undefined
) {
	const nodes: Node<MapNodeData>[] = [];
	const edges: Edge[] = [];
	const masteryMap = masteryOverride || {};

	const entries = Object.entries(TOPIC_PREREQUISITES).filter(
		([, data]) => !filterSubject || data.subject === filterSubject
	);

	const topicKeys = new Set(entries.map(([key]) => key));
	const topicPositions: Record<string, { x: number; y: number }> = {};

	const subjectGroups: Record<string, string[]> = {};
	for (const [key, data] of entries) {
		if (!subjectGroups[data.subject]) subjectGroups[data.subject] = [];
		subjectGroups[data.subject].push(key);
	}

	let globalY = 0;
	for (const [subject, topics] of Object.entries(subjectGroups)) {
		const subjectX = Object.keys(subjectGroups).indexOf(subject) * 400;
		let localY = 0;

		const sorted = [...topics].sort((a, b) => {
			const aPrereqs = TOPIC_PREREQUISITES[a]?.prerequisites.length || 0;
			const bPrereqs = TOPIC_PREREQUISITES[b]?.prerequisites.length || 0;
			return aPrereqs - bPrereqs;
		});

		for (const topic of sorted) {
			topicPositions[topic] = { x: subjectX + Math.random() * 60 - 30, y: localY };
			localY += 120;
		}
		globalY = Math.max(globalY, localY);
	}

	for (const [key, data] of entries) {
		const prereq = getPrerequisites(key);
		const mastery: MasteryState = masteryMap[key.toLowerCase()] || 'unknown';

		const prerequisitesMet = (prereq?.prerequisites || []).every(
			(p) => topicKeys.has(p) && masteryMap[p.toLowerCase()] === 'mastered'
		);

		const isLocked = (prereq?.prerequisites || []).length > 0 && !prerequisitesMet;

		const pos = topicPositions[key] || { x: 0, y: 0 };

		nodes.push({
			id: key,
			type: 'mapNode',
			position: pos,
			data: {
				topic: key,
				subject: data.subject,
				mastery,
				isLocked,
				estimatedHours: data.estimatedHoursToMaster,
				prerequisites: data.prerequisites,
			},
		});

		for (const prereqTopic of data.prerequisites) {
			if (topicKeys.has(prereqTopic)) {
				edges.push({
					id: `${prereqTopic}-${key}`,
					source: prereqTopic,
					target: key,
					animated: !isLocked,
					style: {
						stroke: isLocked ? '#555' : SUBJECT_COLORS[data.subject] || '#888',
						strokeWidth: isLocked ? 1 : 2,
						opacity: isLocked ? 0.3 : 0.6,
					},
				});
			}
		}
	}

	return { nodes, edges };
}

export function SubjectMap({ onNodeClick, masteryOverride, filterSubject }: SubjectMapProps) {
	const { nodes: initialNodes, edges: initialEdges } = useMemo(
		() => buildGraphData(masteryOverride, filterSubject),
		[masteryOverride, filterSubject]
	);

	const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, _setEdges, onEdgesChange] = useEdgesState(initialEdges);

	const handleNodeClick: NodeMouseHandler = useCallback(
		(_event, node) => {
			if ((node.data as any).isLocked) return;
			onNodeClick?.((node.data as any).topic, (node.data as any).subject);
		},
		[onNodeClick]
	);

	return (
		<div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-border/30 bg-background">
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onNodeClick={handleNodeClick}
				nodeTypes={nodeTypes}
				fitView
				fitViewOptions={{ padding: 0.3 }}
				minZoom={0.3}
				maxZoom={2}
				proOptions={{ hideAttribution: true }}
			>
				<Background
					variant={BackgroundVariant.Dots}
					gap={20}
					size={1}
					color="var(--muted-foreground)"
				/>
				<Controls
					showInteractive={false}
					className="!bg-card !border-border/30 !rounded-xl !shadow-lg"
				/>
				<MiniMap
					nodeColor={(node) => {
						const data = node.data as MapNodeData;
						if (data?.isLocked) return '#555';
						return SUBJECT_COLORS[data?.subject] || '#888';
					}}
					maskColor="rgba(0,0,0,0.6)"
					className="!bg-card !border-border/30 !rounded-xl"
				/>
			</ReactFlow>
		</div>
	);
}
