import dynamic from 'next/dynamic';
import { QuizSkeleton } from '@/components/QuizSkeleton';
import { QUIZ_DATA } from '@/content/questions';

const QuizScreen = dynamic(() => import('@/screens/Quiz'), {
	ssr: true,
	loading: () => (
		<div className="min-h-[60vh] flex items-center justify-center">
			<QuizSkeleton />
		</div>
	),
});

export async function generateStaticParams() {
	return Object.keys(QUIZ_DATA).map((id) => ({
		id,
	}));
}

export default function QuizPage({ params }: { params: { id: string } }) {
	return <QuizScreen quizId={params.id} />;
}
