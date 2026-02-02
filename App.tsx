
import React, { useState } from 'react';
import { Screen } from './types';
import Dashboard from './screens/Dashboard';
import StudyPath from './screens/StudyPath';
import Channels from './screens/Channels';
import Bookmarks from './screens/Bookmarks';
import Profile from './screens/Profile';
import Quiz from './screens/Quiz';
import StudyPlanWizard from './screens/StudyPlanWizard';
import Achievements from './screens/Achievements';
import Leaderboard from './screens/Leaderboard';
import CMS from './screens/CMS';

const App: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.DASHBOARD);

    const renderScreen = () => {
        switch (currentScreen) {
            case Screen.DASHBOARD: return <Dashboard onNavigate={setCurrentScreen} />;
            case Screen.PATH: return <StudyPath onNavigate={setCurrentScreen} />;
            case Screen.CHANNELS: return <Channels onNavigate={setCurrentScreen} />;
            case Screen.BOOKMARKS: return <Bookmarks onNavigate={setCurrentScreen} />;
            case Screen.PROFILE: return <Profile onNavigate={setCurrentScreen} />;
            case Screen.QUIZ: return <Quiz onNavigate={setCurrentScreen} />;
            case Screen.STUDY_PLAN: return <StudyPlanWizard onNavigate={setCurrentScreen} />;
            case Screen.ACHIEVEMENTS: return <Achievements onNavigate={setCurrentScreen} />;
            case Screen.LEADERBOARD: return <Leaderboard onNavigate={setCurrentScreen} />;
            case Screen.CMS: return <CMS onNavigate={setCurrentScreen} />;
            default: return <Dashboard onNavigate={setCurrentScreen} />;
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-zinc-950 p-0 sm:p-4">
            <div className="w-full max-w-[420px] h-full min-h-screen sm:min-h-[850px] sm:max-h-[900px] bg-background-light dark:bg-background-dark sm:rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col transition-colors duration-300 border-x border-zinc-200 dark:border-zinc-800">
                {renderScreen()}
                
                {/* Navigation - Hidden in Quiz, Study Plan and CMS */}
                {currentScreen !== Screen.QUIZ && currentScreen !== Screen.STUDY_PLAN && currentScreen !== Screen.CMS && (
                    <nav className="absolute bottom-0 w-full bg-white dark:bg-zinc-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-zinc-800 flex justify-between items-center px-6 py-4 pb-8 z-50">
                        <button onClick={() => setCurrentScreen(Screen.DASHBOARD)} className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === Screen.DASHBOARD ? 'text-accent-blue' : 'text-zinc-400'}`}>
                            <span className="material-symbols-rounded">home</span>
                            <span className="text-[10px] font-bold">Home</span>
                        </button>
                        <button onClick={() => setCurrentScreen(Screen.PATH)} className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === Screen.PATH ? 'text-accent-blue' : 'text-zinc-400'}`}>
                            <span className="material-symbols-rounded">map</span>
                            <span className="text-[10px] font-bold">Path</span>
                        </button>
                        <button onClick={() => setCurrentScreen(Screen.CHANNELS)} className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === Screen.CHANNELS ? 'text-accent-blue' : 'text-zinc-400'}`}>
                            <span className="material-symbols-rounded">school</span>
                            <span className="text-[10px] font-bold">Courses</span>
                        </button>
                        <button onClick={() => setCurrentScreen(Screen.PROFILE)} className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === Screen.PROFILE ? 'text-accent-blue' : 'text-zinc-400'}`}>
                            <span className="material-symbols-rounded">person</span>
                            <span className="text-[10px] font-bold">Profile</span>
                        </button>
                    </nav>
                )}
            </div>
        </div>
    );
};

export default App;
