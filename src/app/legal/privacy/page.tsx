import type { Metadata } from 'next';
import { FocusContent } from '@/components/Layout/FocusContent';
import { ScrollArea } from '@/components/ui/scroll-area';

export const metadata: Metadata = {
	title: 'Privacy Policy | MatricMaster',
	description: 'Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
	return (
		<FocusContent>
			<ScrollArea className="h-screen">
				<div className="max-w-3xl mx-auto px-6 py-12">
					<h1 className="text-3xl font-semibold mb-8">Privacy policy</h1>

					<div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
						<section>
							<h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
							<p className="text-muted-foreground">
								MatricMaster ("we," "our," or "us") is committed to protecting your privacy. This
								Privacy Policy explains how we collect, use, disclose, and safeguard your
								information when you use our educational platform.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">2. Information we collect</h2>
							<p className="text-muted-foreground mb-4">
								We collect the following types of information:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
								<li>
									<strong>Account information:</strong> Name, email address, and profile data
								</li>
								<li>
									<strong>Learning data:</strong> Quiz scores, progress, study sessions, and
									achievements
								</li>
								<li>
									<strong>Usage data:</strong> How you interact with the platform, features used,
									and time spent
								</li>
								<li>
									<strong>Device information:</strong> Browser type, device type, and IP address
								</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">3. How we use your information</h2>
							<p className="text-muted-foreground mb-4">We use your information to:</p>
							<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
								<li>Provide and personalize our educational services</li>
								<li>Track your learning progress and provide recommendations</li>
								<li>Improve our platform and develop new features</li>
								<li>Communicate with you about updates and support</li>
								<li>Ensure platform security and prevent fraud</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">4. Data storage and security</h2>
							<p className="text-muted-foreground">
								Your data is stored on secure servers with industry-standard encryption. We
								implement appropriate technical and organizational measures to protect your personal
								information against unauthorized access, alteration, disclosure, or destruction.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">5. Third-party services</h2>
							<p className="text-muted-foreground">
								We may share anonymized data with third-party service providers for analytics and
								platform improvement. We do not sell your personal information to third parties. Our
								AI features are powered by Google Gemini, which processes data in accordance with
								their privacy practices.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">6. Children's privacy</h2>
							<p className="text-muted-foreground">
								Our platform is designed for students (typically ages 13-18). We collect minimum
								necessary information for educational purposes. Parents or guardians can review and
								request deletion of their child's data by contacting us.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">7. Your rights</h2>
							<p className="text-muted-foreground mb-4">You have the right to:</p>
							<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
								<li>Access your personal data</li>
								<li>Correct inaccurate data</li>
								<li>Request deletion of your data</li>
								<li>Object to processing of your data</li>
								<li>Export your data in a portable format</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">8. Changes to this policy</h2>
							<p className="text-muted-foreground">
								We may update this Privacy Policy from time to time. We will notify you of any
								material changes by posting the new policy on this page and updating the "last
								modified" date.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">9. Contact us</h2>
							<p className="text-muted-foreground">
								If you have any questions about this Privacy Policy, please contact us at:{' '}
								<a href="mailto:privacy@matricmaster.ai" className="text-primary hover:underline">
									privacy@matricmaster.ai
								</a>
							</p>
						</section>

						<p className="text-sm text-muted-foreground pt-8 border-t">Last updated: March 2026</p>
					</div>
				</div>
			</ScrollArea>
		</FocusContent>
	);
}
