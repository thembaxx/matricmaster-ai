import {
	Cancel01Icon,
	Chat01Icon,
	File01Icon,
	Search01Icon,
	Tick01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { SearchX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/input';
import type { ContentFlag } from './moderation-types';
import { getSeverityColor, getStatusColor } from './moderation-types';

interface FlaggedContentListProps {
	filteredFlags: ContentFlag[];
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	statusFilter: string;
	setStatusFilter: (value: string) => void;
	handleAction: (flagId: string, action: 'remove' | 'dismiss') => void;
}

export function FlaggedContentList({
	filteredFlags,
	searchQuery,
	setSearchQuery,
	statusFilter,
	setStatusFilter,
	handleAction,
}: FlaggedContentListProps) {
	return (
		<>
			{/* Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex gap-4">
						<div className="flex-1 relative">
							<HugeiconsIcon
								icon={Search01Icon}
								className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
							/>
							<Input
								placeholder="search flagged content..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
						<select
							title="status filter"
							className="px-3 py-2 border rounded-md"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">all status</option>
							<option value="pending">pending</option>
							<option value="reviewed">reviewed</option>
							<option value="actioned">actioned</option>
							<option value="dismissed">dismissed</option>
						</select>
					</div>
				</CardContent>
			</Card>

			{/* Flagged Items */}
			<div className="space-y-4">
				{filteredFlags.map((flag) => (
					<Card key={flag.id}>
						<CardContent className="pt-6">
							<div className="flex items-start justify-between">
								<div className="flex items-start gap-4">
									<div className="p-2 bg-muted rounded-lg">
										{flag.contentType === 'comment' ? (
											<HugeiconsIcon icon={Chat01Icon} className="h-5 w-5" />
										) : (
											<HugeiconsIcon icon={File01Icon} className="h-5 w-5" />
										)}
									</div>
									<div>
										<div className="flex items-center gap-2 mb-1">
											<Badge variant="outline">{flag.contentType.toLowerCase()}</Badge>
											<Badge className={getStatusColor(flag.status)}>
												{flag.status.toLowerCase()}
											</Badge>
											<Badge
												className={getSeverityColor(flag.flagReason === 'Spam' ? 'medium' : 'high')}
											>
												{flag.flagReason.toLowerCase()}
											</Badge>
										</div>
										<p className="text-sm mb-2">&quot;{flag.contentPreview}&quot;</p>
										<p className="text-xs text-muted-foreground">
											reported by {flag.reporterName.toLowerCase()} •{' '}
											{new Date(flag.createdAt).toLocaleString()}
										</p>
										{flag.flagDetails && (
											<p className="text-xs text-muted-foreground mt-1 lowercase">
												details: {flag.flagDetails}
											</p>
										)}
									</div>
								</div>
								{flag.status === 'pending' && (
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="destructive"
											onClick={() => handleAction(flag.id, 'remove')}
										>
											<HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 mr-1" />
											remove
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleAction(flag.id, 'dismiss')}
										>
											<HugeiconsIcon icon={Tick01Icon} className="h-4 w-4 mr-1" />
											dismiss
										</Button>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{filteredFlags.length === 0 && (
				<EmptyState
					icon={SearchX}
					title="no matching content"
					description="no flagged content matches your current search or filter criteria."
				/>
			)}
		</>
	);
}
