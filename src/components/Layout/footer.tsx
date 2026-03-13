'use client';

import {
	Facebook01Icon,
	InstagramIcon,
	Linkedin01Icon,
	Mail01Icon,
	NewTwitterIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
	product: [
		{ label: 'Features', href: '/#features' },
		{ label: 'How it works', href: '/onboarding' },
		{ label: 'Pricing', href: '/pricing' },
		{ label: 'For schools', href: '/schools' },
	],
	resources: [
		{ label: 'Study guides', href: '/resources' },
		{ label: 'Past papers', href: '/past-papers' },
		{ label: 'Flashcards', href: '/flashcards' },
		{ label: 'AI tutor', href: '/ai-tutor' },
	],
	company: [
		{ label: 'About us', href: '/about' },
		{ label: 'Careers', href: '/careers' },
		{ label: 'Blog', href: '/blog' },
		{ label: 'Press', href: '/press' },
	],
	legal: [
		{ label: 'Terms of service', href: '/terms' },
		{ label: 'Privacy policy', href: '/privacy' },
	],
};

const socialLinks = [
	{ icon: Facebook01Icon, href: 'https://facebook.com/matricmaster', label: 'Facebook' },
	{ icon: NewTwitterIcon, href: 'https://twitter.com/matricmaster', label: 'Twitter' },
	{ icon: InstagramIcon, href: 'https://instagram.com/matricmaster', label: 'Instagram' },
	{ icon: Linkedin01Icon, href: 'https://linkedin.com/company/matricmaster', label: 'LinkedIn' },
];

export function Footer() {
	return (
		<footer className="bg-background border-t">
			<div className="container mx-auto px-4 py-12 md:py-16">
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
					{/* Brand */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
						className="col-span-2 md:col-span-3 lg:col-span-2"
					>
						<Link href="/" className="flex items-center gap-2 mb-4">
							<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tiimo-lavender to-purple-600 flex items-center justify-center">
								<span className="text-white font-bold text-sm">M</span>
							</div>
							<span className="text-xl font-semibold">MatricMaster</span>
						</Link>
						<p className="text-sm text-muted-foreground mb-6 max-w-sm leading-relaxed">
							Your AI-powered study companion for South African Grade 12 students. Master your
							matric exams with personalized practice and expert guidance.
						</p>
						<div className="flex gap-2">
							{socialLinks.map((social, index) => (
								<m.div
									key={social.label}
									initial={{ opacity: 0, scale: 0 }}
									whileInView={{ opacity: 1, scale: 1 }}
									viewport={{ once: true }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
								>
									<Link
										href={social.href}
										className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all rounded-full p-2 hover:bg-muted"
										aria-label={social.label}
									>
										<HugeiconsIcon icon={social.icon} className="h-4 w-4" />
									</Link>
								</m.div>
							))}
						</div>
					</m.div>

					{/* Product */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						<h3 className="font-medium text-sm mb-4">Product</h3>
						<ul className="space-y-2.5">
							{footerLinks.product.map((link) => (
								<li key={link.label}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</m.div>

					{/* Resources */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.15 }}
					>
						<h3 className="font-medium text-sm mb-4">Resources</h3>
						<ul className="space-y-2.5">
							{footerLinks.resources.map((link) => (
								<li key={link.label}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</m.div>

					{/* Company */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<h3 className="font-medium text-sm mb-4">Company</h3>
						<ul className="space-y-2.5">
							{footerLinks.company.map((link) => (
								<li key={link.label}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground transition-colors"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</m.div>

					{/* Newsletter */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.25 }}
						className="col-span-2 md:col-span-3 lg:col-span-1"
					>
						<h3 className="font-medium text-sm mb-4">Stay updated</h3>
						<p className="text-xs text-muted-foreground mb-4">
							Get study tips and exam prep delivered to your inbox.
						</p>
						<div className="flex flex-col gap-2">
							<Input
								type="email"
								placeholder="your@email.com"
								className="h-9 text-sm"
								aria-label="Email for updates"
							/>
							<Button size="sm" className="h-9 text-sm font-medium">
								Subscribe
							</Button>
						</div>
					</m.div>
				</div>

				<Separator className="my-8" />

				<m.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="flex flex-col md:flex-row justify-between items-center gap-4"
				>
					<div className="flex flex-col md:flex-row items-center gap-2 text-xs text-muted-foreground">
						<span>© {new Date().getFullYear()} MatricMaster AI. All rights reserved.</span>
						<span className="hidden md:inline">•</span>
						<div className="flex gap-4">
							{footerLinks.legal.map((link) => (
								<Link
									key={link.label}
									href={link.href}
									className="hover:text-foreground transition-colors"
								>
									{link.label}
								</Link>
							))}
						</div>
					</div>
					<Link
						href="mailto:hello@matricmaster.ai"
						className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
					>
						<HugeiconsIcon icon={Mail01Icon} className="h-3.5 w-3.5" />
						<span>hello@matricmaster.ai</span>
					</Link>
				</m.div>
			</div>
		</footer>
	);
}
