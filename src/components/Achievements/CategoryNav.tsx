import { HugeiconsIcon } from '@hugeicons/react';

interface Category {
	id: string;
	label: string;
	icon: any;
}

export function CategoryNav({
	categories,
	activeTab,
	onTabChange,
}: {
	categories: Category[];
	activeTab: string;
	onTabChange: (id: string) => void;
}) {
	return (
		<div className="flex gap-2 sm:gap-4 p-1.5 sm:p-2 bg-muted/50 rounded-2xl sm:rounded-[2.5rem] border-2 border-border/50 max-w-fit mx-auto lg:mx-0 overflow-x-auto no-scrollbar">
			{categories.map((category) => {
				const Icon = category.icon;
				const isActive = activeTab === category.id;
				return (
					<button
						key={category.id}
						type="button"
						onClick={() => onTabChange(category.id)}
						aria-pressed={isActive}
						aria-label={`Faders by ${category.label}`}
						className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-3xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
							isActive
								? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-105'
								: 'text-muted-foreground hover:bg-muted hover:text-foreground'
						}`}
					>
						<HugeiconsIcon
							icon={Icon}
							aria-hidden="true"
							className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'scale-110' : ''}`}
						/>
						<span className="hidden xs:inline">{category.label}</span>
					</button>
				);
			})}
		</div>
	);
}
