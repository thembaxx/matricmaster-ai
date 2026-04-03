'use client';

import { AlertTriangle, ArrowRight, CheckCircle2, RefreshCw, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
	formatRiskScore,
	getRiskLevelBgColor,
	getRiskLevelColor,
} from '@/services/antiGamingService';
import type { SuspiciousPattern } from '@/stores/useAntiGamingStore';

interface AntiGamingAlertProps {
	isOpen: boolean;
	riskScore: number;
	riskLevel: 'low' | 'medium' | 'high' | 'critical';
	patterns: SuspiciousPattern[];
	onConfirmFast: () => void;
	onResetQuiz: () => void;
	onContinueAnyway: () => void;
}

export function AntiGamingAlert({
	isOpen,
	riskScore,
	riskLevel,
	patterns,
	onConfirmFast,
	onResetQuiz,
	onContinueAnyway,
}: AntiGamingAlertProps) {
	const [selectedOption, setSelectedOption] = useState<'fast' | 'reset' | 'continue' | null>(null);

	const handleConfirm = () => {
		if (selectedOption === 'fast') {
			onConfirmFast();
		} else if (selectedOption === 'reset') {
			onResetQuiz();
		} else if (selectedOption === 'continue') {
			onContinueAnyway();
		}
	};

	const levelColors = getRiskLevelColor(riskLevel);
	const levelBgColors = getRiskLevelBgColor(riskLevel);

	const getTitle = () => {
		switch (riskLevel) {
			case 'critical':
				return 'Suspicious Activity Detected';
			case 'high':
				return 'Unusual Patterns Detected';
			case 'medium':
				return 'Review Required';
			default:
				return 'Activity Check';
		}
	};

	const getDescription = () => {
		switch (riskLevel) {
			case 'critical':
				return 'We detected patterns that strongly suggest automated or cheating behavior. Your XP will be blocked.';
			case 'high':
				return 'Your answers show patterns that may indicate gaming. XP will be reduced by 50%.';
			case 'medium':
				return 'Some activity patterns were flagged. XP may be reduced depending on your choice.';
			default:
				return 'A quick check on your activity patterns.';
		}
	};

	const getPatternIcons = (type: SuspiciousPattern['type']) => {
		switch (type) {
			case 'speed':
				return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
			case 'score':
				return <Shield className="w-4 h-4 text-orange-500" />;
			case 'hints':
				return <RefreshCw className="w-4 h-4 text-blue-500" />;
			case 'uncertain':
				return <AlertTriangle className="w-4 h-4 text-purple-500" />;
		}
	};

	return (
		<Dialog open={isOpen}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle
							className={`w-5 h-5 ${
								riskLevel === 'critical'
									? 'text-red-500'
									: riskLevel === 'high'
										? 'text-orange-500'
										: 'text-yellow-500'
							}`}
						/>
						{getTitle()}
					</DialogTitle>
					<DialogDescription>{getDescription()}</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className={`p-4 rounded-lg ${levelBgColors}`}>
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium">Risk Score</span>
							<span className={`font-mono font-bold ${levelColors}`}>
								{formatRiskScore(riskScore)}
							</span>
						</div>
						<Progress
							value={riskScore}
							className="h-2"
							indicatorClassName={
								riskLevel === 'critical'
									? 'bg-red-500'
									: riskLevel === 'high'
										? 'bg-orange-500'
										: riskLevel === 'medium'
											? 'bg-yellow-500'
											: 'bg-green-500'
							}
						/>
					</div>

					{patterns.length > 0 && (
						<div className="space-y-2">
							<h4 className="text-sm font-medium">Detected Patterns</h4>
							<div className="space-y-2">
								{patterns.map((pattern) => (
									<div
										key={`${pattern.type}-${pattern.description.slice(0, 30)}`}
										className="flex items-start gap-2 text-sm p-2 rounded-md bg-muted/50"
									>
										{getPatternIcons(pattern.type)}
										<span className="flex-1">{pattern.description}</span>
										<span
											className={`text-xs px-1.5 py-0.5 rounded ${
												pattern.severity === 'high'
													? 'bg-red-500/20 text-red-600'
													: pattern.severity === 'medium'
														? 'bg-yellow-500/20 text-yellow-600'
														: 'bg-blue-500/20 text-blue-600'
											}`}
										>
											{pattern.severity}
										</span>
									</div>
								))}
							</div>
						</div>
					)}

					<div className="space-y-2">
						<h4 className="text-sm font-medium">Choose an action</h4>
						<div className="space-y-2">
							<button
								type="button"
								onClick={() => setSelectedOption('fast')}
								className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
									selectedOption === 'fast'
										? 'border-primary bg-primary/5'
										: 'border-muted hover:border-muted-foreground/50'
								}`}
							>
								<div className="flex items-center gap-2">
									<CheckCircle2
										className={`w-4 h-4 ${
											selectedOption === 'fast' ? 'text-primary' : 'text-muted-foreground'
										}`}
									/>
									<span className="font-medium">I am legitimately fast</span>
								</div>
								<p className="text-xs text-muted-foreground mt-1 ml-6">
									You are a speedreader or naturally quick at answering. Your XP will be reduced by
									25%.
								</p>
							</button>

							<button
								type="button"
								onClick={() => setSelectedOption('reset')}
								className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
									selectedOption === 'reset'
										? 'border-primary bg-primary/5'
										: 'border-muted hover:border-muted-foreground/50'
								}`}
							>
								<div className="flex items-center gap-2">
									<RefreshCw
										className={`w-4 h-4 ${
											selectedOption === 'reset' ? 'text-primary' : 'text-muted-foreground'
										}`}
									/>
									<span className="font-medium">Reset quiz</span>
								</div>
								<p className="text-xs text-muted-foreground mt-1 ml-6">
									Start fresh with a new quiz. No penalty will be applied.
								</p>
							</button>

							{riskLevel !== 'critical' && (
								<button
									type="button"
									onClick={() => setSelectedOption('continue')}
									className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
										selectedOption === 'continue'
											? 'border-primary bg-primary/5'
											: 'border-muted hover:border-muted-foreground/50'
									}`}
								>
									<div className="flex items-center gap-2">
										<ArrowRight
											className={`w-4 h-4 ${
												selectedOption === 'continue' ? 'text-primary' : 'text-muted-foreground'
											}`}
										/>
										<span className="font-medium">Continue anyway</span>
									</div>
									<p className="text-xs text-muted-foreground mt-1 ml-6">
										Accept the XP reduction and continue with your results.
									</p>
								</button>
							)}
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onResetQuiz}>
						Reset Quiz
					</Button>
					<Button onClick={handleConfirm} disabled={!selectedOption}>
						Confirm
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
