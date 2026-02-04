import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Crown, Zap } from 'lucide-react';

// import type { Screen } from '@/types'; // Removed unused import

const topThree = [
	{
		rank: 2,
		name: 'Sipho N.',
		points: 2350,
		school: 'Parktown High',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sipho',
	},
	{
		rank: 1,
		name: 'Thabo M.',
		points: 2840,
		school: "St. John's College",
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo',
		isUser: true,
	},
	{
		rank: 3,
		name: 'Lerato K.',
		points: 2100,
		school: 'Roedean School',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lerato',
	},
];

const otherStudents = [
	{
		rank: 4,
		name: 'Jessica V.',
		points: 1950,
		school: 'Parktown Girls',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
	},
	{
		rank: 5,
		name: 'David M.',
		points: 1820,
		school: 'Jeppe High',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
	},
	{
		rank: 6,
		name: 'Emma L.',
		points: 1780,
		school: 'St. Marys',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
	},
	{
		rank: 7,
		name: 'James K.',
		points: 1650,
		school: 'KES',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
	},
	{
		rank: 8,
		name: 'Sarah P.',
		points: 1590,
		school: 'Roedean',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
	},
];

export default function Leaderboard() {
	const router = useRouter();
	return (
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-lexend">
			{/* Header */}
			<header className="px-6 pt-12 pb-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
				<div className="max-w-2xl mx-auto w-full">
					<div className="flex items-center gap-4 mb-6">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.push('/dashboard')}
							className="rounded-full"
						>
							<ArrowLeft className="w-5 h-5" />
						</Button>
						<h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Leaderboard</h1>
					</div>

					<Tabs defaultValue="school" className="w-full">
						<TabsList className="grid grid-cols-3 w-full bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl h-12">
							<TabsTrigger value="school" className="rounded-xl font-bold">
								School
							</TabsTrigger>
							<TabsTrigger value="provincial" className="rounded-xl font-bold">
								Provincial
							</TabsTrigger>
							<TabsTrigger value="national" className="rounded-xl font-bold">
								National
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="pb-32">
					{/* Top 3 Podium */}
					<div className="px-6 py-8">
						<div className="flex items-end justify-center gap-4">
							{/* Rank 2 */}
							<div className="flex flex-col items-center">
								<div className="relative mb-2">
									<Avatar className="w-16 h-16 border-2 border-zinc-300">
										<AvatarImage src={topThree[0].avatar} />
										<AvatarFallback>{topThree[0].name[0]}</AvatarFallback>
									</Avatar>
									<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-zinc-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
										2
									</div>
								</div>
								<span className="text-sm font-semibold text-zinc-900 dark:text-white">
									{topThree[0].name}
								</span>
								<span className="text-xs text-zinc-500">
									{topThree[0].points.toLocaleString()} KP
								</span>
								<div className="w-16 h-20 bg-gradient-to-t from-zinc-300 to-zinc-100 dark:from-zinc-700 dark:to-zinc-800 mt-2 rounded-t-lg" />
							</div>

							{/* Rank 1 */}
							<div className="flex flex-col items-center -mt-4">
								<div className="relative mb-2">
									<Crown className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-500" />
									<Avatar className="w-24 h-24 border-4 border-yellow-400">
										<AvatarImage src={topThree[1].avatar} />
										<AvatarFallback>{topThree[1].name[0]}</AvatarFallback>
									</Avatar>
									<div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-zinc-900 text-sm font-bold">
										1
									</div>
								</div>
								<span className="text-lg font-bold text-zinc-900 dark:text-white">
									{topThree[1].name}
								</span>
								<span className="text-sm text-yellow-600 font-semibold">
									{topThree[1].points.toLocaleString()} KP
								</span>
								<div className="w-20 h-28 bg-gradient-to-t from-yellow-200 to-yellow-50 dark:from-yellow-900/40 dark:to-yellow-900/20 mt-2 rounded-t-xl" />
							</div>

							{/* Rank 3 */}
							<div className="flex flex-col items-center">
								<div className="relative mb-2">
									<Avatar className="w-16 h-16 border-2 border-orange-400">
										<AvatarImage src={topThree[2].avatar} />
										<AvatarFallback>{topThree[2].name[0]}</AvatarFallback>
									</Avatar>
									<div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
										3
									</div>
								</div>
								<span className="text-sm font-semibold text-zinc-900 dark:text-white">
									{topThree[2].name}
								</span>
								<span className="text-xs text-zinc-500">
									{topThree[2].points.toLocaleString()} KP
								</span>
								<div className="w-16 h-16 bg-gradient-to-t from-orange-200 to-orange-100 dark:from-orange-900/40 dark:to-orange-900/20 mt-2 rounded-t-lg" />
							</div>
						</div>
					</div>

					{/* Other Students List */}
					<div className="px-6 max-w-2xl mx-auto w-full">
						<div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm overflow-hidden mb-12 border border-zinc-100 dark:border-zinc-800">
							{otherStudents.map((student, idx) => (
								<div key={student.rank}>
									<div className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
										<span className="w-8 text-center font-bold text-zinc-400">{student.rank}</span>
										<Avatar className="w-10 h-10">
											<AvatarImage src={student.avatar} />
											<AvatarFallback>{student.name[0]}</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<h4 className="font-semibold text-sm text-zinc-900 dark:text-white">
												{student.name}
											</h4>
											<p className="text-xs text-zinc-500">{student.school}</p>
										</div>
										<div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-800 p-1.5 px-3 rounded-full">
											<Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
											<span className="font-black text-sm">{student.points.toLocaleString()}</span>
										</div>
									</div>
									{idx < otherStudents.length - 1 && (
										<div className="h-px bg-zinc-50 dark:bg-zinc-800 mx-4" />
									)}
								</div>
							))}
						</div>
					</div>
				</main>
			</ScrollArea>

			{/* Your Rank Card */}
			<div className="absolute bottom-8 left-0 right-0 px-6 max-w-2xl mx-auto z-10 pointer-events-none">
				<Card className="p-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xl rounded-[2rem] border-none pointer-events-auto">
					<div className="flex items-center gap-4">
						<span className="text-2xl font-black text-yellow-400 w-8">42</span>
						<Avatar className="w-14 h-14 border-2 border-yellow-400 p-0.5">
							<AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo" />
							<AvatarFallback>TM</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<p className="font-bold text-lg leading-tight">Your Rank</p>
							<p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
								Top 15% • 5 Day Streak
							</p>
						</div>
						<div className="text-right bg-white/10 dark:bg-zinc-100 p-2 rounded-2xl px-3">
							<div className="flex items-center gap-1 justify-end">
								<Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
								<span className="font-black text-xl">1,250</span>
							</div>
							<p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">KP</p>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
