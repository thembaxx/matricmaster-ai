'use client';

import {
	ArrowLeft01Icon,
	Analytics01Icon as BarChartSquare01Icon,
	BookOpen01Icon,
	ArrowDown01Icon as ChevronDown01Icon,
	Cancel01Icon as CloseIcon,
	FireIcon,
	GridIcon,
	Search01Icon,
	StarIcon,
	Tick01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type TopicStatus = 'mastered' | 'in-progress' | 'not-started';

interface Topic {
	id: string;
	name: string;
	status: TopicStatus;
	progress: number;
	lastPracticed?: string;
	questionsAttempted: number;
}

interface Subject {
	id: string;
	name: string;
	color: string;
	icon: string;
	topics: Topic[];
}

const CURRICULUM_DATA: Subject[] = [
	{
		id: 'mathematics',
		name: 'Mathematics',
		color: 'bg-subject-math',
		icon: '🔢',
		topics: [
			{
				id: 'm1',
				name: 'Sequences & Series',
				status: 'mastered',
				progress: 100,
				lastPracticed: '2 days ago',
				questionsAttempted: 45,
			},
			{
				id: 'm2',
				name: 'Functions & Inverses',
				status: 'mastered',
				progress: 100,
				lastPracticed: '5 days ago',
				questionsAttempted: 38,
			},
			{
				id: 'm3',
				name: 'Differential Calculus',
				status: 'in-progress',
				progress: 65,
				lastPracticed: 'Today',
				questionsAttempted: 28,
			},
			{
				id: 'm4',
				name: 'Probability',
				status: 'in-progress',
				progress: 40,
				lastPracticed: 'Yesterday',
				questionsAttempted: 15,
			},
			{ id: 'm5', name: 'Trigonometry', status: 'not-started', progress: 0, questionsAttempted: 0 },
			{
				id: 'm6',
				name: 'Analytical Geometry',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'm7',
				name: 'Euclidean Geometry',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{ id: 'm8', name: 'Statistics', status: 'not-started', progress: 0, questionsAttempted: 0 },
		],
	},
	{
		id: 'physical-sciences',
		name: 'Physical Sciences',
		color: 'bg-subject-physics',
		icon: '⚛️',
		topics: [
			{
				id: 'p1',
				name: 'Momentum & Impulse',
				status: 'mastered',
				progress: 100,
				lastPracticed: '1 week ago',
				questionsAttempted: 52,
			},
			{
				id: 'p2',
				name: 'Projectile Motion',
				status: 'in-progress',
				progress: 75,
				lastPracticed: '3 days ago',
				questionsAttempted: 34,
			},
			{
				id: 'p3',
				name: 'Work, Energy & Power',
				status: 'in-progress',
				progress: 50,
				lastPracticed: 'Yesterday',
				questionsAttempted: 22,
			},
			{
				id: 'p4',
				name: 'Doppler Effect',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'p5',
				name: 'Chemical Equilibrium',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'p6',
				name: 'Chemical Reactions',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'p7',
				name: 'Electrostatics',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'p8',
				name: 'Electric Circuits',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
		],
	},
	{
		id: 'life-sciences',
		name: 'Life Sciences',
		color: 'bg-subject-life',
		icon: '🧬',
		topics: [
			{
				id: 'l1',
				name: 'DNA & RNA',
				status: 'mastered',
				progress: 100,
				lastPracticed: '4 days ago',
				questionsAttempted: 41,
			},
			{
				id: 'l2',
				name: 'Genetics',
				status: 'mastered',
				progress: 100,
				lastPracticed: '1 week ago',
				questionsAttempted: 56,
			},
			{
				id: 'l3',
				name: 'Evolution',
				status: 'in-progress',
				progress: 55,
				lastPracticed: 'Yesterday',
				questionsAttempted: 18,
			},
			{ id: 'l4', name: 'Ecosystems', status: 'not-started', progress: 0, questionsAttempted: 0 },
			{
				id: 'l5',
				name: 'Photosynthesis',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'l6',
				name: 'Human Nutrition',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{ id: 'l7', name: 'Respiration', status: 'not-started', progress: 0, questionsAttempted: 0 },
			{ id: 'l8', name: 'Homeostasis', status: 'not-started', progress: 0, questionsAttempted: 0 },
		],
	},
	{
		id: 'english',
		name: 'English',
		color: 'bg-subject-english',
		icon: '📚',
		topics: [
			{
				id: 'e1',
				name: 'Comprehension',
				status: 'mastered',
				progress: 100,
				lastPracticed: '3 days ago',
				questionsAttempted: 30,
			},
			{
				id: 'e2',
				name: 'Summary Writing',
				status: 'mastered',
				progress: 100,
				lastPracticed: '5 days ago',
				questionsAttempted: 25,
			},
			{
				id: 'e3',
				name: 'Essay Writing',
				status: 'in-progress',
				progress: 70,
				lastPracticed: 'Today',
				questionsAttempted: 12,
			},
			{
				id: 'e4',
				name: 'Poetry Analysis',
				status: 'in-progress',
				progress: 45,
				lastPracticed: 'Yesterday',
				questionsAttempted: 14,
			},
			{ id: 'e5', name: 'Literature', status: 'not-started', progress: 0, questionsAttempted: 0 },
			{
				id: 'e6',
				name: 'Language Structures',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{ id: 'e7', name: 'Advertising', status: 'not-started', progress: 0, questionsAttempted: 0 },
			{
				id: 'e8',
				name: 'Visual Literacy',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
		],
	},
	{
		id: 'accounting',
		name: 'Accounting',
		color: 'bg-subject-accounting',
		icon: '📊',
		topics: [
			{
				id: 'a1',
				name: 'Financial Statements',
				status: 'mastered',
				progress: 100,
				lastPracticed: '6 days ago',
				questionsAttempted: 48,
			},
			{
				id: 'a2',
				name: 'Cost Accounting',
				status: 'in-progress',
				progress: 60,
				lastPracticed: '2 days ago',
				questionsAttempted: 32,
			},
			{ id: 'a3', name: 'Budgeting', status: 'not-started', progress: 0, questionsAttempted: 0 },
			{
				id: 'a4',
				name: 'Inventory Valuation',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{ id: 'a5', name: 'Fixed Assets', status: 'not-started', progress: 0, questionsAttempted: 0 },
			{
				id: 'a6',
				name: 'Reconciliations',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{ id: 'a7', name: 'Companies', status: 'not-started', progress: 0, questionsAttempted: 0 },
			{
				id: 'a8',
				name: 'Analysis & Interpretation',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
		],
	},
	{
		id: 'geography',
		name: 'Geography',
		color: 'bg-subject-geography',
		icon: '🌍',
		topics: [
			{
				id: 'g1',
				name: 'Mapwork',
				status: 'mastered',
				progress: 100,
				lastPracticed: '1 week ago',
				questionsAttempted: 36,
			},
			{
				id: 'g2',
				name: 'Climate & Weather',
				status: 'in-progress',
				progress: 80,
				lastPracticed: 'Yesterday',
				questionsAttempted: 28,
			},
			{
				id: 'g3',
				name: 'Geomorphology',
				status: 'in-progress',
				progress: 35,
				lastPracticed: '3 days ago',
				questionsAttempted: 15,
			},
			{ id: 'g4', name: 'Population', status: 'not-started', progress: 0, questionsAttempted: 0 },
			{ id: 'g5', name: 'Settlement', status: 'not-started', progress: 0, questionsAttempted: 0 },
			{
				id: 'g6',
				name: 'Economic Geography',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{ id: 'g7', name: 'Resources', status: 'not-started', progress: 0, questionsAttempted: 0 },
			{
				id: 'g8',
				name: 'Environmental Hazards',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
		],
	},
	{
		id: 'history',
		name: 'History',
		color: 'bg-subject-history',
		icon: '🏛️',
		topics: [
			{
				id: 'h1',
				name: 'World War I',
				status: 'mastered',
				progress: 100,
				lastPracticed: '2 weeks ago',
				questionsAttempted: 44,
			},
			{
				id: 'h2',
				name: 'World War II',
				status: 'in-progress',
				progress: 85,
				lastPracticed: 'Yesterday',
				questionsAttempted: 38,
			},
			{
				id: 'h3',
				name: 'Cold War',
				status: 'in-progress',
				progress: 55,
				lastPracticed: '4 days ago',
				questionsAttempted: 24,
			},
			{
				id: 'h4',
				name: 'Civil Rights Movement',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'h5',
				name: 'South African History',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'h6',
				name: 'Decolonization',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'h7',
				name: 'International Relations',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'h8',
				name: 'Political Movements',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
		],
	},
	{
		id: 'afrikaans',
		name: 'Afrikaans',
		color: 'bg-orange-500',
		icon: '🇿🇦',
		topics: [
			{
				id: 'af1',
				name: 'Opsomming Skryf',
				status: 'mastered',
				progress: 100,
				lastPracticed: '1 week ago',
				questionsAttempted: 32,
			},
			{
				id: 'af2',
				name: 'Leesbegrip',
				status: 'mastered',
				progress: 100,
				lastPracticed: '5 days ago',
				questionsAttempted: 28,
			},
			{
				id: 'af3',
				name: 'Opstel Skryf',
				status: 'in-progress',
				progress: 60,
				lastPracticed: '2 days ago',
				questionsAttempted: 18,
			},
			{
				id: 'af4',
				name: 'Poësie Analise',
				status: 'in-progress',
				progress: 45,
				lastPracticed: 'Yesterday',
				questionsAttempted: 14,
			},
			{
				id: 'af5',
				name: 'Taalstrukture',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'af6',
				name: 'Letterkunde',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'af7',
				name: 'Advertensies',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'af8',
				name: 'Visuele Geletterdheid',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
		],
	},
	{
		id: 'isixhosa',
		name: 'IsiXhosa',
		color: 'bg-teal-500',
		icon: '🇿🇦',
		topics: [
			{
				id: 'ix1',
				name: 'Incwadi Yebhuku',
				status: 'mastered',
				progress: 100,
				lastPracticed: '3 days ago',
				questionsAttempted: 26,
			},
			{
				id: 'ix2',
				name: 'Ulwimi Lwimi',
				status: 'mastered',
				progress: 100,
				lastPracticed: '1 week ago',
				questionsAttempted: 24,
			},
			{
				id: 'ix3',
				name: 'Ukubhala Iincwadi',
				status: 'in-progress',
				progress: 55,
				lastPracticed: 'Yesterday',
				questionsAttempted: 16,
			},
			{
				id: 'ix4',
				name: 'Inkcazelo',
				status: 'in-progress',
				progress: 40,
				lastPracticed: '3 days ago',
				questionsAttempted: 12,
			},
			{
				id: 'ix5',
				name: 'Isonto Selizwi',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'ix6',
				name: 'Imbongo',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'ix7',
				name: 'Ikhathuni',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'ix8',
				name: 'Umbhalo Oxanduva',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
		],
	},
	{
		id: 'economics',
		name: 'Economics',
		color: 'bg-emerald-600',
		icon: '💰',
		topics: [
			{
				id: 'eco1',
				name: 'Microeconomics',
				status: 'mastered',
				progress: 100,
				lastPracticed: '4 days ago',
				questionsAttempted: 42,
			},
			{
				id: 'eco2',
				name: 'Macroeconomics',
				status: 'in-progress',
				progress: 70,
				lastPracticed: 'Yesterday',
				questionsAttempted: 32,
			},
			{
				id: 'eco3',
				name: 'Economic Graphs',
				status: 'in-progress',
				progress: 55,
				lastPracticed: '2 days ago',
				questionsAttempted: 22,
			},
			{
				id: 'eco4',
				name: 'Market Structures',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'eco5',
				name: 'Monetary Policy',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'eco6',
				name: 'Fiscal Policy',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'eco7',
				name: 'International Trade',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'eco8',
				name: 'Economic Development',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
		],
	},
	{
		id: 'business-studies',
		name: 'Business Studies',
		color: 'bg-blue-600',
		icon: '💼',
		topics: [
			{
				id: 'bs1',
				name: 'Business Environments',
				status: 'mastered',
				progress: 100,
				lastPracticed: '6 days ago',
				questionsAttempted: 38,
			},
			{
				id: 'bs2',
				name: 'Management',
				status: 'in-progress',
				progress: 65,
				lastPracticed: 'Yesterday',
				questionsAttempted: 28,
			},
			{
				id: 'bs3',
				name: 'Marketing',
				status: 'in-progress',
				progress: 45,
				lastPracticed: '3 days ago',
				questionsAttempted: 20,
			},
			{
				id: 'bs4',
				name: 'Finance',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'bs5',
				name: 'Entrepreneurship',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'bs6',
				name: 'Business Ethics',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'bs7',
				name: 'Human Resources',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'bs8',
				name: 'Strategic Management',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
		],
	},
	{
		id: 'computer-applications',
		name: 'Computer Applications Tech',
		color: 'bg-slate-600',
		icon: '💻',
		topics: [
			{
				id: 'cat1',
				name: 'HTML & CSS',
				status: 'mastered',
				progress: 100,
				lastPracticed: '1 week ago',
				questionsAttempted: 34,
			},
			{
				id: 'cat2',
				name: 'Microsoft Access',
				status: 'mastered',
				progress: 100,
				lastPracticed: '5 days ago',
				questionsAttempted: 30,
			},
			{
				id: 'cat3',
				name: 'Visual Basic',
				status: 'in-progress',
				progress: 50,
				lastPracticed: 'Yesterday',
				questionsAttempted: 18,
			},
			{
				id: 'cat4',
				name: 'Word Processing',
				status: 'in-progress',
				progress: 75,
				lastPracticed: '2 days ago',
				questionsAttempted: 24,
			},
			{
				id: 'cat5',
				name: 'Spreadsheets',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'cat6',
				name: 'Presentations',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'cat7',
				name: 'Internet Technologies',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'cat8',
				name: 'Systems Technologies',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
		],
	},
	{
		id: 'religious-studies',
		name: 'Religious Studies',
		color: 'bg-amber-600',
		icon: '🕊️',
		topics: [
			{
				id: 'rs1',
				name: 'World Religions',
				status: 'mastered',
				progress: 100,
				lastPracticed: '2 weeks ago',
				questionsAttempted: 28,
			},
			{
				id: 'rs2',
				name: 'Christianity',
				status: 'in-progress',
				progress: 60,
				lastPracticed: '3 days ago',
				questionsAttempted: 18,
			},
			{
				id: 'rs3',
				name: 'Islam',
				status: 'in-progress',
				progress: 35,
				lastPracticed: 'Yesterday',
				questionsAttempted: 12,
			},
			{
				id: 'rs4',
				name: 'African Traditional',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'rs5',
				name: 'Hinduism',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'rs6',
				name: 'Judaism',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'rs7',
				name: 'Ethics',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
			{
				id: 'rs8',
				name: 'Philosophy',
				status: 'not-started',
				progress: 0,
				questionsAttempted: 0,
			},
		],
	},
];

function ProgressStats({ subjects }: { subjects: Subject[] }) {
	const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
	const masteredTopics = subjects.reduce(
		(acc, s) => acc + s.topics.filter((t) => t.status === 'mastered').length,
		0
	);
	const inProgressTopics = subjects.reduce(
		(acc, s) => acc + s.topics.filter((t) => t.status === 'in-progress').length,
		0
	);
	const overallProgress =
		Math.round(((masteredTopics * 100 + inProgressTopics * 50) / totalTopics) * 100) / 100;
	const totalQuestions = subjects.reduce(
		(acc, s) => acc + s.topics.reduce((a, t) => a + t.questionsAttempted, 0),
		0
	);

	return (
		<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
			{[
				{
					label: 'Overall',
					value: `${overallProgress}%`,
					icon: BarChartSquare01Icon,
					color: 'text-primary',
				},
				{
					label: 'Mastered',
					value: masteredTopics.toString(),
					icon: Tick01Icon,
					color: 'text-success',
				},
				{
					label: 'In Progress',
					value: inProgressTopics.toString(),
					icon: FireIcon,
					color: 'text-warning',
				},
				{
					label: 'Questions',
					value: totalQuestions.toString(),
					icon: GridIcon,
					color: 'text-info',
				},
			].map((stat, idx) => (
				<m.div
					key={stat.label}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: idx * 0.1 }}
					className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-border/30 shadow-tiimo"
				>
					<div className="flex items-center gap-2 mb-1">
						<HugeiconsIcon icon={stat.icon} className={cn('w-4 h-4', stat.color)} />
						<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
							{stat.label}
						</span>
					</div>
					<div className="text-2xl font-black text-foreground">{stat.value}</div>
				</m.div>
			))}
		</div>
	);
}

function SubjectSection({
	subject,
	index,
	expanded,
	onToggle,
}: {
	subject: Subject;
	index: number;
	expanded: boolean;
	onToggle: () => void;
}) {
	const masteredCount = subject.topics.filter((t) => t.status === 'mastered').length;
	const inProgressCount = subject.topics.filter((t) => t.status === 'in-progress').length;
	const progressValue = Math.round(
		(masteredCount * 100 + inProgressCount * 50) / subject.topics.length
	);

	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1 }}
			className="space-y-4"
		>
			<button
				type="button"
				onClick={onToggle}
				className="w-full flex items-center justify-between p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-border/40 shadow-tiimo hover:shadow-tiimo-lg transition-all group"
			>
				<div className="flex items-center gap-4">
					<div
						className={cn(
							'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg',
							subject.color
						)}
					>
						{subject.icon}
					</div>
					<div className="text-left">
						<h2 className="text-lg font-black uppercase tracking-tight">{subject.name}</h2>
						<p className="text-xs font-semibold text-muted-foreground">
							{masteredCount} mastered · {inProgressCount} in progress ·{' '}
							{subject.topics.length - masteredCount - inProgressCount} locked
						</p>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="w-24 hidden sm:block">
						<Progress value={progressValue} className="h-2" />
						<span className="text-[10px] font-bold text-muted-foreground text-center block mt-1">
							{progressValue}%
						</span>
					</div>
					<div
						className={cn(
							'w-10 h-10 rounded-full flex items-center justify-center bg-secondary group-hover:bg-primary/10 transition-colors',
							expanded && 'rotate-180'
						)}
					>
						<HugeiconsIcon icon={ChevronDown01Icon} className="w-5 h-5 text-muted-foreground" />
					</div>
				</div>
			</button>

			<AnimatePresence>
				{expanded && (
					<m.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.3 }}
						className="space-y-3 pl-4"
					>
						{subject.topics.map((topic, tIdx) => (
							<m.div
								key={topic.id}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: tIdx * 0.05 }}
							>
								<TopicCard topic={topic} subjectColor={subject.color} />
							</m.div>
						))}
					</m.div>
				)}
			</AnimatePresence>
		</m.div>
	);
}

function TopicCard({ topic, subjectColor }: { topic: Topic; subjectColor: string }) {
	const router = useRouter();
	const statusColors = {
		mastered: 'bg-success-soft border-success/20',
		'in-progress': 'bg-warning-soft border-warning/20',
		'not-started': 'bg-muted/50 border-border/30',
	};

	return (
		<Card
			className={cn(
				'p-4 rounded-2xl border-2 transition-all group hover:scale-[1.01] cursor-pointer',
				statusColors[topic.status]
			)}
		>
			<div className="flex items-center justify-between gap-4">
				<div className="flex items-center gap-4 flex-1 min-w-0">
					<div
						className={cn(
							'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2',
							topic.status === 'mastered'
								? subjectColor
								: topic.status === 'in-progress'
									? 'bg-muted border-primary'
									: 'bg-muted border-muted-foreground/30'
						)}
					>
						{topic.status === 'mastered' && (
							<HugeiconsIcon icon={Tick01Icon} className="w-4 h-4 text-white" />
						)}
						{topic.status === 'in-progress' && (
							<div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
						)}
						{topic.status === 'not-started' && (
							<HugeiconsIcon icon={BookOpen01Icon} className="w-4 h-4 text-muted-foreground" />
						)}
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-bold text-sm truncate">{topic.name}</h3>
						{topic.status !== 'not-started' && (
							<div className="flex items-center gap-2 mt-1">
								<Progress value={topic.progress} className="flex-1 h-1.5" />
								<span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
									{topic.progress}% · {topic.questionsAttempted} Qs
								</span>
							</div>
						)}
					</div>
				</div>

				<div className="flex items-center gap-2">
					{topic.status === 'mastered' && (
						<div className="flex items-center gap-1 text-warning mr-2">
							<HugeiconsIcon icon={StarIcon} className="w-4 h-4 fill-current" />
						</div>
					)}
					{topic.status !== 'not-started' && (
						<Button
							size="sm"
							variant={topic.status === 'mastered' ? 'outline' : 'default'}
							className="rounded-full font-bold text-xs px-4 shrink-0"
							onClick={(e) => {
								e.stopPropagation();
								router.push(`/quiz?topic=${topic.id}`);
							}}
						>
							{topic.status === 'mastered' ? 'Review' : 'Continue'}
						</Button>
					)}
				</div>
			</div>
		</Card>
	);
}

export default function CurriculumMap() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<TopicStatus | 'all'>('all');
	const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
		new Set(CURRICULUM_DATA.slice(0, 2).map((s) => s.id))
	);

	const filteredSubjects = useMemo(() => {
		return CURRICULUM_DATA.map((subject) => ({
			...subject,
			topics: subject.topics.filter((topic) => {
				const matchesSearch =
					subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					topic.name.toLowerCase().includes(searchQuery.toLowerCase());
				const matchesFilter = statusFilter === 'all' || topic.status === statusFilter;
				return matchesSearch && matchesFilter;
			}),
		})).filter((subject) => subject.topics.length > 0);
	}, [searchQuery, statusFilter]);

	const filteredStats = useMemo(() => {
		const allTopics = filteredSubjects.flatMap((s) => s.topics);
		const total = allTopics.length;
		const mastered = allTopics.filter((t) => t.status === 'mastered').length;
		const inProgress = allTopics.filter((t) => t.status === 'in-progress').length;
		const questions = allTopics.reduce((acc, t) => acc + t.questionsAttempted, 0);
		return { total, mastered, inProgress, questions };
	}, [filteredSubjects]);

	const toggleSubject = (id: string) => {
		setExpandedSubjects((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const expandAll = () => setExpandedSubjects(new Set(filteredSubjects.map((s) => s.id)));
	const collapseAll = () => setExpandedSubjects(new Set());

	const hasActiveFilters = searchQuery || statusFilter !== 'all';

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			<header className="px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between shrink-0 max-w-4xl mx-auto w-full">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.back()}
					className="rounded-full shrink-0"
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />
				</Button>
				<h1 className="text-lg sm:text-xl font-black tracking-tight truncate px-2">
					Curriculum Map
				</h1>
				<div className="flex gap-1 shrink-0">
					<Button variant="ghost" size="sm" onClick={expandAll} className="text-xs font-bold">
						Expand
					</Button>
					<Button variant="ghost" size="sm" onClick={collapseAll} className="text-xs font-bold">
						Collapse
					</Button>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-4 sm:px-6 py-4 pb-40 max-w-4xl mx-auto w-full">
					<div className="mb-2">
						<h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">
							CAPS Grade 12
						</h2>
						<p className="text-xs text-muted-foreground/70">Track your NSC syllabus progress</p>
					</div>

					<div className="space-y-3 mb-6">
						<div className="relative">
							<HugeiconsIcon
								icon={Search01Icon}
								className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
							/>
							<input
								type="text"
								placeholder="Search subjects or topics..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => setSearchQuery('')}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								>
									<HugeiconsIcon icon={CloseIcon} className="w-4 h-4" />
								</button>
							)}
						</div>

						<div className="flex gap-2 flex-wrap">
							<button
								type="button"
								onClick={() => setStatusFilter('all')}
								className={cn(
									'px-3 py-1.5 rounded-full text-xs font-bold transition-all',
									statusFilter === 'all'
										? 'bg-primary text-white'
										: 'bg-white border border-border text-muted-foreground hover:border-primary/50'
								)}
							>
								All ({CURRICULUM_DATA.reduce((acc, s) => acc + s.topics.length, 0)})
							</button>
							<button
								type="button"
								onClick={() => setStatusFilter('mastered')}
								className={cn(
									'px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5',
									statusFilter === 'mastered'
										? 'bg-success text-white'
										: 'bg-white border border-border text-muted-foreground hover:border-success/50'
								)}
							>
								<HugeiconsIcon icon={Tick01Icon} className="w-3 h-3" />
								Mastered (
								{CURRICULUM_DATA.reduce(
									(acc, s) => acc + s.topics.filter((t) => t.status === 'mastered').length,
									0
								)}
								)
							</button>
							<button
								type="button"
								onClick={() => setStatusFilter('in-progress')}
								className={cn(
									'px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5',
									statusFilter === 'in-progress'
										? 'bg-warning text-white'
										: 'bg-white border border-border text-muted-foreground hover:border-warning/50'
								)}
							>
								<div className="w-2 h-2 rounded-full bg-current" />
								In Progress (
								{CURRICULUM_DATA.reduce(
									(acc, s) => acc + s.topics.filter((t) => t.status === 'in-progress').length,
									0
								)}
								)
							</button>
							<button
								type="button"
								onClick={() => setStatusFilter('not-started')}
								className={cn(
									'px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5',
									statusFilter === 'not-started'
										? 'bg-muted-foreground text-white'
										: 'bg-white border border-border text-muted-foreground hover:border-muted-foreground/50'
								)}
							>
								<HugeiconsIcon icon={BookOpen01Icon} className="w-3 h-3" />
								Not Started (
								{CURRICULUM_DATA.reduce(
									(acc, s) => acc + s.topics.filter((t) => t.status === 'not-started').length,
									0
								)}
								)
							</button>
						</div>

						{hasActiveFilters && (
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span>
									Showing {filteredStats.total} topics
									{searchQuery && ` for "${searchQuery}"`}
									{statusFilter !== 'all' && ` (${statusFilter})`}
								</span>
								<button
									type="button"
									onClick={() => {
										setSearchQuery('');
										setStatusFilter('all');
									}}
									className="text-primary hover:underline font-medium"
								>
									Clear filters
								</button>
							</div>
						)}
					</div>

					<ProgressStats subjects={hasActiveFilters ? filteredSubjects : CURRICULUM_DATA} />

					{filteredSubjects.length === 0 ? (
						<div className="text-center py-12">
							<div className="text-4xl mb-3">🔍</div>
							<h3 className="font-bold text-lg mb-1">No topics found</h3>
							<p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
						</div>
					) : (
						<div className="space-y-4">
							{filteredSubjects.map((subject, idx) => (
								<SubjectSection
									key={subject.id}
									subject={subject}
									index={idx}
									expanded={expandedSubjects.has(subject.id)}
									onToggle={() => toggleSubject(subject.id)}
								/>
							))}
						</div>
					)}
				</main>
			</ScrollArea>
		</div>
	);
}
