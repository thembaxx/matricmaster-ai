'use client';

import { Home01Icon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'motion/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
			<div className="max-w-md w-full text-center space-y-12">
				<div className="space-y-4">
					<m.h1
						initial={{ scale: 0.5, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ type: 'spring', stiffness: 200, damping: 10 }}
						className="text-8xl font-black text-primary"
					>
						404
					</m.h1>
					<m.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.2 }}
						className="space-y-2"
					>
						<h2 className="text-2xl font-black text-foreground">Lost in the equations?</h2>
						<p className="text-muted-foreground font-medium">
							The page you&apos;re looking for doesn&apos;t exist or has been moved.
						</p>
					</m.div>
				</div>

				<m.div
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.4 }}
					className="flex gap-4 justify-center"
				>
					<Link href="/" transitionTypes={['fade']}>
						<Button size="lg" className="gap-2 rounded-2xl shadow-xl shadow-primary/20">
							<HugeiconsIcon icon={Home01Icon} className="w-5 h-5" />
							Home
						</Button>
					</Link>
					<Link href="/search" transitionTypes={['fade']}>
						<Button size="lg" variant="outline" className="gap-2 rounded-2xl">
							<HugeiconsIcon icon={Search01Icon} className="w-5 h-5" />
							MagnifyingGlass
						</Button>
					</Link>
				</m.div>
			</div>
		</div>
	);
}
