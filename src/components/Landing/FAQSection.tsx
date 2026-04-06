'use client';

import { m } from 'framer-motion';
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
			'our ai is trained specifically on the south african curriculum and past exam papers, providing accurate explanations.',
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
	return (
		<section className="py-20 lg:py-32">
			<m.div
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-100px' }}
				transition={{ duration: 0.6 }}
				className="text-center mb-16"
			>
				<h2 className="heading-2 mb-4">frequently asked questions</h2>
				<p className="body-md text-muted-foreground mx-auto">
					everything you need to know about matricmaster.
				</p>
			</m.div>

			<m.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-100px' }}
				transition={{ duration: 0.6, delay: 0.2 }}
				className="max-w-3xl mx-auto px-4"
			>
				<Accordion type="single" collapsible className="w-full">
					{FAQ_ITEMS.map((item, index) => (
						<AccordionItem key={index} value={`item-${index}`} className="border-border">
							<AccordionTrigger className="body-md font-medium hover:no-underline">
								{item.question}
							</AccordionTrigger>
							<AccordionContent className="body-md text-muted-foreground">
								{item.answer}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</m.div>
		</section>
	);
}
