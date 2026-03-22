'use client';

import { GraduationCap, Plus, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { TutorCard, type TutorCardData } from '@/components/Marketplace/TutorCard';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

const SUBJECTS = [
	'Mathematics',
	'Physical Sciences',
	'Life Sciences',
	'Geography',
	'History',
	'English',
	'Afrikaans',
	'Economics',
	'Accounting',
	'Computer Applications Technology',
];

interface MarketplaceFilters {
	search: string;
	subject: string;
	maxPrice: string;
	minRating: string;
}

export default function Marketplace() {
	const router = useRouter();
	const [tutors, setTutors] = useState<TutorCardData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isUserTutor, setIsUserTutor] = useState(false);
	const [userXP, setUserXP] = useState(0);
	const [filters, setFilters] = useState<MarketplaceFilters>({
		search: '',
		subject: '',
		maxPrice: '',
		minRating: '',
	});

	const fetchTutors = useCallback(async () => {
		setIsLoading(true);
		try {
			const params = new URLSearchParams();
			if (filters.search) params.set('search', filters.search);
			if (filters.subject) params.set('subject', filters.subject);
			if (filters.maxPrice) params.set('maxPriceXP', filters.maxPrice);
			if (filters.minRating) params.set('minRating', filters.minRating);

			const response = await fetch(`/api/marketplace?${params.toString()}`);
			const data = await response.json();

			if (data.success) {
				setTutors(data.data);
			}
		} catch (error) {
			console.error('Error fetching tutors:', error);
		} finally {
			setIsLoading(false);
		}
	}, [filters]);

	const fetchUserInfo = useCallback(async () => {
		try {
			const tutorRes = await fetch('/api/marketplace?action=is-tutor');
			const tutorData = await tutorRes.json();
			if (tutorData.success) {
				setIsUserTutor(tutorData.data.isTutor);
			}

			const xpRes = await fetch('/api/marketplace?action=my-xp');
			const xpData = await xpRes.json();
			if (xpData.success) {
				setUserXP(xpData.data.xp);
			}
		} catch (error) {
			console.error('Error fetching user info:', error);
		}
	}, []);

	useEffect(() => {
		fetchTutors();
		fetchUserInfo();
	}, [fetchTutors, fetchUserInfo]);

	const handleBook = (tutor: TutorCardData) => {
		router.push(`/tutor/${tutor.userId}`);
	};

	const handleViewProfile = (tutor: TutorCardData) => {
		router.push(`/tutor/${tutor.userId}`);
	};

	return (
		<div className="flex flex-col h-full min-w-0 bg-background pb-40 px-4 sm:px-6 lg:px-8">
			<BackgroundMesh variant="subtle" />

			<main className="max-w-6xl mx-auto w-full pt-6 space-y-6 relative z-10">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-2xl font-black tracking-tight">Tutor Marketplace</h1>
						<p className="text-sm text-muted-foreground mt-1">Find peer tutors for extra help</p>
					</div>

					<div className="flex items-center gap-3">
						<Badge variant="secondary" className="font-mono">
							<Sparkles className="size-3 mr-1" />
							{userXP} XP
						</Badge>

						{isUserTutor ? (
							<Button onClick={() => router.push('/my-sessions')} className="gap-2">
								<GraduationCap className="size-4" />
								My Sessions
							</Button>
						) : (
							<Button
								variant="outline"
								onClick={() => router.push('/become-tutor')}
								className="gap-2"
							>
								<Plus className="size-4" />
								Become a Tutor
							</Button>
						)}
					</div>
				</div>

				<div className="flex flex-col sm:flex-row gap-3">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
						<Input
							placeholder="Search tutors, subjects..."
							className="pl-10"
							value={filters.search}
							onChange={(e) => setFilters({ ...filters, search: e.target.value })}
						/>
					</div>

					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" className="gap-2">
								<SlidersHorizontal className="size-4" />
								Filters
							</Button>
						</SheetTrigger>
						<SheetContent>
							<SheetHeader>
								<SheetTitle>Filter Tutors</SheetTitle>
							</SheetHeader>
							<div className="mt-6 space-y-4">
								<div>
									<span className="text-sm font-medium mb-2 block">Subject</span>
									<Select
										value={filters.subject}
										onValueChange={(value) =>
											setFilters({ ...filters, subject: value === 'all' ? '' : value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="All subjects" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">All subjects</SelectItem>
											{SUBJECTS.map((subject) => (
												<SelectItem key={subject} value={subject}>
													{subject}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<span className="text-sm font-medium mb-2 block">Max Price (XP/hour)</span>
									<Select
										value={filters.maxPrice}
										onValueChange={(value) =>
											setFilters({ ...filters, maxPrice: value === 'any' ? '' : value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Any price" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="any">Any price</SelectItem>
											<SelectItem value="50">50 XP or less</SelectItem>
											<SelectItem value="100">100 XP or less</SelectItem>
											<SelectItem value="200">200 XP or less</SelectItem>
											<SelectItem value="500">500 XP or less</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<span className="text-sm font-medium mb-2 block">Min Rating</span>
									<Select
										value={filters.minRating}
										onValueChange={(value) =>
											setFilters({ ...filters, minRating: value === 'any' ? '' : value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Any rating" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="any">Any rating</SelectItem>
											<SelectItem value="3">3+ stars</SelectItem>
											<SelectItem value="4">4+ stars</SelectItem>
											<SelectItem value="4.5">4.5+ stars</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<Button
									className="w-full"
									onClick={() =>
										setFilters({ search: '', subject: '', maxPrice: '', minRating: '' })
									}
								>
									Clear Filters
								</Button>
							</div>
						</SheetContent>
					</Sheet>
				</div>

				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{[...Array(6)].map((_, i) => (
							<Card key={i} className="p-4">
								<div className="flex items-start gap-3">
									<Skeleton className="size-14 rounded-full" />
									<div className="flex-1 space-y-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-3 w-16" />
										<div className="flex gap-1">
											<Skeleton className="h-5 w-16" />
											<Skeleton className="h-5 w-16" />
										</div>
									</div>
								</div>
							</Card>
						))}
					</div>
				) : tutors.length === 0 ? (
					<Card className="p-12 text-center">
						<GraduationCap className="size-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="text-lg font-bold">No tutors found</h3>
						<p className="text-sm text-muted-foreground mt-1">
							{tutors.length === 0 && filters.search
								? 'Try adjusting your filters'
								: 'Be the first to become a tutor!'}
						</p>
						<Button variant="outline" className="mt-4" onClick={() => router.push('/become-tutor')}>
							Become a Tutor
						</Button>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{tutors.map((tutor) => (
							<TutorCard
								key={tutor.id}
								tutor={tutor}
								onBook={handleBook}
								onClick={handleViewProfile}
							/>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
