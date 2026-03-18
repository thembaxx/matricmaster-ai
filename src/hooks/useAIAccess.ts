import { useFocusMode } from '@/contexts/FocusModeContext';

export function useAIAccess() {
	const { isFocusMode, state } = useFocusMode();

	return {
		canAccessAI: !isFocusMode || state === 'completed',
		isBlocked: isFocusMode && state !== 'completed',
	};
}
