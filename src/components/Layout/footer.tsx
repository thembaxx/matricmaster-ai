'use client';

import { motion } from 'framer-motion';
import {
	Facebook01Icon as Facebook,
	InstagramIcon as Instagram,
	Linkedin01Icon as Linkedin,
	Mail01Icon as Mail,
	NewTwitterIcon as Twitter,
} from 'hugeicons-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
	company: [
		{ label: 'About Us', href: '/about' },
		{ label: 'How It Works', href: '/dashboard/onboarding' },
		{ label: 'Careers', href: '/careers' },
		{ label: 'Press', href: '/press' },
	],
	support: [
		{ label: 'Help Center', href: '/help' },
		{ label: 'Safety', href: '/safety' },
		{ label: 'Community Guidelines', href: '/guidelines' },
		{ label: 'Contact Us', href: '/contact' },
	],
	legal: [
		{ label: 'Terms of Service', href: '/terms' },
		{ label: 'Privacy Policy', href: '/privacy' },
		{ label: 'Cookie Policy', href: '/cookies' },
		{ label: 'Accessibility', href: '/accessibility' },
	],
};

const socialLinks = [
	{ icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
	{ icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
	{ icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
	{ icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export function Footer() {
	return (
		<footer className="bg-muted/30 border-t">
			<div className="container mx-auto px-4 py-12 md:py-16">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
						className="lg:col-span-2"
					>
						<Link href="/" className="flex items-center space-x-2 mb-4">
							<span className="text-xl font-bold bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
								Helios
							</span>
						</Link>
						<p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
							Empowering the modern workforce with a curated marketplace for elite home services.
							Verified excellence, community-driven trust.
						</p>
						<div className="flex space-x-3">
							{socialLinks.map((social, index) => (
								<motion.div
									key={social.label}
									initial={{ opacity: 0, scale: 0 }}
									whileInView={{ opacity: 1, scale: 1 }}
									viewport={{ once: true }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
								>
									<Link
										href={social.href}
										className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all rounded-full p-2 hover:bg-background/50"
										aria-label={social.label}
									>
										<social.icon className="h-5 w-5" />
									</Link>
								</motion.div>
							))}
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.1 }}
					>
						<h3 className="font-semibold mb-4">Company</h3>
						<ul className="space-y-3">
							{footerLinks.company.map((link) => (
								<li key={link.label}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<h3 className="font-semibold mb-4">Support</h3>
						<ul className="space-y-3">
							{footerLinks.support.map((link) => (
								<li key={link.label}>
									<Link
										href={link.href}
										className="text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.25 }}
					>
						<h3 className="font-semibold mb-4">Stay Updated</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Join our exclusive circle for industry insights and early access to promotions.
						</p>
						<div className="flex flex-col space-y-2">
							<Input
								type="email"
								placeholder="Your professional email"
								className="w-full focus:border-primary/50 transition-colors"
							/>
							<Button size="sm" className="w-full font-bold hover:scale-105 transition-transform">
								Join Now
							</Button>
						</div>
					</motion.div>
				</div>

				<Separator className="my-8" />

				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
				>
					<div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
						<span>
							© {new Date().getFullYear()} Helios Platform. All rights reserved. Built for
							excellence.
						</span>
						<div className="flex gap-4">
							{footerLinks.legal.map((link) => (
								<Link
									key={link.label}
									href={link.href}
									className="hover:text-foreground transition-colors hover:underline"
								>
									{link.label}
								</Link>
							))}
						</div>
					</div>
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-1 hover:text-foreground transition-colors">
							<Mail className="h-4 w-4" />
							<span>support@helios.com</span>
						</div>
					</div>
				</motion.div>
			</div>
		</footer>
	);
}
