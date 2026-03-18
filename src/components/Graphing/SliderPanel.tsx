'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { getParameters } from '@/lib/graphing/parser';
import { useGraphingEngine } from '@/stores/useGraphingEngine';

export function SliderPanel() {
	const { functions, params, setParam } = useGraphingEngine();

	// Extract unique parameters from all expressions
	const allParams = new Set<string>();
	functions.forEach((fn) => {
		getParameters(fn.expression).forEach((p) => {
			allParams.add(p);
		});
	});

	const paramKeys = Array.from(allParams);

	if (paramKeys.length === 0) {
		return <p className="text-sm text-muted-foreground">Add a function to see sliders</p>;
	}

	return (
		<div className="space-y-4">
			{paramKeys.map((key) => (
				<div key={key} className="space-y-2">
					<div className="flex justify-between">
						<Label>{key}</Label>
						<span className="font-mono text-sm">{params[key] ?? 1}</span>
					</div>
					<Slider
						value={[params[key] ?? 1]}
						onValueChange={([v]) => setParam(key, v)}
						min={-10}
						max={10}
						step={0.1}
					/>
				</div>
			))}
		</div>
	);
}
