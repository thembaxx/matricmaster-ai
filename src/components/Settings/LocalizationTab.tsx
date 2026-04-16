'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useLanguageStore } from '@/hooks/useLanguage';
import { authClient } from '@/lib/auth-client';
import { updateUserSettingsAction } from '@/lib/db/settings-actions';
import { CurriculumSelector } from './CurriculumSelector';
import { LanguageSelector } from './LanguageSelector';

export function LocalizationTab() {
	const { language, curriculum, homeLanguage } = useLanguageStore();
	const { data: session } = authClient.useSession();
	const prevValuesRef = useRef({ language, curriculum, homeLanguage });

	const saveSettings = useCallback(async () => {
		if (!session?.user?.id) return;

		const currentValues = { language, curriculum, homeLanguage };
		if (
			currentValues.language === prevValuesRef.current.language &&
			currentValues.curriculum === prevValuesRef.current.curriculum &&
			currentValues.homeLanguage === prevValuesRef.current.homeLanguage
		) {
			return;
		}

		prevValuesRef.current = currentValues;

		try {
			const result = await updateUserSettingsAction(session.user.id, {
				language,
				curriculum,
				homeLanguage: homeLanguage || undefined,
				preferredLanguage: language,
			});

			if (result.success) {
				toast.success('Settings saved');
			} else {
				toast.error(result.error || 'Failed to save settings');
			}
		} catch (error) {
			console.error('Failed to save settings:', error);
			toast.error('Failed to save settings');
		}
	}, [session?.user?.id, language, curriculum, homeLanguage]);

	useEffect(() => {
		const timer = setTimeout(saveSettings, 500);
		return () => clearTimeout(timer);
	}, [saveSettings]);

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h2 className="text-lg font-semibold">Language & Curriculum</h2>
				<p className="text-sm text-muted-foreground">Customize your learning experience</p>
			</div>

			<div className="flex flex-col gap-4">
				<LanguageSelector label="Interface Language" />

				<LanguageSelector label="Home Language (for AI explanations)" showAllOption />

				<CurriculumSelector />
			</div>
		</div>
	);
}
