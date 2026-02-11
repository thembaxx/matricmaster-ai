/** biome-ignore-all lint/a11y/noSvgWithoutTitle: no need */
import { Suspense } from 'react';

import { SignInForm } from './SignInForm';

export default function SignInPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
				</div>
			}
		>
			<SignInForm />
		</Suspense>
	);
}
