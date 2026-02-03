import Achievements from '@/screens/Achievements';
import Bookmarks from '@/screens/Bookmarks';
import CMS from '@/screens/CMS';
import Channels from '@/screens/Channels';
import Dashboard from '@/screens/Dashboard';
import ErrorHint from '@/screens/ErrorHint';
import Landing from '@/screens/Landing';
import LanguageSelect from '@/screens/LanguageSelect';
import Leaderboard from '@/screens/Leaderboard';
import LessonComplete from '@/screens/LessonComplete';
import MathematicsQuiz from '@/screens/MathematicsQuiz';
import PastPaperViewer from '@/screens/PastPaperViewer';
import PhysicalSciences from '@/screens/PhysicalSciences';
import Profile from '@/screens/Profile';
import Quiz from '@/screens/Quiz';
import Search from '@/screens/Search';
import StudyPath from '@/screens/StudyPath';
import StudyPlanWizard from '@/screens/StudyPlanWizard';
import type { Screen } from '@/types';
import { Bookmark, Home, Search as SearchIcon, User } from 'lucide-react';
import { useState } from 'react';

export default function App() {
	const [currentScreen, setCurrentScreen] = useState<Screen>('LANDING');

	const renderScreen = () => {
		switch (currentScreen) {
			case 'LANDING':
				return <Landing onNavigate={setCurrentScreen} />;
			case 'LANGUAGE_SELECT':
				return <LanguageSelect onNavigate={setCurrentScreen} />;
			case 'DASHBOARD':
				return <Dashboard onNavigate={setCurrentScreen} />;
			case 'PATH':
				return <StudyPath onNavigate={setCurrentScreen} />;
			case 'CHANNELS':
				return <Channels onNavigate={setCurrentScreen} />;
			case 'BOOKMARKS':
				return <Bookmarks onNavigate={setCurrentScreen} />;
			case 'PROFILE':
				return <Profile onNavigate={setCurrentScreen} />;
			case 'QUIZ':
				return <Quiz onNavigate={setCurrentScreen} />;
			case 'MATH_QUIZ':
				return <MathematicsQuiz onNavigate={setCurrentScreen} />;
			case 'PHYSICS':
				return <PhysicalSciences onNavigate={setCurrentScreen} />;
			case 'PAST_PAPER':
				return <PastPaperViewer onNavigate={setCurrentScreen} />;
			case 'STUDY_PLAN':
				return <StudyPlanWizard onNavigate={setCurrentScreen} />;
			case 'ACHIEVEMENTS':
				return <Achievements onNavigate={setCurrentScreen} />;
			case 'LEADERBOARD':
				return <Leaderboard onNavigate={setCurrentScreen} />;
			case 'LESSON_COMPLETE':
				return <LessonComplete onNavigate={setCurrentScreen} />;
			case 'ERROR_HINT':
				return <ErrorHint onNavigate={setCurrentScreen} />;
			case 'CMS':
				return <CMS onNavigate={setCurrentScreen} />;
			case 'SEARCH':
				return <Search onNavigate={setCurrentScreen} />;
			default:
				return <Landing onNavigate={setCurrentScreen} />;
		}
	};

	const hideNavigation = [
		'QUIZ',
		'MATH_QUIZ',
		'PHYSICS',
		'PAST_PAPER',
		'STUDY_PLAN',
		'CMS',
		'LESSON_COMPLETE',
		'ERROR_HINT',
	];

	return (
		<div className="flex justify-center items-center min-h-screen bg-background p-0 sm:p-4">
			<div className="w-full max-w-[420px] h-full min-h-screen sm:min-h-[850px] sm:h-[900px] bg-background sm:rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col transition-colors duration-300 border-x border-border">
				{renderScreen()}

				{/* Bottom Navigation - Hidden on specific screens */}
				{!hideNavigation.includes(currentScreen) && (
					<nav className="absolute bottom-0 w-full bg-card/95 backdrop-blur-xl border-t border-border flex justify-between items-center px-6 py-3 pb-6 z-50">
						<button
							type="button"
							onClick={() => setCurrentScreen('LANDING')}
							className={`flex flex-col items-center gap-1 transition-all duration-200 ${currentScreen === 'LANDING' ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground'}`}
						>
							<Home className="w-6 h-6" strokeWidth={currentScreen === 'LANDING' ? 2.5 : 2} />
							<span className="text-[11px] font-semibold">Home</span>
						</button>
						<button
							type="button"
							onClick={() => setCurrentScreen('SEARCH')}
							className={`flex flex-col items-center gap-1 transition-all duration-200 ${currentScreen === 'SEARCH' ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground'}`}
						>
							<SearchIcon className="w-6 h-6" strokeWidth={currentScreen === 'SEARCH' ? 2.5 : 2} />
							<span className="text-[11px] font-semibold">Search</span>
						</button>
						<button
							type="button"
							onClick={() => setCurrentScreen('BOOKMARKS')}
							className={`flex flex-col items-center gap-1 transition-all duration-200 ${currentScreen === 'BOOKMARKS' ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground'}`}
						>
							<Bookmark className="w-6 h-6" strokeWidth={currentScreen === 'BOOKMARKS' ? 2.5 : 2} />
							<span className="text-[11px] font-semibold">Saved</span>
						</button>
						<button
							type="button"
							onClick={() => setCurrentScreen('PROFILE')}
							className={`flex flex-col items-center gap-1 transition-all duration-200 ${currentScreen === 'PROFILE' ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground'}`}
						>
							<User className="w-6 h-6" strokeWidth={currentScreen === 'PROFILE' ? 2.5 : 2} />
							<span className="text-[11px] font-semibold">Profile</span>
						</button>
					</nav>
				)}
			</div>
		</div>
	);
}
