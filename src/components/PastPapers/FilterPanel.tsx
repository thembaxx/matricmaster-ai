import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import type { FilterState } from '@/hooks/usePastPapers';

interface FilterContentProps {
	availableSubjects: string[];
	availablePapers: string[];
	availableMonths: string[];
	filterState: FilterState;
	dispatch: any;
}

const FilterContent = memo(function FilterContent({
	availableSubjects,
	availablePapers,
	availableMonths,
	filterState,
	dispatch,
}: FilterContentProps) {
	return (
		<div className="space-y-8">
			<div className="space-y-4">
				<h4 className="text-[10px] font-black  tracking-[0.2em] text-label-tertiary">subjects</h4>
				<div className="grid grid-cols-2 gap-3">
					{availableSubjects.map((subject) => (
						<div key={subject} className="flex items-center gap-3 cursor-pointer ios-active-scale">
							<Checkbox
								id={`subject-${subject}`}
								checked={filterState.selectedSubjects.includes(subject)}
								onCheckedChange={() => dispatch({ type: 'TOGGLE_SUBJECT', payload: subject })}
							/>
							<label
								htmlFor={`subject-${subject}`}
								className="text-sm font-black  tracking-tight cursor-pointer text-label-secondary"
							>
								{subject}
							</label>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-4">
				<h4 className="text-[10px] font-black  tracking-[0.2em] text-label-tertiary">papers</h4>
				<div className="grid grid-cols-2 gap-3">
					{availablePapers.map((paper) => (
						<div key={paper} className="flex items-center gap-3 cursor-pointer ios-active-scale">
							<Checkbox
								id={`paper-${paper}`}
								checked={filterState.selectedPapers.includes(paper)}
								onCheckedChange={() => dispatch({ type: 'TOGGLE_PAPER', payload: paper })}
							/>
							<label
								htmlFor={`paper-${paper}`}
								className="text-sm font-black  tracking-tight cursor-pointer text-label-secondary"
							>
								{paper}
							</label>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-4">
				<h4 className="text-[10px] font-black  tracking-[0.2em] text-label-tertiary">months</h4>
				<div className="grid grid-cols-2 gap-3">
					{availableMonths.map((month) => (
						<div key={month} className="flex items-center gap-3 cursor-pointer ios-active-scale">
							<Checkbox
								id={`month-${month}`}
								checked={filterState.selectedMonths.includes(month)}
								onCheckedChange={() => dispatch({ type: 'TOGGLE_MONTH', payload: month })}
							/>
							<label
								htmlFor={`month-${month}`}
								className="text-sm font-black  tracking-tight cursor-pointer text-label-secondary"
							>
								{month}
							</label>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h4 className="text-[10px] font-black  tracking-[0.2em] text-label-tertiary">
							extracted only
						</h4>
						<p className="text-[10px] text-label-tertiary mt-1  tracking-wider">
							show papers with AI-extracted questions
						</p>
					</div>
					<Switch
						checked={filterState.extractedOnly}
						onCheckedChange={(v) => dispatch({ type: 'TOGGLE_EXTRACTED', payload: v })}
					/>
				</div>
			</div>

			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h4 className="text-[10px] font-black  tracking-[0.2em] text-label-tertiary">
							my bookmarks
						</h4>
						<p className="text-[10px] text-label-tertiary mt-1  tracking-wider">
							show only bookmarked papers
						</p>
					</div>
					<Switch
						checked={filterState.bookmarkedOnly}
						onCheckedChange={() => dispatch({ type: 'TOGGLE_BOOKMARKED' })}
					/>
				</div>
			</div>
		</div>
	);
});

interface FilterPanelProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	availableSubjects: string[];
	availablePapers: string[];
	availableMonths: string[];
	filterState: FilterState;
	dispatch: any;
	onReset: () => void;
}

export function FilterPanel({
	isOpen,
	onOpenChange,
	availableSubjects,
	availablePapers,
	availableMonths,
	filterState,
	dispatch,
	onReset,
}: FilterPanelProps) {
	const content = (
		<FilterContent
			availableSubjects={availableSubjects}
			availablePapers={availablePapers}
			availableMonths={availableMonths}
			filterState={filterState}
			dispatch={dispatch}
		/>
	);

	return (
		<>
			<Sheet open={isOpen} onOpenChange={onOpenChange}>
				<SheetContent className="w-full sm:max-w-lg hidden lg:block">
					<SheetHeader>
						<SheetTitle className="text-xl font-black  tracking-tight">advanced filters</SheetTitle>
					</SheetHeader>
					<div className="py-6 overflow-y-auto">{content}</div>
					<div className="border-t pt-4 flex gap-3">
						<Button
							variant="outline"
							onClick={onReset}
							className="flex-1 rounded-2xl font-black text-[10px]  tracking-widest ios-active-scale"
						>
							reset
						</Button>
						<Button
							onClick={() => onOpenChange(false)}
							className="flex-1 rounded-2xl font-black text-[10px]  tracking-widest ios-active-scale"
						>
							apply filters
						</Button>
					</div>
				</SheetContent>
			</Sheet>

			<Drawer open={isOpen} onOpenChange={onOpenChange}>
				<DrawerContent className="lg:hidden">
					<DrawerHeader>
						<DrawerTitle className="text-xl font-black  tracking-tight text-left">
							advanced filters
						</DrawerTitle>
					</DrawerHeader>
					<div className="px-4 py-4 overflow-y-auto max-h-[60vh]">{content}</div>
					<DrawerFooter>
						<Button
							onClick={() => onOpenChange(false)}
							className="w-full rounded-2xl font-black text-[10px]  tracking-widest ios-active-scale"
						>
							apply filters
						</Button>
						<Button
							variant="outline"
							onClick={onReset}
							className="w-full rounded-2xl font-black text-[10px]  tracking-widest ios-active-scale"
						>
							reset
						</Button>
						<DrawerClose asChild>
							<Button variant="ghost" className="w-full ios-active-scale">
								cancel
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	);
}
