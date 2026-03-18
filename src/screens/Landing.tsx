'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
	FeaturesSection,
	FinalCTASection,
	HeroSection,
	StatsSection,
	SubjectsSection,
	TestimonialsSection,
} from '@/components/Landing';
import { Footer } from '@/components/Layout/footer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/lib/auth-client';

export default function Landing() {
	const router = useRouter();
	const { data: session } = useSession();

	const handleAuthRoute = (path: string) => {
		if (!session?.user) {
			toast.info('Login Required', {
				description: 'Please sign in to access this feature.',
			});
			router.push('/sign-in');
			return;
		}
		router.push(path);
	};

	return (
		<div className="flex flex-col h-full min-w-0 w-full bg-background overflow-x-hidden relative">
			<ScrollArea className="flex-1 no-scrollbar relative">
				<main className="pb-4 px-6 sm:px-6 max-w-7xl mx-auto w-full lg:px-0 lg:pb-24">
					<HeroSection onAuthRequired={handleAuthRoute} />
					<FeaturesSection />
					<StatsSection />
					<SubjectsSection onAuthRequired={handleAuthRoute} />
					<TestimonialsSection />
					<FinalCTASection />
				</main>
				<Footer />
			</ScrollArea>
		</div>
	);
}
