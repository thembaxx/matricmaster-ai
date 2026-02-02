import { useState } from 'react';
import { Screen } from '@/types';
import { generateStudyPlan } from '@/services/geminiService';

interface StudyPlanWizardProps {
    onNavigate: (s: Screen) => void;
}

export default function StudyPlanWizard({ onNavigate }: StudyPlanWizardProps) {
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics']);
    const [hours, setHours] = useState(12);
    const [isGenerating, setIsGenerating] = useState(false);

    const toggleSubject = (s: string) => {
        setSelectedSubjects(prev => 
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Simulate Gemini processing (SDK used in geminiService)
        await generateStudyPlan(selectedSubjects, hours);
        setTimeout(() => {
            setIsGenerating(false);
            onNavigate('PATH');
        }, 3000);
    };

    if (isGenerating) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-zinc-950">
                <div className="w-32 h-32 bg-accent-blue/10 rounded-full flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
                    <span className="material-symbols-rounded text-accent-blue text-4xl animate-pulse">auto_awesome</span>
                </div>
                <h2 className="text-2xl font-bold">Generating Plan...</h2>
                <p className="text-zinc-500 mt-4">Our AI is analyzing the curriculum and your goals to create the perfect quest map.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark">
            <header className="px-6 pt-10 pb-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="flex justify-between items-center mb-6">
                    <button type="button" onClick={() => onNavigate('DASHBOARD')} className="material-symbols-rounded text-zinc-500">arrow_back</button>
                    <h2 className="font-bold text-zinc-900 dark:text-white uppercase tracking-widest text-[10px]">Study Plan Wizard</h2>
                    <div className="w-8"></div>
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Focus Areas</h1>
                <p className="text-sm text-zinc-500 mt-1">Step 1 of 3: Personalized path</p>
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 mt-4 rounded-full overflow-hidden">
                    <div className="bg-accent-blue h-full w-1/3"></div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar p-6">
                <h3 className="text-lg font-bold mb-4">What subjects are you tackling?</h3>
                <div className="grid grid-cols-2 gap-4 mb-10">
                    {['Mathematics', 'Physical Sci', 'Life Sciences', 'English HL', 'Afrikaans FAL', 'Accounting'].map(sub => (
                        <button type="button"
                            key={sub}
                            onClick={() => toggleSubject(sub)}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 active:scale-95 text-center ${selectedSubjects.includes(sub) ? 'border-accent-blue bg-blue-50 dark:bg-blue-900/20' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900'}`}
                        >
                            <span className="text-xs font-bold">{sub}</span>
                            {selectedSubjects.includes(sub) && <span className="material-symbols-rounded text-accent-blue text-sm">check_circle</span>}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold">Weekly Commitment</h3>
                        <span className="bg-accent-blue/10 text-accent-blue px-3 py-1 rounded-full font-bold text-sm">{hours} Hours</span>
                    </div>
                    <input 
                        type="range" 
                        min="2" 
                        max="40" 
                        value={hours} 
                        onChange={(e) => setHours(parseInt(e.target.value))}
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-accent-blue"
                    />
                    <div className="flex justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        <span>2h / week</span>
                        <span>40h / week</span>
                    </div>
                    <p className="text-center text-xs text-zinc-400 mt-4 italic">Recommended: 15-20 hours for distinction pass.</p>
                </div>
            </main>

            <footer className="p-6 pt-12 bg-gradient-to-t from-white dark:from-zinc-950 to-transparent">
                <button type="button"
                    onClick={handleGenerate}
                    className="w-full py-5 bg-accent-blue hover:bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                    Generate My Plan <span className="material-symbols-rounded animate-pulse">auto_awesome</span>
                </button>
            </footer>
        </div>
    );
}
