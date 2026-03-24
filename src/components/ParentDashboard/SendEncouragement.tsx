'use client';

import {
	HeartCheckIcon,
	SentIcon,
	SmileIcon,
	SparklesIcon,
	StarIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SendEncouragementProps {
	studentName: string;
	open: boolean;
	onClose: () => void;
}

const PRESET_MESSAGES = [
	{
		icon: StarIcon,
		label: 'Proud of you',
		message: "I'm so proud of your progress! Keep it up!",
		color: 'text-yellow-500',
		bg: 'bg-yellow-500/10',
	},
	{
		icon: HeartCheckIcon,
		label: 'Keep going',
		message: "You're doing great! Keep going, you've got this!",
		color: 'text-red-500',
		bg: 'bg-red-500/10',
	},
	{
		icon: SmileIcon,
		label: 'Good luck',
		message: 'Good luck on your exams! Believe in yourself!',
		color: 'text-success',
		bg: 'bg-success/10',
	},
	{
		icon: SparklesIcon,
		label: 'Amazing work',
		message: 'Amazing work this week! Your dedication is inspiring!',
		color: 'text-primary',
		bg: 'bg-primary/10',
	},
];

export function SendEncouragement({ studentName, open, onClose }: SendEncouragementProps) {
	const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
	const [customMessage, setCustomMessage] = useState('');
	const queryClient = useQueryClient();

	const sendMutation = useMutation({
		mutationFn: async (message: string) => {
			const res = await fetch('/api/parent-dashboard/encourage', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message, studentName }),
			});
			if (!res.ok) throw new Error('Failed to send');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['parent-alerts'] });
			toast.success(`Encouragement sent to ${studentName}!`);
			onClose();
			setSelectedPreset(null);
			setCustomMessage('');
		},
		onError: () => {
			toast.error('Failed to send encouragement');
		},
	});

	const handleSend = () => {
		const message =
			selectedPreset !== null ? PRESET_MESSAGES[selectedPreset].message : customMessage.trim();

		if (!message) {
			toast.error('Please select or write a message');
			return;
		}

		sendMutation.mutate(message);
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="rounded-[2rem] max-w-md">
				<DialogHeader>
					<DialogTitle className="text-xl font-black tracking-tight">
						Send Encouragement
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-5 py-2">
					<div>
						<Label className="text-[10px] font-bold text-muted-foreground  tracking-widest mb-3 block">
							Quick Messages
						</Label>
						<div className="grid grid-cols-2 gap-3">
							{PRESET_MESSAGES.map((preset, idx) => (
								<Button
									key={preset.label}
									type="button"
									variant="ghost"
									className={cn(
										'p-4 h-auto rounded-2xl border text-left',
										selectedPreset === idx
											? 'border-primary bg-primary/5 shadow-sm'
											: 'border-border/50 hover:border-border'
									)}
									onClick={() => {
										setSelectedPreset(idx);
										setCustomMessage('');
									}}
								>
									<div
										className={cn(
											'w-8 h-8 rounded-xl flex items-center justify-center mb-2',
											preset.bg
										)}
									>
										<HugeiconsIcon icon={preset.icon} className={cn('w-4 h-4', preset.color)} />
									</div>
									<p className="text-xs font-bold">{preset.label}</p>
									<p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
										{preset.message}
									</p>
								</Button>
							))}
						</div>
					</div>

					<div>
						<Label className="text-[10px] font-bold text-muted-foreground  tracking-widest mb-2 block">
							Or write your own
						</Label>
						<Input
							placeholder="Write a personal message..."
							value={customMessage}
							onChange={(e) => {
								setCustomMessage(e.target.value);
								setSelectedPreset(null);
							}}
							className="rounded-xl"
						/>
					</div>

					<Button
						className="w-full rounded-full font-bold text-sm gap-2"
						onClick={handleSend}
						disabled={sendMutation.isPending}
					>
						<HugeiconsIcon icon={SentIcon} className="w-4 h-4" />
						{sendMutation.isPending ? 'Sending...' : 'Send Encouragement'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
