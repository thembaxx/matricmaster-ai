import { ArrowLeft01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ChannelNotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
			<div className="max-w-md w-full text-center space-y-6">
				<div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
					<HugeiconsIcon icon={Search01Icon} className="w-8 h-8 text-muted-foreground" />
				</div>

				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-foreground">Channel not found</h2>
					<p className="text-sm text-muted-foreground">
						This channel doesn't exist or has been removed.
					</p>
				</div>

				<Link href="/community">
					<Button className="gap-2">
						<HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
						Back to Community
					</Button>
				</Link>
			</div>
		</div>
	);
}
