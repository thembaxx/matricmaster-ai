import { GridIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import PeriodicTable from '@/screens/PeriodicTable';

interface UtilityDrawerProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	subject?: string;
}

export function UtilityDrawer({ isOpen, setIsOpen, subject }: UtilityDrawerProps) {
	const isChemistry =
		subject?.toLowerCase().includes('chemistry') ||
		subject?.toLowerCase().includes('physical sciences');

	if (!isChemistry) return null;

	return (
		<Drawer open={isOpen} onOpenChange={setIsOpen}>
			<DrawerTrigger asChild>
				<Button
					variant="secondary"
					className="fixed bottom-24 right-6 rounded-full w-12 h-12 p-0 shadow-lg z-40 bg-card border-2 border-primary/20 hover:border-primary transition-all"
					title="Periodic Table"
				>
					<HugeiconsIcon icon={GridIcon} className="w-5 h-5 text-primary" />
				</Button>
			</DrawerTrigger>
			<DrawerContent className="h-[90vh]">
				<DrawerHeader className="flex-row items-center justify-between">
					<DrawerTitle>Periodic Table</DrawerTitle>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsOpen(false)}
						className="rounded-full"
					>
						Close
					</Button>
				</DrawerHeader>
				<div className="flex-1 overflow-hidden">
					<PeriodicTable />
				</div>
			</DrawerContent>
		</Drawer>
	);
}
