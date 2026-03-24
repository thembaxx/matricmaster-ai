import { m } from 'framer-motion';
import { MarkdownRenderer } from '@/components/AI/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ContentViewProps {
	content: string;
	onBackToTimer: () => void;
}

export function ContentView({ content, onBackToTimer }: ContentViewProps) {
	return (
		<m.div
			key="content"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 20 }}
			className="w-full max-w-2xl bg-card border border-border/50 rounded-[3rem] shadow-tiimo overflow-hidden"
		>
			<ScrollArea className="h-[60vh] p-8 sm:p-12">
				<MarkdownRenderer content={content} />
			</ScrollArea>
			<div className="p-8 bg-muted/30 flex justify-center">
				<Separator className="mb-6 -mx-8 max-w-[calc(100%+4rem)]" />
				<Button onClick={onBackToTimer} className="rounded-full font-black  text-xs px-8 h-12">
					Back to Timer
				</Button>
			</div>
		</m.div>
	);
}
