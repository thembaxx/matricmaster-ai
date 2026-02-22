'use client';

// import type { Screen } from '@/types'; // Removed unused import
import { Globe, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';

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
	const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

	return (
		<div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-lexend">
			<div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
				{/* Header */}
				<div className="px-6 pt-12 pb-6 border-b border-border bg-card">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
								<Globe className="w-6 h-6 text-muted-foreground" />
							</div>
							<div>
								<h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">
									Select Language
								</h2>
								<p className="text-sm font-bold text-zinc-500">Choose your preferred tongue</p>
							</div>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.push('/')}
							className="rounded-full h-12 w-12"
						>
							<X className="w-6 h-6" />
						</Button>
					</div>
				</div>

				{/* Language List */}
				<ScrollArea className="flex-1 p-6">
					<RadioGroup
						value={selectedLanguage}
						onValueChange={setSelectedLanguage}
						className="grid grid-cols-1 gap-4"
					>
						{languages.map((lang) => (
							<div key={lang.code}>
								<RadioGroupItem value={lang.code} id={lang.code} className="peer sr-only" />
								<Label
									htmlFor={lang.code}
									className="flex items-center gap-5 p-5 rounded-[2rem] border-2 border-transparent bg-card cursor-pointer transition-all peer-data-[state=checked]:border-brand-blue peer-data-[state=checked]:shadow-xl shadow-sm hover:border-zinc-200 dark:hover:border-zinc-700"
								>
									<div
										className={`w-14 h-14 rounded-2xl ${lang.color} flex items-center justify-center text-white font-black text-lg shadow-inner shadow-black/10`}
									>
										{lang.code}
									</div>
									<div className="flex-1">
										<p className="font-black text-zinc-900 dark:text-white text-lg">{lang.name}</p>
										<p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
											{lang.code}
										</p>
									</div>
									{selectedLanguage === lang.code && (
										<div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center animate-in zoom-in">
											<svg
												className="w-5 h-5 text-white"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												role="img"
												aria-label="Selected"
											>
												<title>Selected</title>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={3}
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
									)}
								</Label>
							</div>
						))}
					</RadioGroup>
				</ScrollArea>

				{/* Footer */}
				<div className="p-8 border-t border-border bg-card">
					<Button
						className="w-full h-16 bg-foreground dark:bg-background text-background dark:text-foreground rounded-[2rem] font-black text-xl shadow-2xl active:scale-[0.98] transition-all"
						onClick={() => router.push('/')}
					>
						Confirm Selection
					</Button>
				</div>
			</div>
		</div>
	);
}
