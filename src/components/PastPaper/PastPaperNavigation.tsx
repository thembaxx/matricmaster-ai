'use client';

interface PastPaperNavigationProps {
	activeTab: string;
	setActiveTab: (tab: string) => void;
}

export function PastPaperNavigation({ activeTab, setActiveTab }: PastPaperNavigationProps) {
	return (
		<div className="px-6 rounded-2xl absolute bottom-0 mb-24 left-0 right-0">
			<nav className="rounded-2xl ios-glass border-t border-border px-4 py-4">
				<div className="flex justify-around items-center">
					{[
						{ id: 'questions', label: 'Questions' },
						{ id: 'formulae', label: 'Formulae' },
						{ id: 'saved', label: 'Saved' },
						{ id: 'profile', label: 'Profile' },
					].map((item) => (
						<button
							type="button"
							key={item.id}
							onClick={() => setActiveTab(item.id)}
							className={`flex flex-col items-center gap-1 transition-all duration-300 ${
								activeTab === item.id ? 'text-brand-blue scale-110' : 'text-muted-foreground'
							}`}
						>
							<span
								className={`text-[10px] font-black uppercase tracking-wider ${
									activeTab === item.id ? 'text-brand-blue' : ''
								}`}
							>
								{item.label}
							</span>
						</button>
					))}
				</div>
			</nav>
		</div>
	);
}
