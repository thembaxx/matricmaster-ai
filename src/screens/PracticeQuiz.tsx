'use client';

import {
	ArrowLeft01Icon,
	ArrowLeft02Icon,
	ArrowRight01Icon,
	Delete01Icon,
	KeyboardIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
	VisuallyHidden,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const playClickSound = () => {
	try {
		const audioCtx = new (
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
		)();
		const oscillator = audioCtx.createOscillator();
		const gainNode = audioCtx.createGain();
		oscillator.connect(gainNode);
		gainNode.connect(audioCtx.destination);
		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
		gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
		oscillator.start();
		oscillator.stop(audioCtx.currentTime + 0.1);
	} catch {
		// Audio not supported - silently fail
	}
};

const SYMBOL_SETS = {
	calculus: [
		{ label: '□/□', value: '/' },
		{ label: '√□', value: 'sqrt(' },
		{ label: 'x^□', value: '^' },
		{ label: '()', value: '(' },
		{ label: '∫', value: '∫' },
		{ label: '∫ □^□', value: '∫' },
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

export default function PracticeQuiz() {
	const router = useRouter();
	const [input, setInput] = useState('∫_0^π sin(x) dx');
	const [cursorPos, setCursorPos] = useState(input.length);

	const handleKeyClick = (val: string) => {
		playClickSound();
		const newInput = input.slice(0, cursorPos) + val + input.slice(cursorPos);
		setInput(newInput);
		setCursorPos((prev) => prev + val.length);
	};

	const handleDelete = () => {
		playClickSound();
		if (cursorPos > 0) {
			const newInput = input.slice(0, cursorPos - 1) + input.slice(cursorPos);
			setInput(newInput);
			setCursorPos((prev) => prev - 1);
		}
	};

	const moveCursor = (dir: 'left' | 'right') => {
		playClickSound();
		if (dir === 'left' && cursorPos > 0) setCursorPos((prev) => prev - 1);
		if (dir === 'right' && cursorPos < input.length) setCursorPos((prev) => prev + 1);
	};

	return (
		<div className="flex flex-col h-full bg-muted dark:bg-background">
			<PracticeQuizHeader router={router} />
			<ScrollArea className="flex-1">
				<main className="px-6 py-4 space-y-8 pb-32">
					<QuestionMeta />
					<QuestionTitle />
					<QuestionBody />
					<MathInputField input={input} cursorPos={cursorPos} onDelete={handleDelete} />
				</main>
			</ScrollArea>
			<CalculatorLauncher
				router={router}
				onKeyClick={handleKeyClick}
				onDelete={handleDelete}
				moveCursor={moveCursor}
			/>
		</div>
	);
}

type HeaderProps = {
	router: ReturnType<typeof useRouter>;
};

function PracticeQuizHeader({ router }: HeaderProps) {
	return (
		<header className="px-6 pt-12 pb-4 shrink-0 flex items-center justify-between">
			<Button
				variant="ghost"
				size="icon"
				className="rounded-full"
				onClick={() => router.push('/dashboard')}
			>
				<HugeiconsIcon icon={ArrowLeft02Icon} className="w-6 h-6 text-foreground" />
			</Button>
			<h1 className="text-xl font-black text-foreground tracking-tight">Practice Quiz</h1>
			<div className="w-10" />
		</header>
	);
}

function QuestionMeta() {
	return (
		<div className="flex items-center gap-3">
			<div className="px-3 py-1.5 bg-brand-amber/20 dark:bg-brand-amber/20 rounded-xl">
				<span className="text-[10px] font-black text-brand-amber-darker dark:text-brand-amber uppercase tracking-widest">
					Calculus
				</span>
			</div>
			<span className="text-sm font-bold text-muted-foreground">Difficulty: Hard</span>
		</div>
	);
}

function QuestionTitle() {
	return <h2 className="text-3xl font-black text-foreground tracking-tight">Question 4</h2>;
}

function QuestionBody() {
	return (
		<div className="space-y-4">
			<p className="text-xl font-medium text-muted-foreground leading-relaxed">
				Calculate the exact area under the curve for the function{' '}
				<span className="math-serif font-bold">sin(x)</span> from{' '}
				<span className="math-serif font-bold">0</span> to{' '}
				<span className="math-serif font-bold">π</span>.
			</p>

			<Card className="p-8 bg-card border-none shadow-sm rounded-[2.5rem] relative overflow-hidden flex items-center justify-center min-h-[240px]">
				<div className="absolute inset-0 bg-muted/50 dark:bg-muted/20" />
				<div
					className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
					style={{
						backgroundImage: 'radial-gradient(var(--muted-foreground) 1px, transparent 1px)',
						backgroundSize: '30px 30px',
					}}
				/>
				<GraphSVG />
			</Card>
		</div>
	);
}

function GraphSVG() {
	return (
		<svg width="240" height="160" viewBox="0 0 240 160" className="relative z-10">
			<title>Mathematical Function Graph</title>
			<line
				x1="20"
				y1="140"
				x2="220"
				y2="140"
				stroke="currentColor"
				strokeWidth="1"
				className="text-zinc-300 dark:text-zinc-700"
			/>
			<line
				x1="40"
				y1="20"
				x2="40"
				y2="140"
				stroke="currentColor"
				strokeWidth="1"
				className="text-zinc-300 dark:text-zinc-700"
			/>
			<path
				d="M 40 140 Q 90 40 140 140"
				className="fill-yellow-200 dark:fill-yellow-900/20"
				stroke="none"
			/>
			<path
				d="M 40 140 Q 90 40 140 140"
				fill="none"
				stroke="var(--brand-amber)"
				strokeWidth="3"
				strokeLinecap="round"
			/>
			<text x="35" y="155" fontSize="10" className="fill-zinc-400 font-bold">
				0
			</text>
			<text x="135" y="155" fontSize="10" className="fill-zinc-400 font-bold">
				π
			</text>
			<text x="160" y="60" fontSize="11" className="fill-zinc-400 italic">
				y = sin(x)
			</text>
		</svg>
	);
}

type MathInputFieldProps = {
	input: string;
	cursorPos: number;
	onDelete: () => void;
};

function MathInputField({ input, cursorPos, onDelete }: MathInputFieldProps) {
	return (
		<Card className="p-6 bg-card border-none shadow-xl rounded-3xl flex items-center gap-4 relative mt-12">
			<div className="flex-1 min-h-[60px] flex items-center px-2">
				<div className="text-2xl font-serif text-foreground flex items-center flex-wrap gap-0.5 relative">
					{input.split('').map((char, i) => (
						<span key={i} className="relative">
							{i === cursorPos && <CursorBlink />}
							{char}
						</span>
					))}
					{cursorPos === input.length && <CursorBlink />}
				</div>
			</div>
			<Button
				variant="ghost"
				size="icon"
				className="shrink-0 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
				onClick={onDelete}
			>
				<HugeiconsIcon icon={Delete01Icon} className="w-6 h-6 fill-current" />
			</Button>
		</Card>
	);
}

function CursorBlink() {
	return (
		<m.div
			initial={{ opacity: 0 }}
			animate={{ opacity: [1, 0] }}
			transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
			className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-orange-500"
		/>
	);
}

type CalculatorLauncherProps = {
	router: ReturnType<typeof useRouter>;
	onKeyClick: (val: string) => void;
	onDelete: () => void;
	moveCursor: (dir: 'left' | 'right') => void;
};

function CalculatorLauncher({ router, onKeyClick, onDelete, moveCursor }: CalculatorLauncherProps) {
	return (
		<div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-40">
			<Sheet>
				<SheetTrigger asChild>
					<Button className="bg-card text-foreground shadow-2xl rounded-2xl h-14 px-8 border-none hover:bg-zinc-50 transition-all gap-3 group">
						<HugeiconsIcon
							icon={KeyboardIcon}
							className="w-5 h-5 text-primary group-hover:scale-110 transition-transform"
						/>
						<span className="font-bold">Show Calculator</span>
					</Button>
				</SheetTrigger>
				<SheetContent
					side="bottom"
					className="h-[520px] rounded-t-[3rem] p-0 border-none bg-muted dark:bg-background focus-visible:outline-none overflow-hidden"
				>
					<SheetTitle>
						<VisuallyHidden>Calculator</VisuallyHidden>
					</SheetTitle>
					<CalculatorContent
						router={router}
						onKeyClick={onKeyClick}
						onDelete={onDelete}
						moveCursor={moveCursor}
					/>
				</SheetContent>
			</Sheet>
		</div>
	);
}

type CalculatorContentProps = {
	router: ReturnType<typeof useRouter>;
	onKeyClick: (val: string) => void;
	onDelete: () => void;
	moveCursor: (dir: 'left' | 'right') => void;
};

function CalculatorContent({ router, onKeyClick, moveCursor }: CalculatorContentProps) {
	return (
		<>
			<div className="w-12 h-1.5 bg-muted-foreground/20 dark:bg-muted rounded-full mx-auto mt-4 mb-6" />
			<Tabs defaultValue="calculus" className="w-full flex flex-col h-full">
				<TabsList className="bg-transparent border-none w-full px-6 flex justify-between gap-0 h-14">
					{['basic', 'calculus', 'arithmetic', 'greek'].map((tab) => (
						<TabsTrigger
							key={tab}
							value={tab}
							className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-brand-amber data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-muted-foreground data-[state=active]:text-foreground transition-all h-full capitalize"
						>
							{tab}
						</TabsTrigger>
					))}
				</TabsList>

				<div className="flex-1 px-4 py-6">
					<AnimatePresence mode="wait">
						<TabsContent
							value="calculus"
							className="grid grid-cols-4 gap-3 mt-0 h-full content-start"
						>
							{SYMBOL_SETS.calculus.map((item) => (
								<CalcKey
									key={item.label}
									label={item.label}
									onClick={() => onKeyClick(item.value)}
								/>
							))}
							<CalcKey
								label={<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />}
								onClick={() => moveCursor('left')}
								className="bg-secondary dark:bg-secondary/50"
							/>
							<CalcKey
								label={<HugeiconsIcon icon={ArrowRight01Icon} className="w-6 h-6" />}
								onClick={() => moveCursor('right')}
								className="bg-secondary dark:bg-secondary/50"
							/>
							<Button
								className="col-span-2 h-16 bg-brand-amber hover:bg-brand-amber/90 text-foreground font-black text-xl rounded-2xl shadow-xl shadow-brand-amber/20 transition-all active:scale-95"
								onClick={() => router.push('/lesson-complete')}
							>
								Enter
							</Button>
						</TabsContent>

						<TabsContent value="basic" className="grid grid-cols-4 gap-3 mt-0 h-full content-start">
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
							className="grid grid-cols-4 gap-3 mt-0 h-full content-start"
						>
							{SYMBOL_SETS.arithmetic.map((item) => (
								<CalcKey
									key={item.label}
									label={item.label}
									onClick={() => onKeyClick(item.value)}
								/>
							))}
						</TabsContent>

						<TabsContent value="greek" className="grid grid-cols-4 gap-3 mt-0 h-full content-start">
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
			whileTap={{ scale: 0.9, backgroundColor: 'rgba(239, 176, 54, 0.1)' }}
			transition={{ type: 'spring', stiffness: 500, damping: 30 }}
			onClick={onClick}
			className={`h-16 flex items-center justify-center bg-card rounded-2xl shadow-sm text-lg font-bold text-foreground border border-transparent hover:border-brand-amber/30 transition-colors ${className}`}
		>
			{label}
		</m.button>
	);
}
