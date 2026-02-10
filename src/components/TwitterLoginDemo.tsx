'use client';

import { useState } from 'react';
import { signIn, useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

export function TwitterLoginDemo() {
	const { data: session, isLoading } = useSession();
	const [loading, setLoading] = useState(false);

	const handleTwitterSignIn = async () => {
		setLoading(true);
		try {
			await signIn.social({
				provider: 'twitter',
				callbackURL: '/dashboard', // Where to redirect after successful login
			});
		} catch (error) {
			console.error('Twitter sign-in error:', error);
		} finally {
			setLoading(false);
		}
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (session) {
		return (
			<Card className="w-full max-w-md mx-auto">
				<CardHeader>
					<CardTitle>Welcome, {session.user.name}!</CardTitle>
					<CardDescription>You are logged in via Twitter</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground mb-4">
						Email: {session.user.email}
					</p>
					<Button variant="outline" onClick={() => signOut()}>
						Sign Out
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Sign in with Twitter</CardTitle>
				<CardDescription>
					Use your Twitter account to access MatricMaster
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<Button 
						className="w-full" 
						onClick={handleTwitterSignIn}
						disabled={loading}
					>
						{loading ? (
							<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Icons.twitter className="mr-2 h-4 w-4" />
						)}
						Sign in with Twitter
					</Button>
					
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or continue with
							</span>
						</div>
					</div>

					<Button 
						variant="outline" 
						className="w-full"
						onClick={() => signIn.social({ provider: 'google' })}
					>
						<Icons.google className="mr-2 h-4 w-4" />
						Sign in with Google
					</Button>
				</div>
				
				<div className="mt-6 text-center text-sm text-muted-foreground">
					<p>Don't have a Twitter account?</p>
					<p className="mt-1">
						You can also sign up using email or Google
					</p>
				</div>
			</CardContent>
		</Card>
	);
}