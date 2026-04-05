'use client';

import { FireIcon, Medal01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { startTransition, ViewTransition } from 'react';
import { Podium } from '@/components/Leaderboard/Podium';
import { RankingList } from '@/components/Leaderboard/RankingList';
import { SubjectTabs } from '@/components/Leaderboard/SubjectTabs';
import { LeaderboardSkeleton } from '@/components/LeaderboardSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SUBJECTS, useLeaderboard } from '@/hooks/useLeaderboard';
import { formatPoints } from '@/lib/leaderboard-utils';

export default function Leaderboard() {
	const {
		activeTab,
		setActiveTab,
		subjectTab,
		setSubjectTab,
		currentPage,
		setCurrentPage,
		userStreak,
		leaderboardData,
		userRank,
		subjectData,
		topThree,
		paginatedOthers,
		totalPages,
		isLoading,
	} = useLeaderboard();

	const handleTabChange = (value: string) => {
		startTransition(() => {
			setActiveTab(value);
		});
	};

	const handleSubjectChange = (value: string) => {
		startTransition(() => {
			setSubjectTab(value);
		});
	};

	const handlePageChange = (page: number) => {
		startTransition(() => {
			setCurrentPage(page);
		});
	};

	if (isLoading) {
		return <LeaderboardSkeleton />;
	}

	return (
		<div className="flex flex-col h-full min-w-0 bg-background pb-24 overflow-x-hidden lg:px-8">
			<header className="pt-8 sm:pt-12 pb-6 sm:pb-8 flex flex-col items-center gap-8 sm:gap-12 shrink-0">
				<div className="text-center space-y-2 px-4">
					<h1 className="text-3xl sm:text-4xl lg:text-7xl font-black text-foreground tracking-tighter">
						global rankings
					</h1>
					<p className="text-muted-foreground font-bold text-sm sm:text-lg lg:text-lg">
						see how you compare with students nationwide
					</p>
				</div>

				<ViewTransition enter="fade-in" exit="fade-out" default="none">
					<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full max-w-4xl px-4">
						<TabsList className="w-full h-12 sm:h-16 p-1.5 sm:p-2 bg-muted/30 backdrop-blur-md rounded-xl sm:rounded-2xl border-2 border-border/50 shadow-inner">
							<TabsTrigger
								value="weekly"
								className="flex-1 rounded-xl font-medium text-[10px] sm:text-xs tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all"
							>
								weekly
							</TabsTrigger>
							<TabsTrigger
								value="monthly"
								className="flex-1 rounded-xl font-medium text-[10px] sm:text-xs tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all"
							>
								monthly
							</TabsTrigger>
							<TabsTrigger
								value="all_time"
								className="flex-1 rounded-xl font-medium text-[10px] sm:text-xs tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xl transition-all"
							>
								all time
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</ViewTransition>
			</header>

			<ScrollArea className="flex-1 no-scrollbar">
				<ViewTransition name="leaderboard-list" enter="fade-in" exit="fade-out" default="none">
					<div className="max-w-6xl mx-auto w-full pb-32">
						{leaderboardData.length === 0 ? (
							<div className="text-center py-32 space-y-4 opacity-50">
								<HugeiconsIcon
									icon={Medal01Icon}
									className="w-16 h-16 mx-auto text-muted-foreground"
								/>
								<p className="text-xl font-bold">the arena is empty... for now.</p>
							</div>
						) : (
							<div className="space-y-12">
								<Podium data={topThree} />

								<div className="grid grid-cols-1 gap-8">
									<div className="bg-card/20 backdrop-blur-sm rounded-[2.5rem] border-2 border-border/50 shadow-sm p-2 overflow-hidden mx-4 lg:mx-0">
										<RankingList data={paginatedOthers} />
									</div>
								</div>

								{totalPages > 1 && (
									<div className="flex justify-center py-8 mx-4 lg:mx-0">
										<Pagination>
											<PaginationContent>
												<PaginationItem>
													<PaginationPrevious
														onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
														className={
															currentPage === 1
																? 'pointer-events-none opacity-50'
																: 'cursor-pointer'
														}
													/>
												</PaginationItem>
												{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
													<PaginationItem key={page}>
														<PaginationLink
															onClick={() => handlePageChange(page)}
															isActive={currentPage === page}
															className="cursor-pointer"
														>
															{page}
														</PaginationLink>
													</PaginationItem>
												))}
												<PaginationItem>
													<PaginationNext
														onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
														className={
															currentPage === totalPages
																? 'pointer-events-none opacity-50'
																: 'cursor-pointer'
														}
													/>
												</PaginationItem>
											</PaginationContent>
										</Pagination>
									</div>
								)}

								{/* Subject Leaderboards */}
								<div className="mx-4 lg:mx-0 space-y-6">
									<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
										<h2 className="text-xl font-black tracking-tight">subject rankings</h2>
										<SubjectTabs
											subjects={SUBJECTS}
											activeSubject={subjectTab}
											onSubjectChange={handleSubjectChange}
										/>
									</div>

									{subjectData && subjectData.length > 0 ? (
										<div className="bg-card/20 backdrop-blur-sm rounded-[2.5rem] border-2 border-border/50 shadow-sm p-2 overflow-hidden">
											<RankingList data={subjectData} />
										</div>
									) : (
										<div className="text-center py-16 space-y-2 opacity-50">
											<p className="text-sm font-bold">no subject data available yet</p>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</ViewTransition>
			</ScrollArea>

			{userRank && (
				<div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-50 lg:bottom-12">
					<Card className="p-4 sm:p-6 premium-glass text-foreground border-none shadow-elevation-3 rounded-2xl sm:rounded-[2.5rem] relative overflow-hidden group">
						<div className="absolute top-0 left-0 w-2 h-full bg-primary-orange animate-pulse" />
						<div className="flex items-center gap-3 sm:gap-6 relative z-10">
							<span className="text-2xl sm:text-3xl font-black text-primary-orange w-8 sm:w-12 text-center tracking-tighter">
								{userRank.rank}
							</span>
							<div className="relative">
								<Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary-orange/30 p-1 rounded-xl sm:rounded-2xl bg-muted/20">
									<AvatarImage
										src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces"
										className="object-cover"
									/>
									<AvatarFallback className="font-black text-sm sm:text-base text-foreground">
										me
									</AvatarFallback>
								</Avatar>
								<div className="absolute -bottom-1.5 sm:-bottom-2 -right-1.5 sm:-right-2 bg-primary-orange text-white text-xs font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border-2 sm:border-4 border-background tracking-tighter shadow-lg">
									you
								</div>
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="font-black text-sm sm:text-lg text-white truncate tracking-tight">
									your global rank
								</h3>
								<span className="text-xs font-medium text-white/60 tracking-wide flex items-center gap-1 sm:gap-2">
									<HugeiconsIcon
										icon={FireIcon}
										className="w-3 h-3 sm:w-4 sm:h-4 text-primary-orange fill-primary-orange"
									/>
									{userStreak?.currentStreak || 0} day streak
								</span>
							</div>
							<div className="text-right">
								<p className="text-xl sm:text-2xl font-black text-primary-orange tracking-tighter flex items-center justify-end gap-1">
									{formatPoints(userRank.totalPoints)} <span className="text-xs">kp</span>
								</p>
								<p className="text-xs font-medium text-white/60 tracking-wide">
									top {100 - userRank.percentile}% of students
								</p>
							</div>
						</div>
					</Card>
				</div>
			)}
		</div>
	);
}
