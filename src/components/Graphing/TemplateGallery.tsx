'use client';

import { Button } from '@/components/ui/button';
import { useGraphingEngine } from '@/stores/useGraphingEngine';

const TEMPLATES = [
	{ label: 'Linear', expression: 'y = mx + c', params: { m: 1, c: 0 } },
	{ label: 'Quadratic', expression: 'y = ax² + bx + c', params: { a: 1, b: 0, c: 0 } },
	{ label: 'Cubic', expression: 'y = ax³ + bx² + cx + d', params: { a: 1, b: 0, c: 0, d: 0 } },
	{ label: 'Exponential', expression: 'y = a^x', params: { a: 2 } },
	{ label: 'Sine', expression: 'y = a sin(bx)', params: { a: 1, b: 1 } },
	{ label: 'Cosine', expression: 'y = a cos(bx)', params: { a: 1, b: 1 } },
	{ label: 'Hyperbola', expression: 'y = a/x', params: { a: 1 } },
];

export function TemplateGallery() {
	const { addFunction, setParam } = useGraphingEngine();

	const handleSelect = (template: (typeof TEMPLATES)[0]) => {
		addFunction(template.expression);
		Object.entries(template.params).forEach(([key, value]) => {
			setParam(key, value);
		});
	};

	return (
		<div className="grid grid-cols-2 gap-2">
			{TEMPLATES.map((t) => (
				<Button key={t.label} variant="outline" onClick={() => handleSelect(t)} className="text-xs">
					{t.label}
				</Button>
			))}
		</div>
	);
}
