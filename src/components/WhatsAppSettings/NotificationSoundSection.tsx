import { Volume2, VolumeX } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface NotificationSoundSectionProps {
	enabled: boolean;
	onToggle: (enabled: boolean) => void;
}

export function NotificationSoundSection({ enabled, onToggle }: NotificationSoundSectionProps) {
	return (
		<div className="space-y-4">
			<h3 className="font-medium flex items-center gap-2">
				{enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
				Notification Sound
			</h3>
			<div className="flex items-center justify-between">
				<span>Enable notification sound</span>
				<Switch checked={enabled} onCheckedChange={onToggle} />
			</div>
		</div>
	);
}
