'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGraphingEngine } from '@/stores/useGraphingEngine';

export function FunctionInput() {
	const [expression, setExpression] = useState('');
	const { addFunction } = useGraphingEngine();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (expression.trim()) {
			addFunction(expression.trim());
			setExpression('');
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<Input
				value={expression}
				onChange={(e) => setExpression(e.target.value)}
				placeholder="y = ax² + bx + c"
				className="font-mono"
			/>
			<Button type="submit" variant="secondary">
				Add
			</Button>
		</form>
	);
}
