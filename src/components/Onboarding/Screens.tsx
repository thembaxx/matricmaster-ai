import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className="text-center space-y-8"
		>
			<div className="space-y-4">
				<h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
					Your path to <span className="text-primary">Matric success</span> starts here.
				</h1>
				<p className="text-lg text-muted-foreground px-4">
					Stop guessing what to study. Get an AI-powered roadmap tailored to your goals.
				</p>
			</div>

			<div className="relative w-full aspect-[4/3] bg-muted rounded-2xl overflow-hidden shadow-xl border border-border">
				<div className="absolute inset-0 flex items-center justify-center text-muted-foreground italic p-8 text-center">
					[Preview: A sleek, personalized 1-week study plan with high-impact topics highlighted]
				</div>
			</div>

			<div className="flex flex-col gap-3 w-full">
				<Button size="lg" className="h-14 text-lg" onClick={onContinue}>
					Get Started
				</Button>
				<button
					type="button"
					className="text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					Already have an account? <span className="font-semibold underline">Log in</span>
				</button>
			</div>
		</motion.div>
	);
}

export function GoalScreen({
	onContinue,
	selectedGoal,
	onSelect,
}: {
	onContinue: () => void;
	selectedGoal: string | null;
	onSelect: (goal: string) => void;
}) {
	const goals = [
		{ id: 'distinction', label: 'Get a Distinction', desc: "I'm aiming for 80%+", icon: '🎯' },
		{
			id: 'improve',
			label: 'Improve my current marks',
			desc: 'I want to do better than last year',
			icon: '📈',
		},
		{
			id: 'pass',
			label: 'Just pass my subjects',
			desc: "I need to ensure I don't fail",
			icon: '✅',
		},
		{
			id: 'master-subject',
			label: 'Master a specific subject',
			desc: "I'm struggling with one particular area",
			icon: '🚀',
		},
		{
			id: 'organized',
			label: 'Stay organized',
			desc: 'I know the work, I just need a plan',
			icon: '📚',
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			className="w-full space-y-8"
		>
			<div className="text-center space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">
					What is your primary goal for the NSC exams?
				</h2>
				<p className="text-muted-foreground">
					We'll tailor your experience based on where you want to be.
				</p>
			</div>

			<div className="grid gap-3">
				{goals.map((goal) => (
					<button
						type="button"
						key={goal.id}
						onClick={() => onSelect(goal.id)}
						className={cn(
							'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
							selectedGoal === goal.id
								? 'border-primary bg-primary/5 ring-2 ring-primary/20'
								: 'border-border bg-card hover:border-muted-foreground/50'
						)}
					>
						<span className="text-2xl">{goal.icon}</span>
						<div className="flex-1">
							<div className="font-semibold text-foreground">{goal.label}</div>
							<div className="text-sm text-muted-foreground">{goal.desc}</div>
						</div>
					</button>
				))}
			</div>

			<div className="flex justify-center">
				<Button
					size="lg"
					className="w-full h-14 text-lg"
					disabled={!selectedGoal}
					onClick={onContinue}
				>
					Continue
				</Button>
			</div>
		</motion.div>
	);
}

export function PainPointsScreen({
	onContinue,
	selectedPains,
	onToggle,
}: {
	onContinue: () => void;
	selectedPains: string[];
	onToggle: (id: string) => void;
}) {
	const pains = [
		{
			id: 'papers',
			label: 'Too many past papers',
			desc: "I don't know where to start",
			icon: '📂',
		},
		{
			id: 'concepts',
			label: 'Concepts don\'t "click"',
			desc: 'Textbooks are confusing',
			icon: '🤯',
		},
		{ id: 'time', label: 'Poor time management', desc: 'I run out of time in exams', icon: '⏳' },
		{
			id: 'prioritize',
			label: 'Knowing what to prioritize',
			desc: "I don't know which topics are most likely to appear",
			icon: '❓',
		},
		{
			id: 'blind-spots',
			label: 'Fear of "blind spots"',
			desc: "I'm worried I'll miss a key topic",
			icon: '📉',
		},
		{
			id: 'motivation',
			label: 'Lack of motivation',
			desc: 'I struggle to keep a study streak',
			icon: '💤',
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			className="w-full space-y-8"
		>
			<div className="text-center space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">
					What's your biggest struggle right now?
				</h2>
				<p className="text-muted-foreground">
					Select all that apply. We'll make sure your plan addresses these.
				</p>
			</div>

			<div className="grid gap-3">
				{pains.map((pain) => (
					<button
						type="button"
						key={pain.id}
						onClick={() => onToggle(pain.id)}
						className={cn(
							'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
							selectedPains.includes(pain.id)
								? 'border-primary bg-primary/5'
								: 'border-border bg-card hover:border-muted-foreground/50'
						)}
					>
						<div
							className={cn(
								'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
								selectedPains.includes(pain.id)
									? 'bg-primary border-primary'
									: 'border-muted-foreground/30'
							)}
						>
							{selectedPains.includes(pain.id) && (
								<div className="w-2 h-2 bg-primary-foreground rounded-full" />
							)}
						</div>
						<div className="flex-1">
							<div className="font-semibold text-foreground">{pain.label}</div>
							<div className="text-sm text-muted-foreground">{pain.desc}</div>
						</div>
					</button>
				))}
			</div>

			<div className="flex justify-center">
				<Button size="lg" className="w-full h-14 text-lg" onClick={onContinue}>
					Continue
				</Button>
			</div>
		</motion.div>
	);
}

export function SocialProofScreen({ onContinue }: { onContinue: () => void }) {
	const testimonials = [
		{
			name: 'Sipho M.',
			goal: 'Distinction',
			text: "I was studying 6 hours a day but my marks weren't moving. Lumni showed me exactly which topics I was missing. I went from 65% to 82% in 3 weeks.",
		},
		{
			name: 'Amara K.',
			goal: 'Pass',
			text: "I used to panic every time I opened a past paper. The AI explanations finally made the concepts 'click' for me. I finally feel like I can actually do this.",
		},
		{
			name: 'Liam W.',
			goal: 'Improve Marks',
			text: 'The 1-week study plans are a game changer. No more guessing what to study—I just follow the roadmap and the progress tracking keeps me motivated.',
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			className="w-full space-y-8"
		>
			<div className="text-center space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">
					Join thousands of Grade 12s mastering their exams.
				</h2>
				<p className="text-muted-foreground">
					See how others used Lumni to bridge the gap between effort and results.
				</p>
			</div>

			<div className="grid gap-4">
				{testimonials.map((t, i) => (
					<div key={i} className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3">
						<div className="flex justify-between items-center">
							<span className="font-bold text-foreground">{t.name}</span>
							<span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
								{t.goal}
							</span>
						</div>
						<p className="text-muted-foreground italic">"{t.text}"</p>
					</div>
				))}
			</div>

			<div className="flex justify-center">
				<Button size="lg" className="w-full h-14 text-lg" onClick={onContinue}>
					Continue
				</Button>
			</div>
		</motion.div>
	);
}

export function PainAmpScreen({ onContinue }: { onContinue: () => void }) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const cards = [
		"I spend hours reading the textbook, but I still can't answer the exam questions.",
		"I have a stack of past papers on my desk, but I'm too overwhelmed to start.",
		'I understand the theory, but I always run out of time during the actual test.',
		"I feel like I'm working hard, but I'm not actually getting any closer to my target mark.",
		'I wish I had a personal tutor who could explain exactly where I went wrong in a question.',
	];

	const handleSwipe = (_direction: 'left' | 'right') => {
		if (currentIndex < cards.length - 1) {
			setCurrentIndex((prev) => prev + 1);
		} else {
			onContinue();
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			className="w-full space-y-8 text-center"
		>
			<div className="space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Do you relate to any of these?</h2>
				<p className="text-muted-foreground">Swipe right if this sounds like you.</p>
			</div>

			<div className="relative h-80 w-full flex items-center justify-center">
				<AnimatePresence mode="popLayout">
					<motion.div
						key={currentIndex}
						initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
						animate={{ scale: 1, opacity: 1, rotate: 0 }}
						exit={{ x: 200, opacity: 0, rotate: 15 }}
						className="absolute w-full max-w-sm p-8 rounded-3xl bg-card border-2 border-border shadow-xl text-2xl font-medium italic text-center"
						drag="x"
						dragConstraints={{ left: 0, right: 0 }}
						onDragEnd={(_, info) => {
							if (info.offset.x > 100) handleSwipe('right');
							else if (info.offset.x < -100) handleSwipe('left');
						}}
					>
						"{cards[currentIndex]}"
					</motion.div>
				</AnimatePresence>
			</div>

			<div className="flex justify-center gap-4">
				<Button variant="outline" onClick={() => handleSwipe('left')}>
					✗ Dismiss
				</Button>
				<Button onClick={() => handleSwipe('right')}>✓ Relate</Button>
			</div>
		</motion.div>
	);
}

export function SolutionScreen({ onContinue }: { onContinue: () => void }) {
	const solutions = [
		{
			pain: 'Overwhelmed by past papers',
			fix: 'AI-Optimized Roadmap',
			desc: 'No more guessing. We tell you exactly which papers and topics to hit first.',
			icon: '🗺️',
		},
		{
			pain: "Concepts don't click",
			fix: 'Instant Tutor Explanations',
			desc: 'Get a step-by-step breakdown of any question, instantly.',
			icon: '🤖',
		},
		{
			pain: 'Fear of blind spots',
			fix: 'Dynamic Gap Analysis',
			desc: 'Our AI tracks your mistakes and forces you to master them before moving on.',
			icon: '🎯',
		},
	];

	return (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			className="w-full space-y-8"
		>
			<div className="text-center space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">A smarter way to study is here.</h2>
				<p className="text-muted-foreground">
					Based on what you've told us, here is how Lumni AI solves your struggle:
				</p>
			</div>

			<div className="grid gap-4">
				{solutions.map((s, i) => (
					<div key={i} className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-2">
						<div className="flex items-center gap-3">
							<span className="text-xl">{s.icon}</span>
							<span className="text-sm font-medium text-muted-foreground">{s.pain}</span>
						</div>
						<div className="font-bold text-lg text-foreground">{s.fix}</div>
						<div className="text-muted-foreground text-sm">{s.desc}</div>
					</div>
				))}
			</div>

			<div className="flex justify-center">
				<Button size="lg" className="w-full h-14 text-lg" onClick={onContinue}>
					Show me my plan
				</Button>
			</div>
		</motion.div>
	);
}

export function PreferenceScreen({
	onContinue,
	selectedSubjects,
	onToggle,
}: {
	onContinue: () => void;
	selectedSubjects: string[];
	onToggle: (subject: string) => void;
}) {
	const subjects = [
		{ id: 'math', label: 'Mathematics', icon: '📐' },
		{ id: 'physics', label: 'Physical Sciences', icon: '🧪' },
		{ id: 'english', label: 'English (HL/FAL)', icon: '📝' },
		{ id: 'geography', label: 'Geography', icon: '🌍' },
		{ id: 'economics', label: 'Economics', icon: '📉' },
		{ id: 'accounting', label: 'Accounting', icon: '📊' },
		{ id: 'life-sciences', label: 'Life Sciences', icon: '🧬' },
		{ id: 'history', label: 'History', icon: '📜' },
		{ id: 'it', label: 'IT / CAT', icon: '💻' },
	];

	return (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			className="w-full space-y-8"
		>
			<div className="text-center space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Which subjects are your priority?</h2>
				<p className="text-muted-foreground">
					Pick the subjects you want to master. We'll use these to build your demo.
				</p>
			</div>

			<div className="grid gap-3">
				{subjects.map((s) => (
					<button
						type="button"
						key={s.id}
						onClick={() => onToggle(s.id)}
						className={cn(
							'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
							selectedSubjects.includes(s.id)
								? 'border-primary bg-primary/5 ring-2 ring-primary/20'
								: 'border-border bg-card hover:border-muted-foreground/50'
						)}
					>
						<span className="text-xl">{s.icon}</span>
						<span className="font-medium text-sm text-foreground">{s.label}</span>
					</button>
				))}
			</div>

			<div className="flex justify-center">
				<Button
					size="lg"
					className="w-full h-14 text-lg"
					disabled={selectedSubjects.length === 0}
					onClick={onContinue}
				>
					Create my plan
				</Button>
			</div>
		</motion.div>
	);
}

export function PermissionScreen({ onContinue }: { onContinue: () => void }) {
	return (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			className="w-full space-y-8 text-center"
		>
			<div className="space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Never miss a study session.</h2>
				<p className="text-muted-foreground">
					To keep your streak alive and your goals on track, we'll send you a quick nudge when it's
					time to study.
				</p>
			</div>

			<div className="grid gap-4 text-left max-w-xs mx-auto">
				{[
					{ icon: '🔔', title: 'Daily Reminders', desc: 'Stay consistent with your 1-week plan.' },
					{ icon: '🔥', title: 'Streak Alerts', desc: "Don't let your momentum drop." },
					{
						icon: '🎯',
						title: 'Goal Check-ins',
						desc: "Get notified when you've closed a knowledge gap.",
					},
				].map((item, i) => (
					<div key={i} className="flex gap-4 items-start">
						<span className="text-2xl">{item.icon}</span>
						<div>
							<div className="font-bold text-foreground">{item.title}</div>
							<div className="text-sm text-muted-foreground">{item.desc}</div>
						</div>
					</div>
				))}
			</div>

			<div className="flex flex-col gap-3 w-full">
				<Button size="lg" className="h-14 text-lg" onClick={onContinue}>
					Enable Notifications
				</Button>
				<button
					type="button"
					className="text-sm text-muted-foreground hover:text-foreground transition-colors"
				>
					Not now
				</button>
			</div>
		</motion.div>
	);
}

export function ProcessingScreen({ onContinue }: { onContinue: () => void }) {
	const [textIndex, setTextIndex] = useState(0);
	const texts = [
		'Analyzing your goals...',
		'Scanning high-impact topics...',
		'Building your custom 1-week roadmap...',
		'Almost there...',
	];

	React.useEffect(() => {
		const timer = setInterval(() => {
			setTextIndex((prev) => (prev + 1) % texts.length);
		}, 1500);
		return () => clearInterval(timer);
	}, []);

	React.useEffect(() => {
		const timeout = setTimeout(onContinue, 6000);
		return () => clearTimeout(timeout);
	}, [onContinue]);

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="text-center space-y-8"
		>
			<div className="relative w-24 h-24 mx-auto">
				<motion.div
					animate={{ rotate: 360 }}
					transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: 'linear' }}
					className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full"
				/>
				<div className="absolute inset-0 flex items-center justify-center text-3xl">🧠</div>
			</div>
			<h2 className="text-2xl font-bold animate-pulse text-foreground">{texts[textIndex]}</h2>
		</motion.div>
	);
}
