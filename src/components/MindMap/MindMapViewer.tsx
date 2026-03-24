'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MindMapSubjectSelector } from './MindMapSubjectSelector';
import { MindMapSVG } from './MindMapSVG';
import { mindMaps, subjectLabels } from './mindmap-data';
import { getNodePath } from './mindmap-utils';
import { NodePathDisplay } from './NodePathDisplay';

export function MindMapViewer() {
	const [selectedSubject, setSelectedSubject] = useState<string>('math');
	const [selectedNode, setSelectedNode] = useState<string | null>(null);

	const currentMap = mindMaps[selectedSubject];
	const nodePath = selectedNode ? getNodePath(selectedNode, currentMap) : null;

	const handleSubjectChange = (subject: string) => {
		setSelectedSubject(subject);
		setSelectedNode(null);
	};

	return (
		<div className="space-y-4">
			<MindMapSubjectSelector
				selectedSubject={selectedSubject}
				onSubjectChange={handleSubjectChange}
			/>

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

			{nodePath && <NodePathDisplay path={nodePath} />}
		</div>
	);
}
