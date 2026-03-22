'use client';

import { cn } from '@/lib/utils';
import {
	CircleDiagram,
	CircuitDiagram,
	DNADiagram,
	ForceDiagram,
	ParabolaDiagram,
	ProjectileDiagram,
	PunnettSquareDiagram,
	SynopticDiagram,
	TriangleDiagram,
	VectorDiagram,
	WaveDiagram,
} from './diagrams';

interface InteractiveDiagramProps {
	type: string;
	className?: string;
}

export function InteractiveDiagram({ type, className }: InteractiveDiagramProps) {
	const typeLower = type.toLowerCase();

	if (
		typeLower.includes('triangle') ||
		typeLower.includes('trigonometry') ||
		typeLower.includes('sine rule') ||
		typeLower.includes('cosine rule')
	) {
		return <TriangleDiagram className={className} />;
	}

	if (typeLower.includes('circle') || typeLower.includes('analytical geometry')) {
		return <CircleDiagram className={className} />;
	}

	if (
		typeLower.includes('vector') ||
		typeLower.includes('magnitude') ||
		typeLower.includes('angle between')
	) {
		return <VectorDiagram className={className} />;
	}

	if (typeLower.includes('projectile') || typeLower.includes('projectile motion')) {
		return <ProjectileDiagram className={className} />;
	}

	if (
		typeLower.includes('force') ||
		typeLower.includes('newton') ||
		typeLower.includes('free body') ||
		typeLower.includes("newton's second law")
	) {
		return <ForceDiagram className={className} />;
	}

	if (
		typeLower.includes('wave') ||
		typeLower.includes('transverse') ||
		typeLower.includes('longitudinal')
	) {
		return <WaveDiagram className={className} />;
	}

	if (typeLower.includes('parabola') || typeLower.includes('function')) {
		return <ParabolaDiagram className={className} />;
	}

	if (typeLower.includes('punnett') || typeLower.includes('genetic')) {
		return <PunnettSquareDiagram className={className} />;
	}

	if (typeLower.includes('circuit')) {
		return <CircuitDiagram className={className} />;
	}

	if (typeLower.includes('synoptic') || typeLower.includes('cyclone')) {
		return <SynopticDiagram className={className} />;
	}

	if (typeLower.includes('dna') || typeLower.includes('helix')) {
		return <DNADiagram className={className} />;
	}

	return <div className={cn('w-full aspect-video bg-secondary/30 rounded-xl', className)} />;
}
