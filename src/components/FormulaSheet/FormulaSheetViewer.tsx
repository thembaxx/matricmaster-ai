'use client';

import { CodeIcon, SearchIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	chemistryFormulas,
	type Formula,
	mathFormulas,
	physicsFormulas,
	type Topic,
} from '@/lib/formulas/data';

function FormulaCard({ formula }: { formula: Formula }) {
	const [copied, setCopied] = useState(false);

	const copyFormula = () => {
		navigator.clipboard.writeText(formula.formula);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
			<div className="flex items-start justify-between gap-2">
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-sm truncate">{formula.name}</h4>
					<div className="flex items-center gap-1.5 mt-1">
						<HugeiconsIcon icon={CodeIcon} className="w-3.5 h-3.5 text-primary flex-shrink-0" />
						<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono truncate">
							{formula.formula}
						</code>
					</div>
					<p className="text-xs text-muted-foreground mt-1 line-clamp-2">{formula.description}</p>
					{formula.unit && (
						<span className="text-xs text-muted-foreground">Unit: {formula.unit}</span>
					)}
				</div>
				<button
					type="button"
					onClick={copyFormula}
					className="text-xs text-primary hover:underline flex-shrink-0"
				>
					{copied ? 'Copied!' : 'Copy'}
				</button>
			</div>
		</div>
	);
}

function TopicSection({ topic }: { topic: Topic }) {
	return (
		<div className="mb-4">
			<h3 className="font-semibold text-sm mb-2 text-primary">{topic.name}</h3>
			<div className="grid gap-2">
				{topic.formulas.map((formula) => (
					<FormulaCard key={formula.id} formula={formula} />
				))}
			</div>
		</div>
	);
}

function FormulaList({ data }: { data: typeof mathFormulas }) {
	return (
		<div className="space-y-1">
			{data.topics.map((topic) => (
				<TopicSection key={topic.id} topic={topic} />
			))}
		</div>
	);
}

function FormulaSearch({ onSelect }: { onSelect: (formula: Formula) => void }) {
	const [query, setQuery] = useState('');

	const { searchFormulas } = require('@/lib/formulas/data');
	const results = query.length >= 2 ? searchFormulas(query) : [];

	return (
		<div className="space-y-3">
			<div className="relative">
				<HugeiconsIcon
					icon={SearchIcon}
					className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
				/>
				<Input
					placeholder="Search formulas..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="pl-9"
				/>
			</div>

			{query.length >= 2 && (
				<div className="grid gap-2">
					{results.length === 0 ? (
						<p className="text-sm text-muted-foreground text-center py-4">
							No formulas found for &quot;{query}&quot;
						</p>
					) : (
						results.map((formula: Formula) => (
							<div
								role="button"
								tabIndex={0}
								key={formula.id}
								onClick={() => onSelect(formula)}
								onKeyDown={(e) => e.key === 'Enter' && onSelect(formula)}
								className="cursor-pointer"
							>
								<FormulaCard formula={formula} />
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}

export function FormulaSheetViewer() {
	const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);

	return (
		<div className="space-y-4">
			<FormulaSearch onSelect={setSelectedFormula} />

			{selectedFormula && (
				<Card className="bg-primary/5 border-primary/20">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">{selectedFormula.name}</CardTitle>
					</CardHeader>
					<CardContent>
						<code className="text-lg font-mono bg-muted px-3 py-2 rounded block">
							{selectedFormula.formula}
						</code>
						<p className="text-sm text-muted-foreground mt-2">{selectedFormula.description}</p>
						{selectedFormula.unit && (
							<p className="text-xs text-muted-foreground mt-1">Unit: {selectedFormula.unit}</p>
						)}
					</CardContent>
				</Card>
			)}

			<Tabs defaultValue="maths" className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="maths">Maths</TabsTrigger>
					<TabsTrigger value="physics">Physics</TabsTrigger>
					<TabsTrigger value="chemistry">Chemistry</TabsTrigger>
				</TabsList>

				<TabsContent value="maths" className="mt-4">
					<FormulaList data={mathFormulas} />
				</TabsContent>

				<TabsContent value="physics" className="mt-4">
					<FormulaList data={physicsFormulas} />
				</TabsContent>

				<TabsContent value="chemistry" className="mt-4">
					<FormulaList data={chemistryFormulas} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
