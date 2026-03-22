import { Loading03Icon, Search01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import type { User } from '@/lib/db/better-auth-schema';

interface UserManagementProps {
	users: User[];
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	isLoading: boolean;
	handleSearch: () => void;
	handleToggleBlock: (userId: string) => void;
}

export function UserManagement({
	users,
	searchQuery,
	setSearchQuery,
	isLoading,
	handleSearch,
	handleToggleBlock,
}: UserManagementProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>user management</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-2 flex-col sm:flex-row">
					<div className="relative flex-1">
						<HugeiconsIcon
							icon={Search01Icon}
							className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
						/>
						<Input
							placeholder="search users..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
							className="pl-10"
						/>
					</div>
					<Button onClick={handleSearch} disabled={isLoading}>
						{isLoading ? (
							<HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
						) : (
							<HugeiconsIcon icon={Search01Icon} className="h-4 w-4" />
						)}
						<span className="hidden sm:inline">search</span>
					</Button>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<HugeiconsIcon
							icon={Loading03Icon}
							className="h-8 w-8 animate-spin text-muted-foreground"
						/>
					</div>
				) : users.length === 0 ? (
					<div className="text-center py-12 text-muted-foreground">
						<HugeiconsIcon icon={UserGroupIcon} className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p className="font-medium">no users found</p>
						<p className="text-sm mt-1">try adjusting your search criteria</p>
					</div>
				) : (
					<div className="border rounded-lg overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>user</TableHead>
									<TableHead>email</TableHead>
									<TableHead className="text-right">actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map((user) => (
									<TableRow key={user.id} className="transition-colors hover:bg-muted/50">
										<TableCell>
											<div className="flex items-center gap-2">
												<Avatar className="h-8 w-8">
													<AvatarFallback className="text-xs">
														{user.name?.charAt(0) || 'U'}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium">{user.name}</span>
											</div>
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
										<TableCell className="text-right">
											<Button
												variant={(user as any).isBlocked ? 'outline' : 'destructive'}
												size="sm"
												onClick={() => handleToggleBlock(user.id)}
												className="transition-all"
											>
												{(user as any).isBlocked ? 'unblock' : 'block'}
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
