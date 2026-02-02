import type { Screen } from '@/types';

interface StudyPathProps {
	onNavigate: (s: Screen) => void;
}

const StudyPath: React.FC<StudyPathProps> = ({ onNavigate }) => {
	return (
		<div className="flex-1 overflow-y-auto no-scrollbar bg-background-light dark:bg-background-dark relative">
			{/* Header */}
			<div className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-4 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800">
				<button
					type="button"
					onClick={() => onNavigate('DASHBOARD')}
					className="material-symbols-rounded text-zinc-500"
				>
					arrow_back
				</button>
				<h2 className="font-bold text-zinc-900 dark:text-white">My Physics Path</h2>
				<div className="flex items-center gap-1 text-accent-yellow">
					<span className="material-symbols-rounded text-sm">bolt</span>
					<span className="text-xs font-bold">12%</span>
				</div>
			</div>

			{/* Quest Map */}
			<div className="relative flex flex-col items-center py-20 min-h-[1200px]">
				{/* Winding Line SVG */}
				<svg className="absolute top-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 400 1200">
					<path
						d="M 200 0 C 200 200, 100 300, 100 500 C 100 700, 300 800, 300 1000"
						stroke="#a1a1aa"
						strokeWidth="6"
						fill="none"
						strokeDasharray="12 12"
					/>
				</svg>

				{/* Nodes */}
				<div className="flex flex-col items-center gap-32 relative z-10 w-full">
					{/* Node 1: Locked Future */}
					<div className="flex flex-col items-center opacity-40">
						<div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 border-4 border-white flex items-center justify-center shadow-md">
							<span className="material-symbols-rounded text-zinc-500">lock</span>
						</div>
						<span className="text-xs font-bold mt-2 text-zinc-500">Electromagnetism</span>
					</div>

					{/* Node 2: Next (Current) */}
					<div className="flex flex-col items-center relative -translate-x-12">
						<button
							type="button"
							onClick={() => onNavigate('QUIZ')}
							className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-blue to-blue-700 flex items-center justify-center shadow-xl border-4 border-white dark:border-zinc-900 animate-float relative"
						>
							<span className="material-symbols-rounded text-white text-4xl">deployed_code</span>
							<div className="absolute -top-2 -right-2 bg-accent-yellow text-[10px] font-black px-2 py-0.5 rounded-full border border-white">
								NEXT
							</div>
						</button>
						<div className="mt-4 bg-white dark:bg-zinc-800 px-4 py-2 rounded-xl shadow-lg border border-blue-50 text-center w-36">
							<p className="text-xs font-bold text-zinc-900 dark:text-white">Calculus P1</p>
							<div className="w-full bg-zinc-100 h-1 rounded-full mt-2 overflow-hidden">
								<div className="bg-accent-blue h-full w-1/3" />
							</div>
						</div>
					</div>

					{/* Node 3: Completed */}
					<div className="flex flex-col items-center">
						<div className="w-16 h-16 rounded-full bg-accent-green flex items-center justify-center border-4 border-white shadow-lg">
							<span className="material-symbols-rounded text-white">check</span>
						</div>
						<span className="text-xs font-bold mt-2 text-zinc-500">Intro to Functions</span>
					</div>

					{/* Node 4: Completed Start */}
					<div className="flex flex-col items-center translate-x-16">
						<div className="w-16 h-16 rounded-full bg-accent-green flex items-center justify-center border-4 border-white shadow-lg">
							<span className="material-symbols-rounded text-white">check</span>
						</div>
						<span className="text-xs font-bold mt-2 text-zinc-500">Algebra Basics</span>
					</div>
				</div>
			</div>

			{/* Fixed Footer Action */}
			<div className="sticky bottom-24 w-full px-6 z-30">
				<button
					type="button"
					onClick={() => onNavigate('QUIZ')}
					className="w-full bg-accent-blue py-4 rounded-2xl text-white font-bold shadow-lg shadow-blue-500/20 flex items-center justify-between px-6"
				>
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
							<span className="material-symbols-rounded text-sm">play_arrow</span>
						</div>
						<div className="text-left">
							<p className="text-sm font-bold">Resume: Calculus P1</p>
							<p className="text-[10px] opacity-80">Estimated time: 15 mins</p>
						</div>
					</div>
					<span className="material-symbols-rounded">chevron_right</span>
				</button>
			</div>
		</div>
	);
};

export default StudyPath;
