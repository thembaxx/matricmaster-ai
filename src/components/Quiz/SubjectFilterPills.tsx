'use client';

type SubjectFilterPillsProps = {
	subjects: string[];
	selectedSubject: string;
	onSelect: (subject: string) => void;
	getColor: (subject: string) => {
		bg: string;
		text: string;
	};
};

export function SubjectFilterPills({
	subjects,
	selectedSubject,
	onSelect,
	getColor,
}: SubjectFilterPillsProps) {
	return (
		<div className="w-full overflow-x-auto whitespace-nowrap pb-2">
			<div className="flex gap-2 px-1">
				{subjects.map((subject) => {
					const colors = getColor(subject);
					const isSelected = subject === selectedSubject;
					return (
						<button
							type="button"
							key={subject}
							onClick={() => onSelect(subject)}
							className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
								isSelected
									? `${colors.bg} text-white shadow-md scale-105`
									: 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
							}`}
						>
							{subject}
						</button>
					);
				})}
			</div>
		</div>
	);
}

export function getSubjectColor(subject: string) {
	switch (subject) {
		case 'Physical Sciences':
			return {
				bg: 'bg-physics',
				text: 'text-physics',
				border: 'border-physics',
				bgSoft: 'bg-physics/5',
				borderSoft: 'hover:border-physics/30',
				shadow: 'shadow-physics/20',
			};
		case 'Mathematics':
			return {
				bg: 'bg-math',
				text: 'text-math',
				border: 'border-math',
				bgSoft: 'bg-math/5',
				borderSoft: 'hover:border-math/30',
				shadow: 'shadow-math/20',
			};
		case 'Life Sciences':
			return {
				bg: 'bg-life-sci',
				text: 'text-life-sci',
				border: 'border-life-sci',
				bgSoft: 'bg-life-sci/5',
				borderSoft: 'hover:border-life-sci/30',
				shadow: 'shadow-life-sci/20',
			};
		case 'Accounting':
			return {
				bg: 'bg-accounting',
				text: 'text-accounting',
				border: 'border-accounting',
				bgSoft: 'bg-accounting/5',
				borderSoft: 'hover:border-accounting/30',
				shadow: 'shadow-accounting/20',
			};
		case 'English HL':
			return {
				bg: 'bg-english',
				text: 'text-english',
				border: 'border-english',
				bgSoft: 'bg-english/5',
				borderSoft: 'hover:border-english/30',
				shadow: 'shadow-english/20',
			};
		case 'Geography':
			return {
				bg: 'bg-geography',
				text: 'text-geography',
				border: 'border-geography',
				bgSoft: 'bg-geography/5',
				borderSoft: 'hover:border-geography/30',
				shadow: 'shadow-geography/20',
			};
		default:
			return {
				bg: 'bg-primary',
				text: 'text-primary',
				border: 'border-border',
				bgSoft: 'bg-primary/5',
				borderSoft: 'hover:border-primary/30',
				shadow: 'shadow-primary/10',
			};
	}
}
