import type { Metadata } from 'next';
import { FocusContent } from '@/components/Layout/FocusContent';
import { ScrollArea } from '@/components/ui/scroll-area';

export const metadata: Metadata = {
	title: 'Terms of Service | Lumni AI',
	description: 'Read our terms of service and acceptable use policy.',
};

export default function TermsOfServicePage() {
	return (
		<FocusContent>
			<ScrollArea className="h-screen">
				<div className="max-w-3xl mx-auto px-6 py-12">
					<h1 className="text-3xl font-semibold mb-8">Terms of service</h1>

					<div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
						<section>
							<h2 className="text-xl font-semibold mb-4">1. Acceptance of terms</h2>
							<p className="text-muted-foreground">
								By accessing and using Lumni AI ("the Service"), you accept and agree to be bound by
								the terms and provision of this agreement. If you are using the Service on behalf of
								a minor, you represent that you are their parent or legal guardian and agree to
								these terms on their behalf.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">2. Description of service</h2>
							<p className="text-muted-foreground mb-4">
								Lumni AI is an educational platform providing:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
								<li>AI-powered tutoring and study assistance</li>
								<li>Interactive quizzes and practice questions</li>
								<li>Progress tracking and gamification</li>
								<li>Study planning and organization tools</li>
								<li>Flashcard creation and review</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">3. User accounts</h2>
							<p className="text-muted-foreground mb-4">To use our Service, you must:</p>
							<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
								<li>Create an account with accurate information</li>
								<li>Be at least 13 years of age (or the minimum age in your jurisdiction)</li>
								<li>Keep your account credentials secure</li>
								<li>Accept responsibility for all activities under your account</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">4. Acceptable use</h2>
							<p className="text-muted-foreground mb-4">You agree NOT to:</p>
							<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
								<li>Use the Service for any unlawful purpose</li>
								<li>Attempt to gain unauthorized access to any part of the Service</li>
								<li>Upload or transmit viruses, malware, or harmful code</li>
								<li>Interfere with or disrupt the Service or servers</li>
								<li>Use the Service to generate spam, abusive content, or misinformation</li>
								<li>Attempt to reverse engineer or extract AI model logic</li>
								<li>Share account credentials with others</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">5. Academic integrity</h2>
							<p className="text-muted-foreground">
								Lumni AI is designed to support learning, not replace it. While our AI can explain
								concepts and provide guidance, you are responsible for understanding the material.
								Using the Service to cheat on assignments or exams violates both our terms and
								academic integrity policies.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">6. Intellectual property</h2>
							<p className="text-muted-foreground mb-4">
								The Service and its original content are owned by Lumni AI and are protected by
								copyright, trademark, and other laws. You may:
							</p>
							<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
								<li>Use the Service for personal, educational purposes</li>
								<li>Create and share your own flashcards and study materials</li>
							</ul>
							<p className="text-muted-foreground mt-4">
								You may NOT copy, distribute, or modify any part of the Service without our written
								consent.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">7. AI-generated content</h2>
							<p className="text-muted-foreground">
								Our AI features generate content based on machine learning models. While we strive
								for accuracy, AI-generated content may contain errors or inaccuracies. You should
								verify important information, especially for exam preparation. We are not
								responsible for any decisions made based on AI-generated content.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">8. Limitation of liability</h2>
							<p className="text-muted-foreground">
								The Service is provided "as is" without warranties of any kind. We do not guarantee
								that the Service will be uninterrupted, secure, or error-free. To the maximum extent
								permitted by law, we shall not be liable for any indirect, incidental, special, or
								consequential damages arising from your use of the Service.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">9. Termination</h2>
							<p className="text-muted-foreground">
								We may terminate or suspend your account at any time for violation of these terms or
								for any other reason at our sole discretion. Upon termination, your right to use the
								Service immediately ceases.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">10. Changes to terms</h2>
							<p className="text-muted-foreground">
								We reserve the right to modify these terms at any time. Continued use of the Service
								after changes constitutes acceptance of the new terms.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">11. Governing law</h2>
							<p className="text-muted-foreground">
								These terms shall be governed by and construed in accordance with the laws of South
								Africa, without regard to its conflict of law provisions.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4">12. Contact</h2>
							<p className="text-muted-foreground">
								For questions about these terms, contact us at:{' '}
								<a href="mailto:legal@lumni.ai" className="text-primary hover:underline">
									legal@lumni.ai
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
