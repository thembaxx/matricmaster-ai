'use client';

import { Cancel01Icon as CloseIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { useGraphingEngine } from '@/stores/useGraphingEngine';

export function FunctionList() {
	const { functions, removeFunction, toggleVisibility } = useGraphingEngine();

	if (functions.length === 0) {
		return <p className="text-sm text-muted-foreground">No functions added yet</p>;
	}

	return (
		<div className="space-y-2">
			{functions.map((fn) => (
				<div key={fn.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
					<button
						type="button"
						onClick={() => toggleVisibility(fn.id)}
						className="w-4 h-4 rounded-full border-2"
						style={{ backgroundColor: fn.visible ? fn.color : 'transparent' }}
					/>
					<span className="flex-1 font-mono text-sm">y = {fn.expression}</span>
					<Button variant="ghost" size="icon" onClick={() => removeFunction(fn.id)}>
						<HugeiconsIcon icon={CloseIcon} className="w-4 h-4" />
					</Button>
				</div>
			))}
		</div>
	);
}
