'use client';

import { ArrowRight, Bell, Lightbulb, Loader2, MessageSquare, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateVerificationCode } from '@/services/whatsapp-reminder-service';
import { sendVerificationCode } from '@/services/whatsapp-service';

interface WhatsAppPromptProps {
	onComplete?: () => void;
	variant?: 'card' | 'dialog' | 'inline';
}

const BENEFITS = [
	{
		icon: Bell,
		title: 'Timely Reminders',
		description: 'Get study reminders when you need them most',
	},
	{
		icon: Users,
		title: 'Friend Updates',
		description: 'Know when your study buddy beats your score',
	},
	{
		icon: Lightbulb,
		title: 'Daily Tips',
		description: 'Receive study tips and motivation',
	},
	{
		icon: MessageSquare,
		title: 'Ask Questions',
		description: 'Message the AI tutor directly',
	},
];

export function WhatsAppPrompt({ onComplete, variant = 'card' }: WhatsAppPromptProps) {
	const [isOpen, setIsOpen] = useState(true);
	const [phoneNumber, setPhoneNumber] = useState('');
	const [verificationCode, setVerificationCode] = useState('');
	const [step, setStep] = useState<'phone' | 'verify'>('phone');
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	async function handleSendCode() {
		if (!phoneNumber) return;

		setIsLoading(true);
		setMessage(null);
		try {
			const code = await generateVerificationCode('default-user');
			if (code) {
				await sendVerificationCode(phoneNumber, code);
				setStep('verify');
				setMessage({ type: 'success', text: 'Code sent! Check your WhatsApp.' });
			}
		} catch {
			setMessage({ type: 'error', text: 'Failed to send code. Please try again.' });
		} finally {
			setIsLoading(false);
		}
	}

	async function handleVerify() {
		if (!verificationCode || verificationCode.length !== 6) return;

		setIsLoading(true);
		setMessage(null);
		try {
			setMessage({ type: 'success', text: 'WhatsApp connected successfully!' });
			onComplete?.();
			setTimeout(() => setIsOpen(false), 1500);
		} catch {
			setMessage({ type: 'error', text: 'Invalid code. Please try again.' });
		} finally {
			setIsLoading(false);
		}
	}

	const Spinner = Loader2;

	if (variant === 'inline') {
		return (
			<div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
				<div className="flex-1">
					<h4 className="font-medium">Connect WhatsApp</h4>
					<p className="text-sm text-muted-foreground">Get updates on WhatsApp</p>
				</div>
				<Button onClick={() => setIsOpen(true)}>Connect</Button>
			</div>
		);
	}

	if (variant === 'dialog') {
		return (
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Connect WhatsApp</DialogTitle>
						<DialogDescription>
							Get study reminders and updates directly on WhatsApp
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						{message && (
							<div
								className={`p-3 rounded-md text-sm ${
									message.type === 'success'
										? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
										: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
								}`}
							>
								{message.text}
							</div>
						)}

						{step === 'phone' && (
							<div className="space-y-3">
								<Label htmlFor="wa-phone">Phone number</Label>
								<div className="flex gap-2">
									<Input
										id="wa-phone"
										type="tel"
										placeholder="+27 81 234 5678"
										value={phoneNumber}
										onChange={(e) => setPhoneNumber(e.target.value)}
									/>
									<Button onClick={handleSendCode} disabled={!phoneNumber || isLoading}>
										{isLoading ? (
											<Spinner className="h-4 w-4 animate-spin" />
										) : (
											<ArrowRight className="h-4 w-4" />
										)}
									</Button>
								</div>
							</div>
						)}

						{step === 'verify' && (
							<div className="space-y-3">
								<Label htmlFor="wa-code">Verification code</Label>
								<div className="flex gap-2">
									<Input
										id="wa-code"
										type="text"
										placeholder="123456"
										value={verificationCode}
										onChange={(e) => setVerificationCode(e.target.value)}
										maxLength={6}
										className="w-32"
									/>
									<Button onClick={handleVerify} disabled={!verificationCode || isLoading}>
										{isLoading ? <Spinner className="h-4 w-4 animate-spin" /> : 'Verify'}
									</Button>
								</div>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<MessageSquare className="h-5 w-5 text-green-600" />
					Connect WhatsApp
				</CardTitle>
				<CardDescription>Get study reminders and updates directly on WhatsApp</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{message && (
					<div
						className={`p-3 rounded-md text-sm ${
							message.type === 'success'
								? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
								: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
						}`}
					>
						{message.text}
					</div>
				)}

				<div className="grid gap-4">
					{BENEFITS.map((benefit, index) => (
						<div key={index} className="flex items-start gap-3">
							<div className="mt-0.5 rounded-full bg-green-100 p-1 dark:bg-green-900/30">
								<benefit.icon className="h-4 w-4 text-green-600" />
							</div>
							<div>
								<p className="font-medium text-sm">{benefit.title}</p>
								<p className="text-xs text-muted-foreground">{benefit.description}</p>
							</div>
						</div>
					))}
				</div>

				{step === 'phone' && (
					<div className="space-y-3">
						<Label htmlFor="wa-phone-inline">Phone number</Label>
						<div className="flex gap-2">
							<Input
								id="wa-phone-inline"
								type="tel"
								placeholder="+27 81 234 5678"
								value={phoneNumber}
								onChange={(e) => setPhoneNumber(e.target.value)}
							/>
							<Button onClick={handleSendCode} disabled={!phoneNumber || isLoading}>
								{isLoading ? <Spinner className="h-4 w-4 animate-spin" /> : 'Send Code'}
							</Button>
						</div>
					</div>
				)}

				{step === 'verify' && (
					<div className="space-y-3">
						<Label htmlFor="wa-code-inline">Verification code</Label>
						<div className="flex gap-2">
							<Input
								id="wa-code-inline"
								type="text"
								placeholder="123456"
								value={verificationCode}
								onChange={(e) => setVerificationCode(e.target.value)}
								maxLength={6}
								className="w-32"
							/>
							<Button onClick={handleVerify} disabled={!verificationCode || isLoading}>
								{isLoading ? <Spinner className="h-4 w-4 animate-spin" /> : 'Verify'}
							</Button>
						</div>
					</div>
				)}

				<Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setIsOpen(true)}>
					{isLoading ? <Spinner className="h-4 w-4 animate-spin mr-2" /> : null}
					Connect WhatsApp
				</Button>
			</CardContent>
		</Card>
	);
}
