'use client';

// import type { Screen } from '@/types'; // Removed unused import
import { Globe02Icon as Globe, Cancel01Icon as X, CheckmarkCircle01Icon as Check } from 'hugeicons-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface LanguageSelectProps {
	currentLanguage?: string;
}

const languages = [
	{ code: 'EN', name: 'English', color: 'bg-brand-blue' },
	{ code: 'AF', name: 'Afrikaans', color: 'bg-brand-red' },
	{ code: 'ZU', name: 'isiZulu', color: 'bg-brand-green' },
	{ code: 'XH', name: 'isiXhosa', color: 'bg-brand-amber' },
	{ code: 'NS', name: 'Sepedi', color: 'bg-brand-purple' },
	{ code: 'TN', name: 'Setswana', color: 'bg-brand-orange' },
	{ code: 'SS', name: 'siSwati', color: 'bg-pink-500' },
	{ code: 'TS', name: 'Xitsonga', color: 'bg-teal-500' },
	{ code: 'VE', name: 'Tshivenda', color: 'bg-indigo-500' },
	{ code: 'NR', name: 'isiNdebele', color: 'bg-amber-800' },
	{ code: 'ST', name: 'Sesotho', color: 'bg-cyan-500' },
];

export default function LanguageSelect({ currentLanguage = 'EN' }: LanguageSelectProps) {
	const router = useRouter();

	return (
		<div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 font-lexend">
			<div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
				{/* Header */}
				<div className="px-8 pt-20 pb-10 border-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl sticky top-0 z-10">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-6">
							<div className="w-16 h-16 rounded-[1.5rem] bg-tiimo-blue text-white flex items-center justify-center shadow-xl shadow-tiimo-blue/20">
								<Globe size={32} className="stroke-[3px]" />
							</div>
							<div className="space-y-1">
								<h2 className="text-4xl font-black text-foreground tracking-tight leading-none">
									Language
								</h2>
								<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Select preferred tongue</p>
							</div>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.push('/')}
							className="h-14 w-14 rounded-2xl bg-muted/10 hover:bg-muted/20 transition-all"
						>
							<X size={24} className="stroke-[3px]" />
						</Button>
					</div>
				</div>

				{/* Language List */}
				<ScrollArea className="flex-1 px-8 pb-32 no-scrollbar">
					<RadioGroup
						value={currentLanguage}
						onValueChange={(value) => {
							router.push(`/?lang=${value}`);
						}}
						className="grid grid-cols-1 gap-4"
					>
						{languages.map((lang) => (
							<div key={lang.code}>
								<RadioGroupItem value={lang.code} id={lang.code} className="peer sr-only" />
								<Label
									htmlFor={lang.code}
									className="flex items-center gap-6 p-6 rounded-[2.5rem] border-none bg-card cursor-pointer transition-all duration-500 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:shadow-2xl peer-data-[state=checked]:shadow-primary/30 shadow-sm hover:bg-muted/10 group"
								>
									<div
										className={cn(
											"w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-white font-black text-xl shadow-xl transition-all duration-500 group-hover:scale-110",
											lang.color
										)}
									>
										{lang.code}
									</div>
									<div className="flex-1 space-y-1">
										<p className="font-black text-xl tracking-tight leading-none peer-data-[state=checked]:text-white">
											{lang.name}
										</p>
										<p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 peer-data-[state=checked]:text-white/60">
											{lang.code}
										</p>
									</div>
									{currentLanguage === lang.code && (
										<div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center animate-in zoom-in duration-500">
											<Check size={24} className="text-white stroke-[4px]" />
										</div>
									)}
								</Label>
							</div>
						))}
					</RadioGroup>
				</ScrollArea>

				{/* Footer */}
				<div className="fixed bottom-0 left-0 right-0 p-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl border-none z-20">
					<div className="max-w-2xl mx-auto w-full">
						<Button
							className="w-full h-20 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-[2rem] font-black text-2xl shadow-[0_30px_70px_rgba(0,0,0,0.3)] active:scale-95 transition-all border-none"
							onClick={() => router.push('/')}
						>
							Confirm Selection
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
