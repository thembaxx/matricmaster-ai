import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { SmoothWords } from '@/components/Transition/SmoothText';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';

export function SignUpHeader() {
	return (
		<m.div
			variants={STAGGER_CONTAINER}
			initial="hidden"
			animate="visible"
			className="text-center space-y-3 mb-8"
		>
			<m.div
				variants={STAGGER_ITEM}
				whileHover={{ rotate: 15, scale: 1.1 }}
				className="w-14 h-14 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-5 text-primary"
			>
				<HugeiconsIcon icon={SparklesIcon} className="w-7 h-7" />
			</m.div>
			<SmoothWords
				as="h1"
				text="Start Your Prep"
				className="text-4xl font-black tracking-tight text-foreground"
			/>
			<m.p
				variants={STAGGER_ITEM}
				className="text-muted-foreground text-balance font-medium text-base"
			>
				Crush your NSC exams. Create your free account.
			</m.p>
		</m.div>
	);
}
