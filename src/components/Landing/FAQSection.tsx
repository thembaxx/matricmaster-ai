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
		question: 'Is it really free?',
		answer: 'Yes! You can ask up to 10 questions per day on the free plan.',
	},
	{
		question: 'Which subjects do you cover?',
		answer:
			'All major NSC subjects including Mathematics, Physics, Life Sciences, English, Afrikaans, Geography, History, Accounting, and Economics.',
	},
	{
		question: 'How accurate are the answers?',
		answer:
			'Our AI is trained specifically on the South African curriculum and past exam papers, providing accurate explanations.',
	},
	{
		question: 'Is my data private?',
		answer:
			'Yes, your study data is encrypted and never shared. We prioritize your privacy and security.',
	},
	{
		question: 'Can I cancel anytime?',
		answer: 'Yes, you can cancel your subscription anytime with no hidden fees or penalties.',
	},
	{
		question: 'How do I upgrade to Pro?',
		answer:
			'Go to Settings > Subscription in your dashboard, or click "Go Pro" on any pricing page.',
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
				<h2 className="heading-2 mb-4">Frequently asked questions</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Everything you need to know about MatricMaster.
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
							<AccordionTrigger className="text-base font-medium hover:no-underline">
								{item.question}
							</AccordionTrigger>
							<AccordionContent className="text-base text-muted-foreground">
								{item.answer}
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>
			</m.div>
		</section>
	);
}
