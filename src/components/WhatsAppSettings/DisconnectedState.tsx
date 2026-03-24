import { Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DisconnectedStateProps {
	onConnect: () => void;
}

export function DisconnectedState({ onConnect }: DisconnectedStateProps) {
	return (
		<div className="container mx-auto py-8 max-w-2xl">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Smartphone className="h-5 w-5" />
						WhatsApp Settings
					</CardTitle>
					<CardDescription>Connect WhatsApp to receive study reminders</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="text-center py-8">
						<Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<p className="text-muted-foreground">WhatsApp is not connected</p>
						<Button className="mt-4" onClick={onConnect}>
							Connect WhatsApp
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
