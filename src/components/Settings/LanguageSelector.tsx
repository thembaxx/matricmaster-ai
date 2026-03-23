'use client';

import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useLanguageStore } from '@/hooks/useLanguage';
import { SA_LANGUAGES, type SALanguage, SUPPORTED_LANGUAGES } from '@/lib/i18n/languages';

interface LanguageSelectorProps {
	label?: string;
	showAllOption?: boolean;
	className?: string;
}

export function LanguageSelector({
	label = 'Language',
	showAllOption = false,
	className = '',
}: LanguageSelectorProps) {
	const { language, setLanguage } = useLanguageStore();

	return (
		<div className={className}>
			{label && <Label className="text-sm font-medium text-foreground">{label}</Label>}
			<Select value={language} onValueChange={(value) => setLanguage(value as SALanguage)}>
				<SelectTrigger className="w-full mt-1">
					<SelectValue placeholder="Select language" />
				</SelectTrigger>
				<SelectContent>
					{showAllOption && <SelectItem value="all">All Languages</SelectItem>}
					{SUPPORTED_LANGUAGES.map((lang) => (
						<SelectItem key={lang} value={lang}>
							<span className="flex items-center gap-2">
								<span>{SA_LANGUAGES[lang].flag}</span>
								<span>{SA_LANGUAGES[lang].nativeName}</span>
							</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

export function LanguageSelectorWithName({ className = '' }: { className?: string }) {
	const { language, setLanguage } = useLanguageStore();

	const handleValueChange = (value: string) => {
		setLanguage(value as SALanguage);
	};

	return (
		<div className={className}>
			<Select value={language} onValueChange={handleValueChange}>
				<SelectTrigger className="w-full">
					<SelectValue>
						<span className="flex items-center gap-2">
							<span>{SA_LANGUAGES[language].flag}</span>
							<span>{SA_LANGUAGES[language].nativeName}</span>
						</span>
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{SUPPORTED_LANGUAGES.map((lang) => (
						<SelectItem key={lang} value={lang}>
							<span className="flex items-center gap-2">
								<span>{SA_LANGUAGES[lang].flag}</span>
								<span>{SA_LANGUAGES[lang].nativeName}</span>
							</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
