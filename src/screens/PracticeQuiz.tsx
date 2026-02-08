'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Delete, Keyboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock click sound generator
const playClickSound = () => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: Legacy Webkit Audio Support
		const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
	} catch (_e) {
		console.log('Audio not supported or blocked');
	}
};

const calculusSymbols = [
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
];

const basicSymbols = 'abcdefghijklm'.split('').map((s) => ({ label: s, value: s }));
const arithmeticSymbols = ['+', '-', '×', '÷', '=', '<', '>', '±', '%'].map((s) => ({
	label: s,
	value: s,
}));
const greekSymbols = ['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'σ', 'ω', 'Δ'].map((s) => ({
	label: s,
	value: s,
}));

export default function PracticeQuiz() {
	const router = useRouter();
	const [input, setInput] = useState('∫_0^π sin(x) dx');
	const [cursorPos, setCursorPos] = useState(input.length);

	const handleKeyClick = (val: string) => {
		playClickSound();
		const newInput = input.slice(0, cursorPos) + val + input.slice(cursorPos);
		setInput(newInput);
		setCursorPos(cursorPos + val.length);
	};

	const handleDelete = () => {
		playClickSound();
		if (cursorPos > 0) {
			const newInput = input.slice(0, cursorPos - 1) + input.slice(cursorPos);
			setInput(newInput);
			setCursorPos(cursorPos - 1);
		}
	};

	const moveCursor = (dir: 'left' | 'right') => {
		playClickSound();
		if (dir === 'left' && cursorPos > 0) setCursorPos(cursorPos - 1);
		if (dir === 'right' && cursorPos < input.length) setCursorPos(cursorPos + 1);
	};

	return (
		<div className="flex flex-col h-full bg-[#f8f9fb] dark:bg-[#0a0f18] font-inter">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 shrink-0 flex items-center justify-between">
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full"
					onClick={() => router.push('/dashboard')}
				>
					<ArrowLeft className="w-6 h-6 text-zinc-900 dark:text-white" />
				</Button>
				<h1 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
					Practice Quiz
				</h1>
				<div className="w-10" />
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 space-y-8 pb-32">
					{/* Meta Info */}
					<div className="flex items-center gap-3">
						<div className="px-3 py-1.5 bg-[#fef3c7] dark:bg-yellow-900/30 rounded-xl">
							<span className="text-[10px] font-black text-[#92400e] dark:text-yellow-500 uppercase tracking-widest">
								Calculus
							</span>
						</div>
						<span className="text-sm font-bold text-zinc-400 dark:text-zinc-500">
							Difficulty: Hard
						</span>
					</div>

					{/* Question Title */}
					<h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
						Question 4
					</h2>

					{/* Question Body */}
					<div className="space-y-4">
						<p className="text-xl font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
							Calculate the exact area under the curve for the function{' '}
							<span className="font-serif italic font-bold">sin(x)</span> from{' '}
							<span className="font-serif italic font-bold">0</span> to{' '}
							<span className="font-serif italic font-bold">π</span>.
						</p>

						{/* Graph Visualization */}
						<Card className="p-8 bg-white dark:bg-zinc-900 border-none shadow-sm rounded-[2.5rem] relative overflow-hidden flex items-center justify-center min-h-[240px]">
							<div className="absolute inset-0 bg-[#f8fafc]/50 dark:bg-zinc-800/20" />
							{/* Grid Lines */}
							<div
								className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
								style={{
									backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
									backgroundSize: '30px 30px',
								}}
							/>

							<svg width="240" height="160" viewBox="0 0 240 160" className="relative z-10">
								<title>Mathematical Function Graph</title>
								{/* Axes */}
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

								{/* sine wave area */}
								<path
									d="M 40 140 Q 90 40 140 140"
									fill="#fef3c7"
									className="dark:fill-yellow-900/20"
									stroke="none"
								/>
								<path
									d="M 40 140 Q 90 40 140 140"
									fill="none"
									stroke="#efb036"
									strokeWidth="3"
									strokeLinecap="round"
								/>
								{/* Tick labels */}
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
						</Card>
					</div>

					{/* Math Input Field */}
					<Card className="p-6 bg-white dark:bg-zinc-900 border-none shadow-xl rounded-3xl flex items-center gap-4 relative mt-12">
						<div className="flex-1 min-h-[60px] flex items-center px-2">
							<div className="text-2xl font-serif text-zinc-900 dark:text-white flex items-center flex-wrap gap-0.5 relative">
								{input.split('').map((char, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: Character order is stable
									<span key={i} className="relative">
										{i === cursorPos && (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: [1, 0] }}
												transition={{ repeat: Infinity, duration: 1 }}
												className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-orange-500"
											/>
										)}
										{char}
									</span>
								))}
								{cursorPos === input.length && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: [1, 0] }}
										transition={{ repeat: Infinity, duration: 1 }}
										className="w-[2px] h-8 bg-orange-500"
									/>
								)}
							</div>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="shrink-0 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
							onClick={handleDelete}
						>
							<Delete className="w-6 h-6 fill-current" />
						</Button>
					</Card>
				</main>
			</ScrollArea>

			{/* Calculator Launcher */}
			<div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-40">
				<Sheet>
					<SheetTrigger asChild>
						<Button className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xl rounded-2xl h-14 px-8 border-none hover:bg-zinc-50 transition-all gap-3 group">
							<Keyboard className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
							<span className="font-bold">Show Calculator</span>
						</Button>
					</SheetTrigger>
					<SheetContent
						side="bottom"
						className="h-[520px] rounded-t-[3rem] p-0 border-none bg-[#f1f5f9] dark:bg-[#0a0f18] focus-visible:outline-none overflow-hidden"
					>
						<div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-full mx-auto mt-4 mb-6" />

						<Tabs defaultValue="calculus" className="w-full flex flex-col h-full">
							<TabsList className="bg-transparent border-none w-full px-6 flex justify-between gap-0 h-14">
								<TabsTrigger
									value="basic"
									className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-zinc-400 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white transition-all h-full"
								>
									Basic
								</TabsTrigger>
								<TabsTrigger
									value="calculus"
									className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-zinc-400 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white transition-all h-full"
								>
									Calculus
								</TabsTrigger>
								<TabsTrigger
									value="arithmetic"
									className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-zinc-400 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white transition-all h-full"
								>
									Arithmetic
								</TabsTrigger>
								<TabsTrigger
									value="greek"
									className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-orange-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-zinc-400 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white transition-all h-full"
								>
									Greek
								</TabsTrigger>
							</TabsList>

							<div className="flex-1 px-4 py-6">
								<AnimatePresence mode="wait">
									<TabsContent
										value="calculus"
										className="grid grid-cols-4 gap-3 mt-0 h-full content-start"
									>
										{calculusSymbols.map((item) => (
											<CalcKey
												key={item.label}
												label={item.label}
												onClick={() => handleKeyClick(item.value)}
											/>
										))}
										<CalcKey
											label={<ChevronLeft className="w-6 h-6" />}
											onClick={() => moveCursor('left')}
											className="bg-zinc-200 dark:bg-zinc-800/50"
										/>
										<CalcKey
											label={<ChevronRight className="w-6 h-6" />}
											onClick={() => moveCursor('right')}
											className="bg-zinc-200 dark:bg-zinc-800/50"
										/>
										<Button
											className="col-span-2 h-16 bg-[#efb036] hover:bg-orange-500 text-[#0a0f18] font-black text-xl rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-95"
											onClick={() => router.push('/lesson-complete')}
										>
											Enter
										</Button>
									</TabsContent>

									<TabsContent
										value="basic"
										className="grid grid-cols-4 gap-3 mt-0 h-full content-start"
									>
										{basicSymbols.map((item) => (
											<CalcKey
												key={item.label}
												label={item.label}
												onClick={() => handleKeyClick(item.value)}
											/>
										))}
									</TabsContent>

									<TabsContent
										value="arithmetic"
										className="grid grid-cols-4 gap-3 mt-0 h-full content-start"
									>
										{arithmeticSymbols.map((item) => (
											<CalcKey
												key={item.label}
												label={item.label}
												onClick={() => handleKeyClick(item.value)}
											/>
										))}
									</TabsContent>

									<TabsContent
										value="greek"
										className="grid grid-cols-4 gap-3 mt-0 h-full content-start"
									>
										{greekSymbols.map((item) => (
											<CalcKey
												key={item.label}
												label={item.label}
												onClick={() => handleKeyClick(item.value)}
											/>
										))}
									</TabsContent>
								</AnimatePresence>
							</div>
						</Tabs>
					</SheetContent>
				</Sheet>
			</div>
		</div>
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
		<motion.button
			whileTap={{ scale: 0.9, backgroundColor: 'rgba(239, 176, 54, 0.1)' }}
			transition={{ type: 'spring', stiffness: 500, damping: 30 }}
			onClick={onClick}
			className={`h-16 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-2xl shadow-sm text-lg font-bold text-zinc-900 dark:text-white border border-transparent hover:border-orange-200 transition-colors ${className}`}
		>
			{label}
		</motion.button>
	);
}
