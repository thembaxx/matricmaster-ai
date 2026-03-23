'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { HeroSection } from '@/components/Landing';
import { Footer } from '@/components/Layout/footer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/lib/auth-client';

// Code-split below-fold landing sections to reduce initial JS bundle.
// Only HeroSection (above the fold / LCP candidate) is eagerly loaded.
// The remaining ~30-50KB of framer-motion + hugeicons JS loads on demand.
const FeaturesSection = dynamic(
	() => import('@/components/Landing').then((mod) => ({ default: mod.FeaturesSection })),
	{ ssr: true, loading: () => <div className="min-h-[400px]" /> }
);
const StatsSection = dynamic(
	() => import('@/components/Landing').then((mod) => ({ default: mod.StatsSection })),
	{ ssr: true, loading: () => <div className="min-h-[200px]" /> }
);
const SubjectsSection = dynamic(
	() => import('@/components/Landing').then((mod) => ({ default: mod.SubjectsSection })),
	{ ssr: true, loading: () => <div className="min-h-[500px]" /> }
);
const TestimonialsSection = dynamic(
	() => import('@/components/Landing').then((mod) => ({ default: mod.TestimonialsSection })),
	{ ssr: true, loading: () => <div className="min-h-[400px]" /> }
);
const FinalCTASection = dynamic(
	() => import('@/components/Landing').then((mod) => ({ default: mod.FinalCTASection })),
	{ ssr: true, loading: () => <div className="min-h-[200px]" /> }
);

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
				<main className="pb-4 px-6 sm:px-6 max-w-7xl mx-auto w-full lg:px-6 lg:pb-24">
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
