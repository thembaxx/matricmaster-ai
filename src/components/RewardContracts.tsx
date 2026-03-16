'use client';

import { ClockIcon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RewardContract {
	id: string;
	title: string;
	reward: string;
	targetStreak: number;
	targetQuizzes: number;
	targetPercentage: number;
	currentStreak: number;
	currentQuizzes: number;
	currentPercentage: number;
	status: 'active' | 'completed' | 'expired';
	createdAt: Date;
}

interface RewardContractsProps {
	isParent?: boolean;
}

export function RewardContracts({ isParent = false }: RewardContractsProps) {
	const [contracts, setContracts] = useState<RewardContract[]>([
		{
			id: '1',
			title: 'Exam Prep Champion',
			reward: '5GB Data Bundle',
			targetStreak: 7,
			targetQuizzes: 3,
			targetPercentage: 70,
			currentStreak: 5,
			currentQuizzes: 2,
			currentPercentage: 75,
			status: 'active',
			createdAt: new Date(),
		},
	]);

	const [showCreate, setShowCreate] = useState(false);
	const [newContract, setNewContract] = useState({
		title: '',
		reward: '',
		targetStreak: 7,
		targetQuizzes: 3,
		targetPercentage: 70,
	});

	const handleCreateContract = () => {
		if (!newContract.title || !newContract.reward) {
			toast.error('Please fill in all required fields');
			return;
		}

		const contract: RewardContract = {
			id: Date.now().toString(),
			...newContract,
			currentStreak: 0,
			currentQuizzes: 0,
			currentPercentage: 0,
			status: 'active',
			createdAt: new Date(),
		};

		setContracts([...contracts, contract]);
		setShowCreate(false);
		setNewContract({
			title: '',
			reward: '',
			targetStreak: 7,
			targetQuizzes: 3,
			targetPercentage: 70,
		});
		toast.success('Reward contract created!');
	};

	const getProgress = (contract: RewardContract) => {
		const streakProgress = (contract.currentStreak / contract.targetStreak) * 100;
		const quizProgress = (contract.currentQuizzes / contract.targetQuizzes) * 100;
		const percentProgress = contract.currentPercentage >= contract.targetPercentage ? 100 : 0;
		return Math.min((streakProgress + quizProgress + percentProgress) / 3, 100);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-bold text-lg">Reward Contracts</h3>
					<p className="text-sm text-muted-foreground">
						{isParent
							? 'Create contracts to motivate your child'
							: 'Track your progress towards rewards'}
					</p>
				</div>
				{isParent && (
					<Button onClick={() => setShowCreate(!showCreate)} size="sm" className="gap-2">
						<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4" />
						New Contract
					</Button>
				)}
			</div>

			{showCreate && (
				<Card className="border-primary/20">
					<CardHeader>
						<CardTitle className="text-sm">Create Reward Contract</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Contract Title</Label>
							<Input
								id="title"
								placeholder="e.g., Final Exam Prep"
								value={newContract.title}
								onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="reward">Reward</Label>
							<Input
								id="reward"
								placeholder="e.g., R100 credit, 5GB data"
								value={newContract.reward}
								onChange={(e) => setNewContract({ ...newContract, reward: e.target.value })}
							/>
						</div>
						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label>Streak Days</Label>
								<Input
									type="number"
									min={1}
									value={newContract.targetStreak}
									onChange={(e) =>
										setNewContract({
											...newContract,
											targetStreak: Number.parseInt(e.target.value, 10) || 1,
										})
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Quizzes</Label>
								<Input
									type="number"
									min={1}
									value={newContract.targetQuizzes}
									onChange={(e) =>
										setNewContract({
											...newContract,
											targetQuizzes: Number.parseInt(e.target.value, 10) || 1,
										})
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Min %</Label>
								<Input
									type="number"
									min={1}
									max={100}
									value={newContract.targetPercentage}
									onChange={(e) =>
										setNewContract({
											...newContract,
											targetPercentage: Number.parseInt(e.target.value, 10) || 70,
										})
									}
								/>
							</div>
						</div>
						<div className="flex gap-2">
							<Button onClick={handleCreateContract} className="flex-1">
								Create Contract
							</Button>
							<Button variant="outline" onClick={() => setShowCreate(false)}>
								Cancel
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="space-y-4">
				{contracts.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
						<p>No reward contracts yet</p>
						{isParent && <p className="text-sm">Create one to motivate your child!</p>}
					</div>
				) : (
					contracts.map((contract) => {
						const progress = getProgress(contract);
						const isComplete = contract.status === 'completed';

						return (
							<m.div
								key={contract.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
							>
								<Card className={isComplete ? 'border-green-500/30 bg-green-500/5' : ''}>
									<CardContent className="p-4">
										<div className="flex items-start justify-between mb-3">
											<div>
												<h4 className="font-bold text-sm">{contract.title}</h4>
												<div className="flex items-center gap-1 mt-1">
													<Sparkles className="w-3 h-3 text-primary" />
													<span className="text-xs text-primary font-semibold">
														{contract.reward}
													</span>
												</div>
											</div>
											{isComplete ? (
												<div className="bg-green-500/20 text-green-600 px-2 py-1 rounded-full text-xs font-bold">
													Complete!
												</div>
											) : (
												<div className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-bold">
													{Math.round(progress)}%
												</div>
											)}
										</div>

										<div className="space-y-2">
											<div className="flex justify-between text-xs text-muted-foreground">
												<span>
													Streak: {contract.currentStreak}/{contract.targetStreak} days
												</span>
												<span>
													Quizzes: {contract.currentQuizzes}/{contract.targetQuizzes}
												</span>
												<span>Score: {contract.currentPercentage}%+</span>
											</div>
											<div className="h-2 bg-secondary rounded-full overflow-hidden">
												<m.div
													initial={{ width: 0 }}
													animate={{ width: `${progress}%` }}
													className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-primary'}`}
												/>
											</div>
										</div>

										<div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
											<HugeiconsIcon icon={ClockIcon} className="w-3 h-3" />
											<span>Created {contract.createdAt.toLocaleDateString()}</span>
										</div>
									</CardContent>
								</Card>
							</m.div>
						);
					})
				)}
			</div>
		</div>
	);
}
