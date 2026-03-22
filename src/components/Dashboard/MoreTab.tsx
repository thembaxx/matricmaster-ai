import { m } from 'framer-motion';
import dynamic from 'next/dynamic';
import { RecommendedSection } from '@/components/Dashboard/RecommendedSection';
import { SubjectGrid } from '@/components/Dashboard/SubjectGridV2';

const BuddyPanel = dynamic(
	() => import('@/components/StudyBuddy/BuddyPanel').then((mod) => ({ default: mod.BuddyPanel })),
	{ ssr: false, loading: () => <div className="h-48 animate-pulse bg-muted rounded-lg" /> }
);

const KnowledgeHeatmap = dynamic(
	() =>
		import('@/components/Dashboard/KnowledgeHeatmap').then((mod) => ({
			default: mod.KnowledgeHeatmap,
		})),
	{ ssr: false, loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" /> }
);

const ActivityFeed = dynamic(
	() =>
		import('@/components/Dashboard/ActivityFeed').then((mod) => ({
			default: mod.ActivityFeed,
		})),
	{ ssr: false, loading: () => <div className="h-48 animate-pulse bg-muted rounded-lg" /> }
);

export function MoreTab() {
	return (
		<m.div layout className="space-y-6 pb-36">
			<m.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.55 }}
				className="space-y-6"
			>
				<m.h2
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="text-xl font-semibold text-foreground"
				>
					Your Subjects
				</m.h2>
				<SubjectGrid />
			</m.section>

			<m.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.55 }}
				className="space-y-6"
			>
				<BuddyPanel />
			</m.section>

			<m.section
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.58 }}
				className="space-y-6"
			>
				<KnowledgeHeatmap compact />
			</m.section>

			<RecommendedSection />

			<section className="space-y-6">
				<m.h2
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.75 }}
					className="text-xl font-semibold text-foreground"
				>
					Recent activity
				</m.h2>
				<ActivityFeed />
			</section>
		</m.div>
	);
}
