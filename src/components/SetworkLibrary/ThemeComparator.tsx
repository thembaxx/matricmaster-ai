'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Setwork, Theme } from '@/content/setworks/types';

interface ThemeComparatorProps {
	setworks: Setwork[];
}

export function ThemeComparator({ setworks }: ThemeComparatorProps) {
	const [leftId, setLeftId] = useState(setworks[0]?.id || '');
	const [rightId, setRightId] = useState(
		setworks.length > 1 ? setworks[1].id : setworks[0]?.id || ''
	);

	const leftSetwork = setworks.find((s) => s.id === leftId);
	const rightSetwork = setworks.find((s) => s.id === rightId);

	const leftThemes = leftSetwork?.themes || [];
	const rightThemes = rightSetwork?.themes || [];

	const similarThemes = findSimilarThemes(leftThemes, rightThemes);

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<p className="text-sm font-medium text-muted-foreground">First setwork</p>
					<Select value={leftId} onValueChange={setLeftId}>
						<SelectTrigger aria-label="First setwork">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{setworks.map((s) => (
								<SelectItem key={s.id} value={s.id}>
									{s.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="space-y-2">
					<p className="text-sm font-medium text-muted-foreground">Second setwork</p>
					<Select value={rightId} onValueChange={setRightId}>
						<SelectTrigger aria-label="Second setwork">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{setworks.map((s) => (
								<SelectItem key={s.id} value={s.id}>
									{s.title}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{similarThemes.length > 0 && (
				<Card className="p-4 border-primary/30 bg-primary/5">
					<h4 className="font-bold text-sm mb-2 text-primary">Similar themes found</h4>
					<div className="space-y-2">
						{similarThemes.map((pair) => (
							<div key={`${pair.left}-${pair.right}`} className="text-sm">
								<span className="font-medium">{pair.left}</span>
								<span className="text-muted-foreground"> ~ </span>
								<span className="font-medium">{pair.right}</span>
							</div>
						))}
					</div>
				</Card>
			)}

			{leftSetwork && rightSetwork && (
				<Tabs defaultValue="grid" className="w-full">
					<TabsList>
						<TabsTrigger value="grid">Side by Side</TabsTrigger>
						<TabsTrigger value="left">{leftSetwork.title}</TabsTrigger>
						<TabsTrigger value="right">{rightSetwork.title}</TabsTrigger>
					</TabsList>

					<TabsContent value="grid">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-3">
								<h4 className="font-bold text-sm text-muted-foreground">{leftSetwork.title}</h4>
								{leftThemes.map((theme) => (
									<ThemeCompareCard
										key={theme.id}
										theme={theme}
										isSimilar={similarThemes.some((p) => p.left === theme.name)}
									/>
								))}
							</div>
							<div className="space-y-3">
								<h4 className="font-bold text-sm text-muted-foreground">{rightSetwork.title}</h4>
								{rightThemes.map((theme) => (
									<ThemeCompareCard
										key={theme.id}
										theme={theme}
										isSimilar={similarThemes.some((p) => p.right === theme.name)}
									/>
								))}
							</div>
						</div>
					</TabsContent>

					<TabsContent value="left">
						<div className="space-y-3">
							{leftThemes.map((theme) => (
								<ThemeCompareCard key={theme.id} theme={theme} />
							))}
						</div>
					</TabsContent>

					<TabsContent value="right">
						<div className="space-y-3">
							{rightThemes.map((theme) => (
								<ThemeCompareCard key={theme.id} theme={theme} />
							))}
						</div>
					</TabsContent>
				</Tabs>
			)}
		</div>
	);
}

function ThemeCompareCard({ theme, isSimilar }: { theme: Theme; isSimilar?: boolean }) {
	return (
		<Card className={`p-4 ${isSimilar ? 'border-primary/40 bg-primary/5' : ''}`}>
			<h4 className="font-bold mb-1">{theme.name}</h4>
			<p className="text-sm text-muted-foreground">{theme.description}</p>
		</Card>
	);
}

function findSimilarThemes(left: Theme[], right: Theme[]): { left: string; right: string }[] {
	const pairs: { left: string; right: string }[] = [];
	const keywords: Record<string, string[]> = {
		masculinity: ['gender', 'man', 'strength'],
		tradition: ['change', 'culture', 'custom'],
		fate: ['destiny', 'choice', 'free will'],
		prejudice: ['discrimination', 'racism', 'apartheid', 'antisemitism'],
		mercy: ['forgiveness', 'compassion', 'reconciliation'],
		justice: ['law', 'punishment', 'court'],
		appearance: ['reality', 'deception', 'illusion'],
		language: ['communication', 'words', 'speech'],
		fear: ['anxiety', 'terror', 'dread'],
		apartheid: ['prejudice', 'segregation', 'discrimination', 'racism'],
		reconciliation: ['mercy', 'forgiveness', 'healing'],
		nature: ['land', 'environment', 'earth'],
	};

	for (const lt of left) {
		const ltLower = lt.name.toLowerCase();
		for (const rt of right) {
			const rtLower = rt.name.toLowerCase();
			if (ltLower === rtLower) {
				pairs.push({ left: lt.name, right: rt.name });
				continue;
			}
			const ltWords = ltLower.split(/\s+/);
			const rtWords = rtLower.split(/\s+/);
			if (ltWords.some((w) => rtWords.includes(w))) {
				pairs.push({ left: lt.name, right: rt.name });
				continue;
			}
			const ltKeys = keywords[ltWords[0]] || [];
			if (ltKeys.some((k) => rtWords.includes(k) || rtLower.includes(k))) {
				pairs.push({ left: lt.name, right: rt.name });
			}
		}
	}
	return pairs;
}
