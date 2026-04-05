'use client';

import {
	ArrowLeft01Icon,
	ArrowRight01Icon,
	Delete01Icon,
	KeyboardIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { AnimatePresence, m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const SYMBOL_SETS = {
	basic: [
		{ label: 'x', value: 'x' },
		{ label: 'y', value: 'y' },
		{ label: 'z', value: 'z' },
		{ label: 'n', value: 'n' },
		{ label: 'a', value: 'a' },
		{ label: 'b', value: 'b' },
		{ label: 'π', value: 'π' },
		{ label: 'θ', value: 'θ' },
	],
	calculus: [
		{ label: '∫', value: '∫' },
		{ label: '∂', value: '∂' },
		{ label: '∑', value: '∑' },
		{ label: '√', value: '√' },
		{ label: '∞', value: '∞' },
		{ label: 'Δ', value: 'Δ' },
		{ label: 'd/dx', value: 'd/dx' },
		{ label: 'lim', value: 'lim' },
	],
	arithmetic: [
		{ label: '+', value: '+' },
		{ label: '-', value: '-' },
		{ label: '×', value: '×' },
		{ label: '÷', value: '÷' },
		{ label: '=', value: '=' },
		{ label: '≠', value: '≠' },
		{ label: '<', value: '<' },
		{ label: '>', value: '>' },
	],
	greek: [
		{ label: 'α', value: 'α' },
		{ label: 'β', value: 'β' },
		{ label: 'γ', value: 'γ' },
		{ label: 'δ', value: 'δ' },
		{ label: 'ε', value: 'ε' },
		{ label: 'λ', value: 'λ' },
		{ label: 'μ', value: 'μ' },
		{ label: 'σ', value: 'σ' },
	],
};

interface MathKeyboardProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
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

export function MathKeyboard({
	isOpen,
	onOpenChange,
	onKeyClick,
	onDelete,
	moveCursor,
}: MathKeyboardProps) {
	return (
		<Sheet open={isOpen} onOpenChange={onOpenChange}>
			<SheetTrigger asChild>
				<Button className="bg-card text-foreground shadow-soft-lg rounded-2xl h-12 px-6 border pointer-events-auto hover:bg-secondary transition-all gap-2">
					<HugeiconsIcon icon={KeyboardIcon} className="w-4 h-4" />
					<span className="font-bold text-sm">Calculator</span>
				</Button>
			</SheetTrigger>
			<SheetContent
				side="bottom"
				className="h-[400px] rounded-t-[2rem] p-0 border-none bg-muted dark:bg-background"
			>
				<SheetTitle>
					<VisuallyHidden>Calculator</VisuallyHidden>
				</SheetTitle>
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
							<TabsContent
								value="basic"
								className="grid grid-cols-4 gap-2 mt-0 h-full content-start"
							>
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
							<TabsContent
								value="greek"
								className="grid grid-cols-4 gap-2 mt-0 h-full content-start"
							>
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
			</SheetContent>
		</Sheet>
	);
}
