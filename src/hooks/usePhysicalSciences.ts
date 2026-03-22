import { useState } from 'react';
import { useTheme } from '@/hooks/use-theme';

export function usePhysicalSciences() {
	const { theme, setTheme } = useTheme();
	const [viewMode, setViewMode] = useState<'question' | 'split' | 'simulations'>('split');
	const [showAnnotations, setShowAnnotations] = useState(true);
	const [activeSimulation, setActiveSimulation] = useState<
		'projectile' | 'forces' | 'waves' | 'circuit'
	>('projectile');

	const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

	return {
		theme,
		setTheme,
		toggleTheme,
		viewMode,
		setViewMode,
		showAnnotations,
		setShowAnnotations,
		activeSimulation,
		setActiveSimulation,
	};
}
