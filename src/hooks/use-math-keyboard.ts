'use client';

import { useCallback, useState } from 'react';

const playClickSound = () => {
	try {
		const audioCtx = new (
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
		)();
		const oscillator = audioCtx.createOscillator();
		const gainNode = audioCtx.createGain();
		oscillator.connect(gainNode);
		gainNode.connect(audioCtx.destination);
		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
		gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
		oscillator.start();
		oscillator.stop(audioCtx.currentTime + 0.1);
	} catch (error) {
		console.warn('Audio feedback not supported:', error);
	}
};

export function useMathKeyboard() {
	const [showMathKeyboard, setShowMathKeyboard] = useState(false);
	const [mathInput, setMathInput] = useState('');
	const [cursorPos, setCursorPos] = useState(0);

	const handleMathKeyClick = useCallback(
		(val: string) => {
			playClickSound();
			setMathInput((prev) => prev.slice(0, cursorPos) + val + prev.slice(cursorPos));
			setCursorPos((prev) => prev + val.length);
		},
		[cursorPos]
	);

	const handleMathDelete = useCallback(() => {
		playClickSound();
		if (cursorPos > 0) {
			setMathInput((prev) => prev.slice(0, cursorPos - 1) + prev.slice(cursorPos));
			setCursorPos((prev) => prev - 1);
		}
	}, [cursorPos]);

	const moveCursor = useCallback(
		(dir: 'left' | 'right') => {
			playClickSound();
			setCursorPos((prev) => {
				if (dir === 'left' && prev > 0) return prev - 1;
				if (dir === 'right' && prev < mathInput.length) return prev + 1;
				return prev;
			});
		},
		[mathInput.length]
	);

	const resetMathInput = useCallback(() => {
		setMathInput('');
		setCursorPos(0);
	}, []);

	return {
		showMathKeyboard,
		setShowMathKeyboard,
		mathInput,
		cursorPos,
		handleMathKeyClick,
		handleMathDelete,
		moveCursor,
		resetMathInput,
	};
}
