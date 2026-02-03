import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Globe, X } from 'lucide-react';
import { useState } from 'react';

interface LanguageSelectProps {
	onClose: () => void;
	currentLanguage?: string;
}

const languages = [
	{ code: 'EN', name: 'English', color: 'bg-blue-500' },
	{ code: 'AF', name: 'Afrikaans', color: 'bg-red-500' },
	{ code: 'ZU', name: 'isiZulu', color: 'bg-green-500' },
	{ code: 'XH', name: 'isiXhosa', color: 'bg-yellow-500' },
	{ code: 'NS', name: 'Sepedi', color: 'bg-purple-500' },
	{ code: 'TN', name: 'Setswana', color: 'bg-orange-500' },
	{ code: 'SS', name: 'siSwati', color: 'bg-pink-500' },
	{ code: 'TS', name: 'Xitsonga', color: 'bg-teal-500' },
	{ code: 'VE', name: 'Tshivenda', color: 'bg-indigo-500' },
	{ code: 'NR', name: 'isiNdebele', color: 'bg-amber-600' },
	{ code: 'ST', name: 'Sesotho', color: 'bg-cyan-500' },
];

export default function LanguageSelect({ onClose, currentLanguage = 'EN' }: LanguageSelectProps) {
	const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

	return (
		<div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
			<div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden">
				{/* Header */}
				<div className="px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
								<Globe className="w-5 h-5 text-zinc-600" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Select Language</h2>
								<p className="text-sm text-zinc-500">Choose your preferred language</p>
							</div>
						</div>
						<Button variant="ghost" size="icon" onClick={onClose}>
							<X className="w-5 h-5" />
						</Button>
					</div>
				</div>

				{/* Language List */}
				<div className="p-6 overflow-y-auto max-h-[60vh]">
					<RadioGroup
						value={selectedLanguage}
						onValueChange={setSelectedLanguage}
						className="space-y-3"
					>
						{languages.map((lang) => (
							<div key={lang.code}>
								<RadioGroupItem value={lang.code} id={lang.code} className="peer sr-only" />
								<Label
									htmlFor={lang.code}
									className="flex items-center gap-4 p-4 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 cursor-pointer transition-all peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 dark:peer-data-[state=checked]:bg-blue-900/20 hover:border-zinc-300 dark:hover:border-zinc-700"
								>
									<div
										className={`w-12 h-12 rounded-full ${lang.color} flex items-center justify-center text-white font-bold`}
									>
										{lang.code}
									</div>
									<div className="flex-1">
										<p className="font-semibold text-zinc-900 dark:text-white">{lang.name}</p>
										<p className="text-sm text-zinc-500">{lang.code}</p>
									</div>
									{selectedLanguage === lang.code && (
										<div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
											<svg
												className="w-4 h-4 text-white"
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
													strokeWidth={2}
													d="M5 13l4 4L19 7"
												/>
											</svg>
										</div>
									)}
								</Label>
							</div>
						))}
					</RadioGroup>
				</div>

				{/* Footer */}
				<div className="p-6 border-t border-zinc-100 dark:border-zinc-800">
					<Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg" onClick={onClose}>
						Confirm Selection
					</Button>
				</div>
			</div>
		</div>
	);
}
