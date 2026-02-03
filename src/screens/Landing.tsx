import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Screen } from '@/types';
import {
	Atom,
	BarChart3,
	BookOpen,
	Calculator,
	Calendar,
	ChevronRight,
	Globe,
	GraduationCap,
	Home,
	Microscope,
	Star,
	Trophy,
	User,
	Users,
} from 'lucide-react';
import { useState } from 'react';

interface LandingProps {
	onNavigate: (s: Screen) => void;
}

const subjects = [
	{ name: 'Mathematics', papers: '250+', icon: Calculator, color: 'bg-blue-500' },
	{ name: 'Physical Sciences', papers: '180+', icon: Atom, color: 'bg-purple-500' },
	{ name: 'Life Sciences', papers: '210+', icon: Microscope, color: 'bg-green-500' },
	{ name: 'English FAL', papers: '300+', icon: BookOpen, color: 'bg-pink-500' },
];

const features = [
	{ icon: Globe, title: '11 Languages', desc: 'Study in your home language' },
	{ icon: Calendar, title: '2010-2023', desc: '10+ years of past papers' },
	{ icon: Users, title: '50K+ Students', desc: 'Join the community' },
	{ icon: Star, title: 'AI-Powered', desc: 'Personalized learning paths' },
];

export default function Landing({ onNavigate }: LandingProps) {
	const [activeTab, setActiveTab] = useState('home');

	return (
		<div className="flex flex-col min-h-screen bg-background">
			<ScrollArea className="flex-1">
				<main className="pb-24">
					{/* Hero Section */}
					<section className="px-6 pt-12 pb-8 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/30 dark:to-background">
						<div className="text-center mb-8">
							<h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
								Master your Matrics through practice
							</h1>
							<p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6">
								Access past papers, AI-powered tutoring, and personalized study plans
							</p>
							<Button
								size="lg"
								className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
								onClick={() => onNavigate('STUDY_PLAN')}
							>
								Get Started
								<ChevronRight className="w-5 h-5 ml-2" />
							</Button>
						</div>

						{/* App Preview */}
						<div className="relative mx-auto w-full max-w-sm">
							<div className="aspect-[4/3] bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center">
								<div className="text-white text-center">
									<Trophy className="w-16 h-16 mx-auto mb-4" />
									<p className="text-xl font-bold">MatricMaster AI</p>
								</div>
							</div>
							{/* Floating Elements */}
							<div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-2xl rotate-12 flex items-center justify-center shadow-lg">
								<Star className="w-8 h-8 text-yellow-800" />
							</div>
							<div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-2xl -rotate-12 flex items-center justify-center shadow-lg">
								<Trophy className="w-8 h-8 text-green-800" />
							</div>
						</div>
					</section>

					{/* Quick Access Subjects */}
					<section className="px-6 py-8">
						<h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Quick Access</h2>
						<div className="grid grid-cols-2 gap-4">
							{subjects.map((subject) => (
								<Card
									key={subject.name}
									className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
									onClick={() => onNavigate('QUIZ')}
								>
									<div
										className={`w-12 h-12 rounded-xl ${subject.color} flex items-center justify-center mb-3`}
									>
										<subject.icon className="w-6 h-6 text-white" />
									</div>
									<h3 className="font-semibold text-zinc-900 dark:text-white">{subject.name}</h3>
									<p className="text-sm text-zinc-500">{subject.papers} Papers</p>
								</Card>
							))}
						</div>
					</section>

					{/* Why Choose Us */}
					<section className="px-6 py-8 bg-zinc-50 dark:bg-zinc-900/50">
						<h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Why Choose Us</h2>
						<div className="grid grid-cols-2 gap-4">
							{features.map((feature) => (
								<Card key={feature.title} className="p-4">
									<feature.icon className="w-8 h-8 text-blue-500 mb-3" />
									<h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
										{feature.title}
									</h3>
									<p className="text-xs text-zinc-500">{feature.desc}</p>
								</Card>
							))}
						</div>
					</section>

					{/* Community Question of the Day */}
					<section className="px-6 py-8">
						<h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
							Community Question of the Day
						</h2>
						<Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-0">
							<Badge className="mb-3">Mathematics</Badge>
							<p className="font-medium text-zinc-900 dark:text-white mb-2">
								Find the derivative of f(x) = 3x³ + 2x² - 5x + 7
							</p>
							<p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
								234 students attempted today
							</p>
							<Button variant="outline" onClick={() => onNavigate('QUIZ')}>
								Try It Now
							</Button>
						</Card>
					</section>
				</main>
			</ScrollArea>

			{/* Bottom Navigation */}
			<nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-6 py-3">
				<div className="flex justify-around items-center">
					{[
						{ id: 'home', icon: Home, label: 'Home' },
						{ id: 'courses', icon: GraduationCap, label: 'Courses' },
						{ id: 'rank', icon: BarChart3, label: 'Rank' },
						{ id: 'profile', icon: User, label: 'Profile' },
					].map((item) => (
						<button
							type="button"
							key={item.id}
							onClick={() => {
								setActiveTab(item.id);
								if (item.id === 'profile') onNavigate('PROFILE');
								if (item.id === 'rank') onNavigate('LEADERBOARD');
							}}
							className={`flex flex-col items-center gap-1 ${
								activeTab === item.id ? 'text-blue-600' : 'text-zinc-400'
							}`}
						>
							<item.icon className="w-5 h-5" />
							<span className="text-[10px] font-medium">{item.label}</span>
						</button>
					))}
				</div>
			</nav>
		</div>
	);
}
