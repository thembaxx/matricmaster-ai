import { Home, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950">
			<div className="max-w-md w-full text-center space-y-6">
				<div className="space-y-2">
					<h1 className="text-6xl font-black text-zinc-900 dark:text-white">404</h1>
					<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Page Not Found</h2>
					<p className="text-zinc-500 dark:text-zinc-400">
						The page you&apos;re looking for doesn&apos;t exist or has been moved.
					</p>
				</div>

				<div className="flex gap-3 justify-center">
					<Link href="/">
						<Button className="gap-2">
							<Home className="w-4 h-4" />
							Go Home
						</Button>
					</Link>
					<Link href="/search">
						<Button variant="outline" className="gap-2">
							<Search className="w-4 h-4" />
							Search
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
