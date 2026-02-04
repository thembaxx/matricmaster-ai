import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import {
	ArrowLeft,
	Calculator,
	CheckCircle2,
	Image as ImageIcon,
	MoreHorizontal,
	Send,
	Users,
} from 'lucide-react';

// import type { Screen } from '@/types'; // Removed unused import

const messages = [
	{
		id: 1,
		user: 'Sarah M.',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
		message: "Can someone help me with question 3.2? I'm stuck on the integration part.",
		time: '2:30 PM',
		isTutor: false,
	},
	{
		id: 2,
		user: 'Mr. Johnson',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Johnson',
		message: 'Remember to use substitution method. Let u = x² + 1, then du = 2x dx.',
		time: '2:32 PM',
		isTutor: true,
	},
	{
		id: 3,
		user: 'Thabo M.',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo',
		message: 'Thanks! That makes sense now. I was overcomplicating it.',
		time: '2:35 PM',
		isTutor: false,
		isMe: true,
	},
	{
		id: 4,
		user: 'Lisa K.',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
		message: "Here's a diagram that might help visualize the problem:",
		time: '2:36 PM',
		isTutor: false,
		hasImage: true,
	},
];

export default function Channels() {
	const router = useRouter();
	return (
		<div className="flex flex-col h-full bg-background relative">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white dark:bg-zinc-900 sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<div className="flex-1">
						<h1 className="text-lg font-bold text-zinc-900 dark:text-white">
							Mathematics P1 Study Group
						</h1>
						<div className="flex items-center gap-2 text-sm text-zinc-500">
							<Users className="w-4 h-4" />
							<span>1,247 members</span>
						</div>
					</div>
					<Button variant="ghost" size="icon">
						<MoreHorizontal className="w-5 h-5" />
					</Button>
				</div>
			</header>

			{/* Messages */}
			<ScrollArea className="flex-1">
				<main className="px-6 py-6 space-y-6">
					{messages.map((msg) => (
						<div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
							<img src={msg.avatar} alt={msg.user} className="w-10 h-10 rounded-full bg-zinc-100" />
							<div className={`flex-1 ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
								<div className="flex items-center gap-2 mb-1">
									<span
										className={`text-sm font-semibold ${msg.isMe ? 'text-blue-600' : 'text-zinc-900 dark:text-white'}`}
									>
										{msg.user}
									</span>
									{msg.isTutor && (
										<Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700">
											<CheckCircle2 className="w-3 h-3 mr-1" />
											Tutor
										</Badge>
									)}
									<span className="text-xs text-zinc-400">{msg.time}</span>
								</div>
								<div
									className={`max-w-[80%] p-3 rounded-2xl ${
										msg.isMe
											? 'bg-blue-500 text-white rounded-br-none'
											: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-bl-none'
									}`}
								>
									<p className="text-sm">{msg.message}</p>
									{msg.hasImage && (
										<div className="mt-2 p-4 bg-white dark:bg-zinc-700 rounded-lg">
											<div className="w-full h-32 bg-zinc-200 dark:bg-zinc-600 rounded flex items-center justify-center">
												<ImageIcon className="w-8 h-8 text-zinc-400" />
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					))}
				</main>
			</ScrollArea>

			{/* Input Area */}
			<footer className="shrink-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-4">
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" className="shrink-0">
						<ImageIcon className="w-5 h-5 text-zinc-500" />
					</Button>
					<Button variant="ghost" size="icon" className="shrink-0">
						<Calculator className="w-5 h-5 text-zinc-500" />
					</Button>
					<div className="flex-1 relative">
						<input
							type="text"
							placeholder="Type a message..."
							className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<Button size="icon" className="shrink-0 rounded-full bg-blue-500 hover:bg-blue-600">
						<Send className="w-4 h-4" />
					</Button>
				</div>
			</footer>
		</div>
	);
}
