'use client';

import type { useAccessibility } from '@/hooks/useAccessibility';

interface PreviewPanelProps {
	settings: ReturnType<typeof useAccessibility>['settings'];
}

export function PreviewPanel({ settings }: PreviewPanelProps) {
	const previewStyle: React.CSSProperties = {
		fontSize: `${1 * (settings.textSize === 'large' ? 1.25 : settings.textSize === 'x-large' ? 1.5 : settings.textSize === 'xx-large' ? 2 : 1)}rem`,
	};

	if (settings.highContrast) {
		previewStyle.backgroundColor = '#000000';
		previewStyle.color = '#ffffff';
		previewStyle.border = '2px solid #ffffff';
	}

	return (
		<div className="p-4 rounded-lg border-2 transition-all" style={previewStyle}>
			<p className="font-semibold mb-2">Preview Text</p>
			<p className="text-sm opacity-80">
				This is how your content will appear with current settings.
			</p>
			<div className="mt-4 flex gap-2">
				<button
					type="button"
					className="px-3 py-1 rounded transition-all"
					style={{
						padding: settings.largerTargets ? '12px 24px' : '8px 16px',
						outline: settings.focusIndicators ? '3px solid #6366f1' : 'none',
					}}
				>
					Button
				</button>
			</div>
		</div>
	);
}
