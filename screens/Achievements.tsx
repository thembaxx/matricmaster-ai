
import React from 'react';
import { Screen } from '../types';
import { ACHIEVEMENTS } from '../constants';

interface AchievementsProps {
    onNavigate: (s: Screen) => void;
}

const Achievements: React.FC<AchievementsProps> = ({ onNavigate }) => {
    return (
        <div className="flex-1 overflow-y-auto no-scrollbar bg-background-light dark:bg-background-dark pb-24">
            <header className="px-6 pt-12 pb-4 sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md z-20 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => onNavigate(Screen.DASHBOARD)} className="material-symbols-rounded text-zinc-500">arrow_back</button>
                    <h1 className="text-xl font-black text-zinc-900 dark:text-white">Achievements</h1>
                </div>
                
                <div className="bg-gradient-to-br from-accent-blue to-blue-700 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Mastery Level</p>
                        <h2 className="text-3xl font-black mt-1">Level 4</h2>
                        <div className="flex justify-between items-end mt-6">
                            <p className="text-sm font-bold">12 / 50 <span className="opacity-60 font-medium">Badges</span></p>
                            <p className="text-sm font-black">24%</p>
                        </div>
                        <div className="h-2 w-full bg-black/20 rounded-full mt-2 overflow-hidden">
                            <div className="bg-white h-full w-[24%] shadow-inner"></div>
                        </div>
                        <p className="text-[10px] font-bold mt-2 opacity-80 italic">Keep it up! Next reward at 15 badges.</p>
                    </div>
                </div>
            </header>

            <main className="px-6 pt-8">
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8">
                    <button className="px-4 py-2 bg-accent-blue text-white text-xs font-bold rounded-full">All Badges</button>
                    <button className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs font-bold rounded-full">Science</button>
                    <button className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs font-bold rounded-full">Math</button>
                </div>

                <div className="grid grid-cols-3 gap-x-4 gap-y-8">
                    {ACHIEVEMENTS.map(badge => (
                        <div key={badge.id} className={`flex flex-col items-center gap-3 transition-opacity ${badge.isLocked ? 'opacity-40' : 'opacity-100'}`}>
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center p-3 relative ${badge.isLocked ? 'border-2 border-dashed border-zinc-300 bg-zinc-50' : 'bg-white dark:bg-zinc-900 shadow-lg border border-zinc-100 dark:border-zinc-800'}`}>
                                {badge.isLocked ? (
                                    <span className="material-symbols-rounded text-zinc-300">lock</span>
                                ) : (
                                    <img src={badge.imageUrl} alt={badge.name} className="w-full h-full object-contain drop-shadow-md" />
                                )}
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-zinc-900 dark:text-white leading-tight uppercase tracking-tight truncate w-full">{badge.name}</p>
                                <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${badge.isLocked ? 'text-zinc-400' : 'text-accent-blue'}`}>
                                    {badge.isLocked ? 'Locked' : 'Unlocked'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Achievements;
