'use client';

import { SearchIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export function SearchInput({
	value,
	onChange,
	placeholder = 'Search...',
	className,
	disabled = false,
}: SearchInputProps) {
	return (
		<div className={cn('relative', className)}>
			<HugeiconsIcon
				icon={SearchIcon}
				className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-2"
			/>

			<Input
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
				className="pl-9 pr-9"
			/>
			{value && (
				<button
					type="button"
					onClick={() => onChange('')}
					className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors z-2"
					aria-label="Clear search"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<title>Clear</title>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			)}
		</div>
	);
}
