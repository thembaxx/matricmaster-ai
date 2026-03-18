import { ArrowLeft01Icon, ArrowRight01Icon, Delete01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface MathSymbolSet {
	label: string;
	value: string;
}

export const SYMBOL_SETS = {
	calculus: [
		{ label: '□/□', value: '/' },
		{ label: '√□', value: 'sqrt(' },
		{ label: 'x^□', value: '^' },
		{ label: '()', value: '(' },
		{ label: '∫', value: '∫' },
		{ label: 'd/dx', value: 'd/dx' },
		{ label: 'lim', value: 'lim' },
		{ label: 'Σ', value: 'Σ' },
		{ label: '∞', value: '∞' },
		{ label: 'π', value: 'π' },
		{ label: 'e', value: 'e' },
	],
	basic: 'abcdefghijklm'.split('').map((s) => ({ label: s, value: s })),
	arithmetic: ['+', '-', '×', '÷', '=', '<', '>', '±', '%'].map((s) => ({ label: s, value: s })),
	greek: ['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'σ', 'ω', 'Δ'].map((s) => ({
		label: s,
		value: s,
	})),
};

interface MathKeyboardProps {
	onKeyClick: (val: string) => void;
	onDelete: () => void;
	moveCursor: (dir: 'left' | 'right') => void;
}

function CalcKey({
	label,
	onClick,
	className = '',
}: {
	label: React.ReactNode;
	onClick: () => void;
	className?: string;
}) {
	return (
		<m.button
			whileTap={{ scale: 0.9 }}
			transition={{ type: 'spring', stiffness: 500, damping: 30 }}
			onClick={onClick}
			className={cn(
				'h-12 flex items-center justify-center bg-card rounded-xl shadow-sm text-sm font-bold border border-transparent hover:border-amber-500/30 transition-colors',
				className
			)}
		>
			{label}
		</m.button>
	);
}

export function MathKeyboard({ onKeyClick, onDelete, moveCursor }: MathKeyboardProps) {
	return (
		<>
			<div className="w-10 h-1 bg-muted-foreground/20 dark:bg-muted rounded-full mx-auto mt-3 mb-4" />
			<Tabs defaultValue="calculus" className="w-full flex flex-col h-full">
				<TabsList className="bg-transparent border-none w-full px-4 flex justify-between gap-0 h-12">
					{['basic', 'calculus', 'arithmetic', 'greek'].map((tab) => (
						<TabsTrigger
							key={tab}
							value={tab}
							className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-xs text-muted-foreground data-[state=active]:text-foreground"
						>
							{tab}
						</TabsTrigger>
					))}
				</TabsList>

				<div className="flex-1 px-3 py-4 overflow-auto">
					<AnimatePresence mode="wait">
						<TabsContent
							value="calculus"
							className="grid grid-cols-4 gap-2 mt-0 h-full content-start"
						>
							{SYMBOL_SETS.calculus.map((item) => (
								<CalcKey
									key={item.label}
									label={item.label}
									onClick={() => onKeyClick(item.value)}
								/>
							))}
							<CalcKey
								label={<HugeiconsIcon icon={Delete01Icon} className="w-5 h-5" />}
								onClick={onDelete}
								className="bg-secondary"
							/>
							<CalcKey
								label={<HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />}
								onClick={() => moveCursor('left')}
								className="bg-secondary"
							/>
							<CalcKey
								label={<HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5" />}
								onClick={() => moveCursor('right')}
								className="bg-secondary"
							/>
						</TabsContent>

						<TabsContent value="basic" className="grid grid-cols-4 gap-2 mt-0 h-full content-start">
							{SYMBOL_SETS.basic.map((item) => (
								<CalcKey
									key={item.label}
									label={item.label}
									onClick={() => onKeyClick(item.value)}
								/>
							))}
						</TabsContent>

						<TabsContent
							value="arithmetic"
							className="grid grid-cols-4 gap-2 mt-0 h-full content-start"
						>
							{SYMBOL_SETS.arithmetic.map((item) => (
								<CalcKey
									key={item.label}
									label={item.label}
									onClick={() => onKeyClick(item.value)}
								/>
							))}
						</TabsContent>

						<TabsContent value="greek" className="grid grid-cols-4 gap-2 mt-0 h-full content-start">
							{SYMBOL_SETS.greek.map((item) => (
								<CalcKey
									key={item.label}
									label={item.label}
									onClick={() => onKeyClick(item.value)}
								/>
							))}
						</TabsContent>
					</AnimatePresence>
				</div>
			</Tabs>
		</>
	);
}

interface MathInputFieldProps {
	input: string;
	cursorPos: number;
	onDelete: () => void;
}

export function MathInputField({ input, cursorPos, onDelete }: MathInputFieldProps) {
	return (
		<Card className="p-4 bg-card border-none shadow-md rounded-2xl flex items-center gap-2">
			<div className="flex-1 min-h-[40px] flex items-center px-2 overflow-x-auto">
				<div className="text-lg font-serif text-foreground flex items-center flex-nowrap relative">
					{input.split('').map((char, i) => (
						<span key={i} className="relative whitespace-pre">
							{i === cursorPos && (
								<m.div
									initial={{ opacity: 0 }}
									animate={{ opacity: [1, 0] }}
									transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
									className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-orange-500"
								/>
							)}
							{char}
						</span>
					))}
					{cursorPos === input.length && (
						<m.div
							initial={{ opacity: 0 }}
							animate={{ opacity: [1, 0] }}
							transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
							className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-orange-500"
						/>
					)}
				</div>
			</div>
			<Button
				variant="ghost"
				size="icon"
				className="shrink-0 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
				onClick={onDelete}
			>
				<HugeiconsIcon icon={Delete01Icon} className="w-5 h-5" />
			</Button>
		</Card>
	);
}
