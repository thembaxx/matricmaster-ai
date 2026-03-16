import { m } from 'framer-motion';
import Link from 'next/link';
import { appConfig } from '@/app.config';

export function SignUpFooter() {
	return (
		<>
			<m.p
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1 }}
				className="text-center text-muted-foreground mt-8 text-sm font-semibold"
			>
				Already have an account?{' '}
				<Link
					href="/sign-in"
					className="font-black text-primary hover:text-primary/80 underline-offset-4 transition-colors"
				>
					Sign In
				</Link>
			</m.p>

			<m.p
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1.5 }}
				className="text-center text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest mt-8"
			>
				&copy; {new Date().getFullYear()} {appConfig.name}
			</m.p>
		</>
	);
}
