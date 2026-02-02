import { useState } from 'react';
import { Screen } from '@/types';

interface QuizProps {
    onNavigate: (s: Screen) => void;
}

export default function Quiz({ onNavigate }: QuizProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    if (isFinished) {
        return (
            <div className="flex-1 flex flex-col items-center px-6 py-12 text-center bg-white dark:bg-zinc-950">
                <div className="w-48 h-48 mb-8 animate-float">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0BHz4I8fBUuaQ97p8O_uEEybJ2xmVn3wkOzOTCSN1iG2OVNoZsOB-A1qRjGzKFeEzQrJplsMdhWXVeoqFx7ppRg0ewSW26Izh2WfdQe5e-UZQgWy5uQdxc81xKXNgZI6ThViDvg4SgPMJkRGwkDl3uWdoyvgrn1Gu8TFMFqd_1hrUM9XPBz05kD2eO5t6fydAj9NCfAiV3tIljt09Ssr-pA6B5uENJP9OtCzRndob_wuoUwa8aowsO_JyjD-Jc82BPTzErBZPmqjs" alt="Trophy" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Lesson Complete!</h1>
                <p className="text-zinc-500 mt-2">Great job, Thabo! You crushed it.</p>
                
                <div className="grid grid-cols-3 gap-3 w-full mt-10">
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <p className="text-xl font-bold">90%</p>
                        <p className="text-[10px] uppercase font-bold text-zinc-400">Accuracy</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <p className="text-xl font-bold">12m</p>
                        <p className="text-[10px] uppercase font-bold text-zinc-400">Time</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <p className="text-xl font-bold text-accent-yellow">+150</p>
                        <p className="text-[10px] uppercase font-bold text-zinc-400">XP</p>
                    </div>
                </div>

                <button type="button"
                    onClick={() => onNavigate('DASHBOARD')}
                    className="w-full mt-12 py-5 bg-accent-yellow text-zinc-900 font-bold rounded-2xl flex items-center justify-center gap-2"
                >
                    Keep Going <span className="material-symbols-rounded">arrow_forward</span>
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="px-6 pt-10 pb-4 flex justify-between items-center bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                <button type="button" onClick={() => onNavigate('DASHBOARD')} className="material-symbols-rounded text-zinc-400">close</button>
                <div className="flex-1 px-8">
                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-green w-1/3 transition-all duration-500"></div>
                    </div>
                </div>
                <span className="text-xs font-bold text-zinc-400">2/10</span>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-8">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-accent-yellow/20 text-accent-yellow text-[10px] font-bold px-2 py-1 rounded-full uppercase">Calculus</span>
                    <span className="text-zinc-400 text-xs">Question 4</span>
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight mb-4">
                    Solve for <span className="math-serif">x</span>
                </h2>
                <p className="text-zinc-500 mb-8">
                    Factorise the quadratic equation below to find the roots.
                </p>

                {/* Equation Card */}
                <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-center mb-8">
                    <span className="text-3xl font-mono math-serif text-zinc-800 dark:text-zinc-100 tracking-wider">x² - 5x + 6 = 0</span>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {['(x+2)(x+3)', '(x-2)(x-3)', '(x-1)(x-6)', '(x+1)(x-6)'].map((opt, idx) => (
                        <button type="button"
                            key={idx}
                            onClick={() => setSelectedOption(opt)}
                            className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 active:scale-95 ${selectedOption === opt ? 'border-accent-blue bg-blue-50 dark:bg-blue-900/20' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${selectedOption === opt ? 'bg-accent-blue text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="font-mono text-zinc-700 dark:text-zinc-300">{opt}</span>
                        </button>
                    ))}
                </div>

                {/* Hint */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-rounded text-accent-blue text-xl">psychology</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Pattern Recognition</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Quadratic factors often appear in pairs that sum to the middle term and multiply to the last.</p>
                    </div>
                </div>
            </main>

            {/* Sticky Footer Action */}
            <footer className="p-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                <button type="button"
                    disabled={!selectedOption}
                    onClick={() => setIsFinished(true)}
                    className={`w-full py-5 rounded-2xl font-bold text-lg transition-all ${selectedOption ? 'bg-primary dark:bg-white text-white dark:text-black shadow-lg shadow-zinc-400/20' : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'}`}
                >
                    Check Answer
                </button>
            </footer>
        </div>
    );
}
