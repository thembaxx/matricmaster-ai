import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { ExamPreset } from './constants';
import { EXAM_PRESETS, formatDuration } from './constants';

interface PresetSelectorProps {
	selectedPreset: ExamPreset;
	customDuration: number;
	onPresetSelect: (preset: ExamPreset) => void;
	onCustomDurationChange: (value: number[]) => void;
}

export function PresetSelector({
	selectedPreset,
	customDuration,
	onPresetSelect,
	onCustomDurationChange,
}: PresetSelectorProps) {
	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle>Select Exam Type</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
					{EXAM_PRESETS.map((preset) => (
						<button
							type="button"
							key={preset.name}
							onClick={() => onPresetSelect(preset)}
							className={`p-3 rounded-lg border text-left transition-all hover:shadow-sm ${
								selectedPreset.name === preset.name
									? 'border-primary bg-primary/10 shadow-sm'
									: 'hover:border-primary/50 hover:bg-muted/50'
							}`}
						>
							<div className="font-medium text-sm">{preset.name}</div>
							<div className="text-xs text-muted-foreground">{formatDuration(preset.duration)}</div>
						</button>
					))}
				</div>

				{selectedPreset.name === 'Custom' && (
					<div className="mt-4 p-4 rounded-lg border">
						<Label htmlFor="custom-duration">Duration: {customDuration} minutes</Label>
						<Slider
							id="custom-duration"
							value={[customDuration]}
							onValueChange={onCustomDurationChange}
							min={15}
							max={240}
							step={15}
							className="mt-2"
						/>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
