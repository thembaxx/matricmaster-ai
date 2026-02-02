import type { Screen } from '@/types';

interface ChannelsProps {
	onNavigate: (s: Screen) => void;
}

export default function Channels({ onNavigate }: ChannelsProps) {
	return (
		<div className="flex-1 overflow-y-auto no-scrollbar bg-background-light dark:bg-background-dark pb-24">
			<header className="px-6 pt-12 pb-4 sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md z-20">
				<div className="flex items-center gap-4 mb-4">
					<button
						type="button"
						onClick={() => onNavigate('DASHBOARD')}
						className="material-symbols-rounded text-zinc-500"
					>
						arrow_back
					</button>
					<div>
						<h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Channels</h1>
						<p className="text-sm text-zinc-500 font-medium">Connect with Grade 12 peers</p>
					</div>
				</div>

				<div className="mt-6 flex gap-2">
					<div className="flex-1 bg-zinc-100 dark:bg-zinc-800 h-12 rounded-2xl flex items-center px-4">
						<span className="material-symbols-rounded text-zinc-400">search</span>
						<input className="bg-transparent border-none focus:ring-0 text-sm w-full" placeholder="Find subjects..." />
					</div>
					<button
						type="button"
						className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500"
					>
						<span className="material-symbols-rounded">tune</span>
					</button>
				</div>
			</header>

			<main className="px-6 mt-4">
				<h3 className="text-lg font-bold mb-4 text-zinc-900 dark:text-white">My Channels</h3>
				<div className="flex gap-4 overflow-x-auto no-scrollbar mb-8">
					{[
						{ name: "Matric '24", active: true },
						{ name: 'Maths Lit', active: false },
						{ name: 'Geography', active: false },
					].map((ch) => (
						<div key={ch.name} className="flex flex-col items-center gap-2 group cursor-pointer">
							<div className={`w-16 h-16 rounded-full border-2 p-1 transition-all ${ch.active ? 'border-accent-blue' : 'border-transparent'}`}>
								<div className="w-full h-full rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
									<span className="material-symbols-rounded text-zinc-400">groups</span>
								</div>
							</div>
							<span className="text-[10px] font-bold text-center w-full truncate">{ch.name}</span>
						</div>
					))}
					<div className="flex flex-col items-center gap-2">
						<div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
							<span className="material-symbols-rounded text-zinc-300">add</span>
						</div>
						<span className="text-[10px] font-bold text-zinc-400">Join New</span>
					</div>
				</div>

				<h3 className="text-lg font-bold mb-4 text-zinc-900 dark:text-white">Explore Channels</h3>
				<div className="space-y-4">
					<div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 group hover:border-accent-blue/30 transition-all cursor-pointer">
						<div className="flex justify-between items-start mb-4">
							<div className="flex gap-3">
								<div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-accent-blue">
									<span className="material-symbols-rounded">science</span>
								</div>
								<div>
									<h4 className="font-bold text-zinc-900 dark:text-white">Physical Sciences P1</h4>
									<p className="text-[10px] text-zinc-500 font-medium">1.2k members • Active Now</p>
								</div>
							</div>
							<button type="button" className="px-4 py-1.5 bg-accent-blue text-white text-xs font-bold rounded-full">
								Join
							</button>
						</div>
						<div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl text-xs text-zinc-600 dark:text-zinc-400">
							<span className="font-bold text-zinc-900 dark:text-zinc-200">Thabo M:</span> Can someone explain Newton's 2nd
							Law active forces? I'm struggling with...
						</div>
					</div>

					<div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 group hover:border-accent-blue/30 transition-all cursor-pointer opacity-80">
						<div className="flex justify-between items-start">
							<div className="flex gap-3">
								<div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-500">
									<span className="material-symbols-rounded">calculate</span>
								</div>
								<div>
									<h4 className="font-bold text-zinc-900 dark:text-white">Accounting Tips</h4>
									<p className="text-[10px] text-zinc-500 font-medium">850 members</p>
								</div>
							</div>
							<button type="button" className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-bold rounded-full">
								View
							</button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
