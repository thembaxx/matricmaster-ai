'use client';

import { motion as m, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ_ITEMS = [
	{
		question: 'is it really free?',
		answer: 'yes! you can ask up to 10 questions per day on the free plan.',
	},
	{
		question: 'which subjects do you cover?',
		answer:
			'all major nsc subjects including mathematics, physics, life sciences, english, afrikaans, geography, history, accounting, and economics.',
	},
	{
		question: 'how accurate are the answers?',
		answer:
			'our AI is trained specifically on the south african curriculum and past exam papers, providing accurate explanations.',
	},
	{
		question: 'is my data private?',
		answer:
			'yes, your study data is encrypted and never shared. we prioritize your privacy and security.',
	},
	{
		question: 'can i cancel anytime?',
		answer: 'yes, you can cancel your subscription anytime with no hidden fees or penalties.',
	},
	{
		question: 'how do i upgrade to pro?',
		answer:
			'go to settings > subscription in your dashboard, or click "go pro" on any pricing page.',
	},
];

export function FAQSection() {
	const sectionRef = useRef<HTMLElement>(null);
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ['start end', 'end start'],
	});

	const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

	return (
		<section ref={sectionRef} className="py-32 lg:py-48">
			<m.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-100px' }}
				transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
				className="text-center mb-16"
			>
				<p className="text-xs font-black tracking-[0.25em] text-primary uppercase mb-5">faq</p>
				<h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
					Frequently asked questions
				</h2>
				<p className="text-lg text-muted-foreground max-w-xl mx-auto">
					Everything you need to know about Lumni.
				</p>
			</m.div>

			<m.div style={{ y }} className="max-w-3xl mx-auto px-6">
				<Accordion type="single" collapsible className="w-full">
					{FAQ_ITEMS.map((item, index) => (
						<AccordionItem key={index} value={`item-${index}`} className="border-border/40">
							<AccordionTrigger className="text-lg font-medium hover:no-underline py-5">
								{item.question}
							</AccordionTrigger>
							<AccordionContent className="text-muted-foreground text-base leading-relaxed">
								{item.answer}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</m.div>
		</section>
	);
}
