'use client';

import { AlertCircle, Check, ChevronDown, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { ContentFilterConfig, ContentLevel } from '@/lib/contentFilter';
import {
	AGE_GROUPS,
	CONTENT_HIERARCHY,
	canAccessHigherLevel,
	getContentLevelLabel,
	isLevelAllowed,
} from '@/lib/contentFilter';

interface ContentFilterProps {
	config: ContentFilterConfig;
	onConfigChange: (config: ContentFilterConfig) => void;
	childAge?: number;
}

const LEVEL_DESCRIPTIONS: Record<ContentLevel, string> = {
	grade10: 'basic NSC concepts, foundational topics',
	grade11: 'intermediate NSC concepts, building on foundations',
	grade12: 'full NSC curriculum, exam preparation',
	tertiary: 'university-level content, advanced topics',
	all: 'access to all content levels',
};

export function ContentFilter({ config, onConfigChange, childAge }: ContentFilterProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [hasOverride, setHasOverride] = useState(false);

	const handleLevelChange = (level: ContentLevel) => {
		onConfigChange({
			...config,
			allowedLevels: [level],
		});
	};

	const handleAddLevel = (level: ContentLevel) => {
		if (!config.allowedLevels.includes(level)) {
			onConfigChange({
				...config,
				allowedLevels: [...config.allowedLevels, level],
			});
		}
	};

	const handleRemoveLevel = (level: ContentLevel) => {
		if (level !== 'all') {
			onConfigChange({
				...config,
				allowedLevels: config.allowedLevels.filter((l) => l !== level),
			});
		}
	};

	const currentLevel = config.allowedLevels[0] || 'grade12';
	const recommendedLevel = childAge
		? AGE_GROUPS.find((g) => childAge >= g.minAge && childAge <= g.maxAge)?.level || 'grade12'
		: null;

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="pb-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
							<Shield className="w-5 h-5 text-primary" />
						</div>
						<div>
							<CardTitle className="text-base">content filter</CardTitle>
							<p className="text-sm text-muted-foreground">
								control what content your child can access
							</p>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{recommendedLevel && (
						<div className="p-3 bg-muted/50 rounded-lg">
							<p className="text-sm">
								<span className="text-muted-foreground">recommended for age {childAge}: </span>
								<span className="font-medium">{getContentLevelLabel(recommendedLevel)}</span>
							</p>
						</div>
					)}

					<div className="space-y-2">
						<label htmlFor="content-level" className="text-sm font-medium">
							content level
						</label>
						<Select
							value={currentLevel}
							onValueChange={(v) => handleLevelChange(v as ContentLevel)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{AGE_GROUPS.map((group) => (
									<SelectItem key={group.level} value={group.level}>
										<div className="flex flex-col items-start">
											<span>{group.displayName}</span>
											<span className="text-xs text-muted-foreground">
												ages {group.minAge}-{group.maxAge}
											</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="p-4 bg-muted/50 rounded-xl">
						<p className="text-sm font-medium mb-2">what this level includes:</p>
						<p className="text-sm text-muted-foreground">{LEVEL_DESCRIPTIONS[currentLevel]}</p>
					</div>

					<Collapsible open={isOpen} onOpenChange={setIsOpen}>
						<CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium">
							advanced options
							<ChevronDown
								className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
							/>
						</CollapsibleTrigger>

						<CollapsibleContent className="pt-4 space-y-4">
							<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
								<div>
									<p className="text-sm font-medium">strict mode</p>
									<p className="text-xs text-muted-foreground">
										hide all content above selected level
									</p>
								</div>
								<Button
									variant={config.strictMode ? 'default' : 'outline'}
									size="sm"
									onClick={() => onConfigChange({ ...config, strictMode: !config.strictMode })}
								>
									{config.strictMode ? 'on' : 'off'}
								</Button>
							</div>

							<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
								<div>
									<p className="text-sm font-medium">override for advanced learners</p>
									<p className="text-xs text-muted-foreground">allow access to higher levels</p>
								</div>
								<Button
									variant={hasOverride ? 'default' : 'outline'}
									size="sm"
									onClick={() => setHasOverride(!hasOverride)}
								>
									{hasOverride ? 'enabled' : 'disabled'}
								</Button>
							</div>

							<div className="space-y-2">
								<span className="text-sm font-medium">allow additional levels</span>
								<div className="flex flex-wrap gap-2">
									{CONTENT_HIERARCHY.filter((l) => l !== currentLevel).map((level) => (
										<Button
											key={level}
											variant="outline"
											size="sm"
											onClick={() => handleAddLevel(level)}
											disabled={config.allowedLevels.includes(level)}
										>
											+ {getContentLevelLabel(level)}
										</Button>
									))}
								</div>
							</div>
						</CollapsibleContent>
					</Collapsible>

					<div className="pt-4 border-t">
						<p className="text-xs text-muted-foreground text-center">
							changes apply immediately to all content across the platform
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">current access</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2">
						{config.allowedLevels.map((level) => (
							<div
								key={level}
								className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full"
							>
								<Check className="w-3 h-3 text-primary" />
								<span className="text-sm font-medium">{getContentLevelLabel(level)}</span>
								{level !== 'all' && (
									<button
										type="button"
										onClick={() => handleRemoveLevel(level)}
										className="text-muted-foreground hover:text-destructive"
									>
										×
									</button>
								)}
							</div>
						))}
					</div>

					{hasOverride && (
						<div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
							<AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
							<div>
								<p className="text-sm font-medium">override enabled</p>
								<p className="text-xs text-muted-foreground">
									your child can access content from higher levels with parent approval
								</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export function useContentFilter(defaultConfig?: Partial<ContentFilterConfig>) {
	const [config, setConfig] = useState<ContentFilterConfig>({
		allowedLevels: ['grade10', 'grade11', 'grade12'],
		strictMode: false,
		showAdvancedOption: true,
		...(defaultConfig || {}),
	});

	const isContentAllowed = (contentLevel: ContentLevel) => {
		return isLevelAllowed(contentLevel, config.allowedLevels);
	};

	const canAccess = (targetLevel: ContentLevel) => {
		return canAccessHigherLevel(config.allowedLevels[0], targetLevel, hasOverride);
	};

	const hasOverride = config.allowedLevels.length > 1;

	return {
		config,
		setConfig,
		isContentAllowed,
		canAccess,
		hasOverride,
	};
}
