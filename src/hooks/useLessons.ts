import { useEffect, useMemo, useState } from 'react';
import { getSubjectEmoji, type SUBJECTS } from '@/content';
import chemistryData from '@/content/lessons/chemistry.json';
import lifeSciencesData from '@/content/lessons/life-sciences.json';
import mathematicsData from '@/content/lessons/mathematics.json';
import physicsData from '@/content/lessons/physics.json';
import { useAiContext } from '@/hooks/useAiContext';

export interface Lesson {
	id: string;
	subject: string;
	topic: string;
	title: string;
	content: string;
	duration: number;
	difficulty: string;
	prerequisites: string[];
	learning_objectives: string[];
	progress: number;
	status: 'completed' | 'active' | 'locked';
	icon: string;
	color: string;
	iconColor: string;
	isContinue: boolean;
	time?: string;
}

// Raw lesson data from JSON files
interface RawLessonData {
	id: string;
	subject: string;
	topic: string;
	title: string;
	content: string;
	duration: number;
	difficulty: string;
	prerequisites: string[];
	learning_objectives: string[];
}

// JSON file structure types
interface MathematicsJson {
	mathematics: RawLessonData[];
}

interface PhysicsJson {
	mechanics: RawLessonData[];
	waves: RawLessonData[];
	electricity: RawLessonData[];
}

interface ChemistryJson {
	chemistry: RawLessonData[];
}

interface LifeSciencesJson {
	life_sciences: RawLessonData[];
}

export function useLessons() {
	const [activeCategory, setActiveCategory] = useState('all');
	const { setContext, clearContext } = useAiContext();

	useEffect(() => {
		setContext({ type: 'lesson', lastUpdated: Date.now() });
		return () => clearContext();
	}, [setContext, clearContext]);

	const { lessonsData, loading } = useMemo(() => {
		const getIconForSubject = (subject: string): string => {
			const subjectKey = subject.toLowerCase().replace(' ', '-') as keyof typeof SUBJECTS;
			return getSubjectEmoji(subjectKey) ?? '📚';
		};

		const getColorForSubject = (subject: string): string => {
			const subjectKey = subject.toLowerCase().replace(' ', '-') as keyof typeof SUBJECTS;
			switch (subjectKey) {
				case 'mathematics':
					return 'bg-brand-amber/10';
				case 'physics':
					return 'bg-primary/10';
				case 'life-sciences':
					return 'bg-brand-green/10';
				case 'english':
					return 'bg-brand-red/10';
				default:
					return 'bg-muted/10';
			}
		};

		const getIconColorForSubject = (subject: string): string => {
			switch (subject.toLowerCase()) {
				case 'mathematics':
					return 'text-brand-amber';
				case 'physical sciences':
					return 'text-primary';
				case 'life sciences':
					return 'text-brand-green';
				case 'english':
					return 'text-brand-red';
				default:
					return 'text-muted-foreground';
			}
		};

		const getRandomStatus = (): 'completed' | 'active' | 'locked' => {
			const rand = Math.random();
			return (rand > 0.7 ? 'completed' : rand > 0.3 ? 'active' : 'locked') as
				| 'completed'
				| 'active'
				| 'locked';
		};

		const mapLesson = (lesson: RawLessonData): Lesson => {
			const status = getRandomStatus();
			return {
				id: lesson.id,
				subject: lesson.subject,
				topic: lesson.topic,
				title: lesson.title,
				content: lesson.content,
				duration: lesson.duration,
				difficulty: lesson.difficulty,
				prerequisites: lesson.prerequisites,
				learning_objectives: lesson.learning_objectives,
				progress: Math.floor(Math.random() * 101),
				status,
				icon: getIconForSubject(lesson.subject),
				color: getColorForSubject(lesson.subject),
				iconColor: getIconColorForSubject(lesson.subject),
				isContinue: false,
			};
		};

		const mathArray = (mathematicsData as MathematicsJson).mathematics || [];
		const mechanicsArray = (physicsData as PhysicsJson).mechanics || [];
		const wavesArray = (physicsData as PhysicsJson).waves || [];
		const electricityArray = (physicsData as PhysicsJson).electricity || [];
		const chemistryArray = (chemistryData as ChemistryJson).chemistry || [];
		const lifeArray = (lifeSciencesData as LifeSciencesJson).life_sciences || [];

		const allLessons: Lesson[] = [
			...mathArray.map(mapLesson),
			...mechanicsArray.map(mapLesson),
			...wavesArray.map(mapLesson),
			...electricityArray.map(mapLesson),
			...chemistryArray.map(mapLesson),
			...lifeArray.map(mapLesson),
		];

		return { lessonsData: allLessons, loading: false };
	}, []);

	const filteredLessons = useMemo(() => {
		return lessonsData.filter(
			(lesson) =>
				activeCategory === 'all' ||
				lesson.subject.toLowerCase() === activeCategory.toLowerCase().replace('_', ' ')
		);
	}, [lessonsData, activeCategory]);

	return {
		activeCategory,
		setActiveCategory,
		filteredLessons,
		loading,
	};
}
