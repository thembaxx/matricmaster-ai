
import React from 'react';
import { Screen } from '../types';
import { RANKINGS } from '../constants';

interface LeaderboardProps {
    onNavigate: (s: Screen) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onNavigate }) => {
    const topThree = RANKINGS.filter(r => r.rank <= 3);
    const others = RANKINGS.filter(r => r.rank > 3 && !r.isUser);
    const user = RANKINGS.find(r => r.isUser);

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar bg-background-light dark:bg-background-dark pb-32">
            <header className="px-6 pt-12 pb-4 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 z-20">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => onNavigate(Screen.DASHBOARD)} className="material-symbols-rounded text-zinc-500">arrow_back</button>
                    <h1 className="text-xl font-black text-zinc-900 dark:text-white">Leaderboard</h1>
                    <div className="w-8"></div>
                </div>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
                    <button className="flex-1 py-2 bg-white dark:bg-zinc-700 rounded-lg text-xs font-bold shadow-sm">School</button>
                    <button className="flex-1 py-2 text-xs font-bold text-zinc-500">Provincial</button>
                    <button className="flex-1 py-2 text-xs font-bold text-zinc-500">National</button>
                </div>
            </header>

            <main className="px-6">
                {/* Podium */}
                <div className="flex items-end justify-center gap-4 py-12">
                    {/* Rank 2 */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full border-2 border-zinc-300 p-1 relative mb-2">
                            <img src={topThree[1].avatar} className="w-full h-full rounded-full object-cover" alt="Rank 2" />
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-300 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">2</div>
                        </div>
                        <span className="text-xs font-bold">{topThree[1].name}</span>
                        <span className="text-[10px] text-accent-yellow">{topThree[1].points} KP</span>
                        <div className="h-16 w-12 bg-gradient-to-t from-zinc-200 to-transparent dark:from-zinc-800 mt-2 rounded-t-lg"></div>
                    </div>
                    {/* Rank 1 */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-accent-yellow animate-bounce"><span className="material-symbols-rounded">crown</span></div>
                            <div className="w-24 h-24 rounded-full border-4 border-accent-yellow p-1 shadow-lg shadow-yellow-500/20">
                                <img src={topThree[0].avatar} className="w-full h-full rounded-full object-cover" alt="Rank 1" />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent-yellow text-zinc-900 text-xs font-black px-3 py-1 rounded-full">1</div>
                        </div>
                        <span className="text-sm font-black">{topThree[0].name}</span>
                        <span className="text-xs font-bold text-accent-yellow">{topThree[0].points} KP</span>
                        <div className="h-24 w-16 bg-gradient-to-t from-accent-yellow/20 to-transparent mt-2 rounded-t-xl"></div>
                    </div>
                    {/* Rank 3 */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full border-2 border-orange-400 p-1 relative mb-2">
                            <img src={topThree[2].avatar} className="w-full h-full rounded-full object-cover" alt="Rank 3" />
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</div>
                        </div>
                        <span className="text-xs font-bold">{topThree[2].name}</span>
                        <span className="text-[10px] text-accent-yellow">{topThree[2].points} KP</span>
                        <div className="h-12 w-12 bg-gradient-to-t from-orange-200 to-transparent dark:from-orange-900/20 mt-2 rounded-t-lg"></div>
                    </div>
                </div>

                {/* Rank List */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-2 space-y-1 shadow-sm mb-24">
                    {others.map(r => (
                        <div key={r.name} className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors rounded-2xl">
                            <span className="w-6 text-sm font-black text-zinc-300">{r.rank}</span>
                            <div className="w-10 h-10 rounded-full bg-zinc-100 overflow-hidden"><img src={r.avatar} alt={r.name} /></div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{r.name}</h4>
                                <p className="text-[10px] text-zinc-500">{r.school}</p>
                            </div>
                            <span className="font-bold text-sm text-accent-yellow">{r.points} KP</span>
                        </div>
                    ))}
                </div>
            </main>

            {/* Sticky User Bar */}
            <div className="absolute bottom-24 left-6 right-6">
                <div className="bg-zinc-900 dark:bg-white p-4 rounded-3xl shadow-xl flex items-center gap-4 border border-zinc-800 dark:border-zinc-200">
                    <span className="text-accent-yellow font-black">42</span>
                    <div className="w-10 h-10 rounded-full border-2 border-accent-yellow overflow-hidden">
                        <img src={user?.avatar} alt="You" />
                    </div>
                    <div className="flex-1">
                        <p className="text-white dark:text-zinc-900 font-bold text-sm">Your Rank</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold">Top 15% • 5 Day Streak</p>
                    </div>
                    <div className="text-right">
                        <p className="text-accent-yellow font-black text-base">{user?.points} KP</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
