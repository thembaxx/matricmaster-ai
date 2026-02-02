
import React from 'react';
import { Screen } from '../types';

interface BookmarksProps {
    onNavigate: (s: Screen) => void;
}

const Bookmarks: React.FC<BookmarksProps> = ({ onNavigate }) => {
    return (
        <div className="flex-1 overflow-y-auto no-scrollbar bg-background-light dark:bg-background-dark pb-24">
            <header className="px-6 pt-12 pb-4 sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md z-20 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Bookmarks</h1>
                    <button className="material-symbols-rounded text-zinc-400">filter_list</button>
                </div>
                
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
                    <button className="flex-1 py-3 bg-white dark:bg-zinc-700 rounded-xl text-sm font-bold shadow-sm">Full Papers</button>
                    <button className="flex-1 py-3 text-sm font-bold text-zinc-500">Questions</button>
                </div>
            </header>

            <main className="px-6 pt-6 space-y-6">
                <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Recently Saved</h3>
                
                {[
                    { sub: "Mathematics", title: "Gauteng Prelim 2023 - Paper 1", time: "2 hours ago", icon: "calculate", color: "text-blue-500" },
                    { sub: "Life Sciences", title: "Question 3.1: Genetics", time: "Oct 14", icon: "biotech", color: "text-green-500" },
                    { sub: "Physical Sciences", title: "Nov 2021 P2: Chemistry", time: "Sep 10", icon: "science", color: "text-purple-500" }
                ].map(item => (
                    <div key={item.title} className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center ${item.color}`}>
                                    <span className="material-symbols-rounded text-2xl">{item.icon}</span>
                                </div>
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.sub}</p>
                                    <h4 className="font-bold text-zinc-900 dark:text-white leading-tight mt-0.5">{item.title}</h4>
                                    <p className="text-[10px] text-zinc-400 font-medium">Saved {item.time}</p>
                                </div>
                            </div>
                            <button className="material-symbols-rounded text-zinc-300">more_vert</button>
                        </div>
                        <button className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-bold text-xs rounded-xl transition-transform active:scale-95">
                            Quick Review
                        </button>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default Bookmarks;
