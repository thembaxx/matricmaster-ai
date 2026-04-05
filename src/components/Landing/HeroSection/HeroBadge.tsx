'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export function HeroBadge() {
	return (
		<m.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ type: 'spring', stiffness: 300, damping: 28 }}
		>
			<Badge className="bg-tiimo-lavender/15 text-tiimo-lavender rounded-full px-4 py-1.5 label-xs">
				<HugeiconsIcon icon={SparklesIcon} className="w-3 h-3 mr-1.5" />
				Trusted by 50,000+ South African students
			</Badge>
		</m.div>
	);
}
