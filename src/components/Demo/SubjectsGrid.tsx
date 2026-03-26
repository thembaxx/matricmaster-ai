'use client';

import { FluentEmoji } from '@lobehub/fluent-emoji';
import { Card, CardContent } from '@/components/ui/card';
import { DataSection } from '@/components/ui/data-loader';
import type { Subject } from '@/content/mock';
import { subjectEmojiMap } from './constants';

interface SubjectsGridProps {
	subjects: Subject[];
}

export function SubjectsGrid({ subjects }: SubjectsGridProps) {
	return (
		<DataSection
			title="Subjects"
			description="Available NSC subjects for Grade 12"
			className="mb-8"
		>
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				{subjects.map((subject) => {
					const emoji = subjectEmojiMap[subject.name] || 'Books';
					return (
						<Card
							key={subject.id}
							className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
						>
							<CardContent className="pt-6">
								<div className="flex flex-col items-center text-center gap-3">
									<div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
										<FluentEmoji type="3d" emoji={emoji} size={28} className="w-7 h-7" />
									</div>
									<div>
										<h3 className="font-semibold">{subject.name}</h3>
										<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
											{subject.description}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</DataSection>
	);
}
