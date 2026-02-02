import { Screen } from '@/types';

interface ProfileProps {
    onNavigate: (s: Screen) => void;
}

export default function Profile({ onNavigate }: ProfileProps) {
    return (
        <div className="flex-1 overflow-y-auto no-scrollbar bg-background-light dark:bg-background-dark">
            <header className="p-6 flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
                <span className="material-symbols-rounded text-zinc-500">settings</span>
                <h1 className="font-bold text-zinc-900 dark:text-white">Profile</h1>
                <span className="material-symbols-rounded text-zinc-500">share</span>
            </header>

            <section className="flex flex-col items-center px-6 pt-6 pb-8">
                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-800 shadow-xl overflow-hidden">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQcir7nh51t_DOlwZTtFOZ4oQO2O_q_NjhNZDH4taxDeKvqx6nzLnHrXUXFbqUgZJ0qwBstH9b_fJRJxADvmNrftalekUzPqV2KazupXgbdY9ObNVeW_V_k0nsVPK21J1nlcNUvkRiNwxtnSus-OdvpMoWmN52WWmOEF8I_WiepUql3BD7YY775UDuF_Rwg7EOT-PYOMPCZQS60Cbc3gl_h7153nzwNRnA4Ew5M7yeyyHy7NJbku0ciXSZsoesGMJ6GHPwlQNnyqA-" alt="User Avatar" />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-accent-blue text-white p-1 rounded-full border-2 border-white"><span className="material-symbols-rounded text-xs">verified</span></div>
                </div>
                <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Thabo Mbeki</h2>
                <p className="text-zinc-500 text-sm mt-1">St. John's College • Grade 12</p>

                <div className="flex w-full mt-8 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl">
                    <button type="button" className="flex-1 py-2 bg-white dark:bg-zinc-700 rounded-lg text-xs font-bold shadow-sm">My Stats</button>
                    <button type="button" className="flex-1 py-2 text-xs font-bold text-zinc-500">Provincial Avg</button>
                </div>
            </section>

            {/* Admin Tools */}
            <section className="px-6 mb-8">
                <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4">Admin Tools</h3>
                <button type="button"
                    onClick={() => onNavigate('CMS')}
                    className="w-full p-4 bg-accent-purple/10 border border-accent-purple/20 rounded-2xl flex items-center justify-between group active:scale-95 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-purple text-white flex items-center justify-center">
                            <span className="material-symbols-rounded">edit_note</span>
                        </div>
                        <div className="text-left">
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Content CMS</h4>
                            <p className="text-[10px] text-zinc-500">Manage lessons & materials</p>
                        </div>
                    </div>
                    <span className="material-symbols-rounded text-zinc-400 group-hover:text-accent-purple transition-colors">chevron_right</span>
                </button>
            </section>

            {/* Skill Tags */}
            <section className="px-6 mb-8">
                <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-4">Skill Achievements</h3>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {['Calculus Master', 'Physics Logic', 'Top 5%', 'Essay Wizard'].map(skill => (
                        <div key={skill} className="flex-shrink-0 px-4 py-2 bg-accent-blue/10 rounded-full border border-accent-blue/20 text-accent-blue text-xs font-bold">
                            {skill}
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats Cards */}
            <section className="px-6 grid grid-cols-2 gap-4 mb-24">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <span className="material-symbols-rounded text-xl">school</span>
                    </div>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white">78%</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Average</p>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <span className="material-symbols-rounded text-xl">star</span>
                    </div>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white">Math</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Top Subject</p>
                </div>
            </section>
        </div>
    );
}
