import { m } from 'framer-motion';
import { SmoothWords } from '@/components/Transition/SmoothText';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { SafeImage } from '../SafeImage';

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
				<SafeImage
					src="/logo.png"
					alt="Success"
					width={36}
					height={36}
					className="w-10 h-10"
				/>
			</m.div>
			<SmoothWords
				as="h1"
				text="start your prep"
				className="text-4xl font-black tracking-tight text-foreground"
			/>
			<m.p
				variants={STAGGER_ITEM}
				className="text-muted-foreground text-balance font-medium text-base"
			>
				crush your nsc exams. create your free account.
			</m.p>
		</m.div>
	);
}
