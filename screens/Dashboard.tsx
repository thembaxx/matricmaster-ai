
import React from 'react';
import { Screen } from '../types';
import { SUBJECTS } from '../constants';

interface DashboardProps {
    onNavigate: (s: Screen) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
            {/* Header */}
            <header className="px-6 pt-10 pb-6 flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Grade 12 Prep</h1>
                    <p className="text-sm text-zinc-500 font-medium">Ace your final exams! 🔥</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 p-1 pr-3 rounded-full shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQcir7nh51t_DOlwZTtFOZ4oQO2O_q_NjhNZDH4taxDeKvqx6nzLnHrXUXFbqUgZJ0qwBstH9b_fJRJxADvmNrftalekUzPqV2KazupXgbdY9ObNVeW_V_k0nsVPK21J1nlcNUvkRiNwxtnSus-OdvpMoWmN52WWmOEF8I_WiepUql3BD7YY775UDuF_Rwg7EOT-PYOMPCZQS60Cbc3gl_h7153nzwNRnA4Ew5M7yeyyHy7NJbku0ciXSZsoesGMJ6GHPwlQNnyqA-" alt="Avatar" />
                    </div>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Thabo</span>
                </div>
            </header>

            <main className="px-6 space-y-8">
                {/* Hero / Daily Goal */}
                <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-accent-yellow">Daily Goal</span>
                            <h3 className="text-xl font-bold mt-1 text-zinc-900 dark:text-white">Master Algebra</h3>
                            <p className="text-xs text-zinc-500 mt-1">2/3 questions completed</p>
                        </div>
                        <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                            <span className="text-3xl">🏆</span>
                        </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-6">
                        <div className="h-full bg-accent-yellow w-2/3 rounded-full"></div>
                    </div>
                    <button 
                        onClick={() => onNavigate(Screen.QUIZ)}
                        className="w-full py-4 bg-primary dark:bg-white text-white dark:text-black font-bold rounded-2xl text-sm transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        Continue Quest <span className="material-symbols-rounded text-sm">arrow_forward</span>
                    </button>
                </section>

                {/* My Subjects */}
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">My Subjects</h2>
                        <button onClick={() => onNavigate(Screen.STUDY_PLAN)} className="text-xs font-bold text-accent-blue uppercase">Edit</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {SUBJECTS.map(subject => (
                            <div key={subject.id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col gap-3 group cursor-pointer active:scale-95 transition-all">
                                <div className={`w-10 h-10 rounded-xl ${subject.color} flex items-center justify-center text-white`}>
                                    <span className="material-symbols-rounded">{subject.icon}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{subject.name}</h4>
                                    <p className="text-[10px] text-zinc-400 mt-0.5">{subject.progress}% Complete</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recommendations */}
                <section>
                    <h2 className="text-lg font-bold mb-4 text-zinc-900 dark:text-white">Quick Links</h2>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        <button onClick={() => onNavigate(Screen.LEADERBOARD)} className="flex-shrink-0 bg-white dark:bg-zinc-900 px-6 py-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center gap-2">
                            <span className="text-2xl">⚡️</span>
                            <span className="text-xs font-bold">Leaderboard</span>
                        </button>
                        <button onClick={() => onNavigate(Screen.ACHIEVEMENTS)} className="flex-shrink-0 bg-white dark:bg-zinc-900 px-6 py-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center gap-2">
                            <span className="text-2xl">🎖</span>
                            <span className="text-xs font-bold">Badges</span>
                        </button>
                        <button onClick={() => onNavigate(Screen.BOOKMARKS)} className="flex-shrink-0 bg-white dark:bg-zinc-900 px-6 py-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center gap-2">
                            <span className="text-2xl">🔖</span>
                            <span className="text-xs font-bold">Saved</span>
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
