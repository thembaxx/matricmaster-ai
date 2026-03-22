'use client';

import { Settings01Icon, Shield01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import type { AuthSession } from '@/lib/auth';
import { AnalyticsTab } from './components/AnalyticsTab';
import { OverviewTab } from './components/OverviewTab';
import { StatsGrid } from './components/StatsGrid';
import { UserManagement } from './components/UserManagement';

export default function AdminDashboardClient({
	initialSession: _initialSession,
}: {
	initialSession: AuthSession | null;
}) {
	const {
		activeTab,
		setActiveTab,
		users,
		searchQuery,
		setSearchQuery,
		isLoadingStats,
		isLoadingUsers,
		stats,
		subjectPerformance,
		handleSearch,
		handleToggleBlock,
	} = useAdminDashboard();

	return (
		<div className="min-h-screen bg-background py-4 px-6 md:p-8 pb-32">
			<div className="max-w-7xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<HugeiconsIcon icon={Shield01Icon} className="h-8 w-8 text-primary" />
							admin dashboard
						</h1>
						<p className="text-muted-foreground">platform management and analytics</p>
					</div>
					<Button variant="outline" size="sm">
						<HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 mr-2" />
						settings
					</Button>
				</div>

				<StatsGrid stats={stats} isLoading={isLoadingStats} />

				<Tabs
					defaultValue="overview"
					value={activeTab}
					onValueChange={setActiveTab}
					className="space-y-4"
				>
					<TabsList>
						<TabsTrigger value="overview">overview</TabsTrigger>
						<TabsTrigger value="users">users</TabsTrigger>
						<TabsTrigger value="analytics">analytics</TabsTrigger>
					</TabsList>

					<TabsContent value="overview">
						<OverviewTab />
					</TabsContent>

					<TabsContent value="users">
						<UserManagement
							users={users}
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							isLoading={isLoadingUsers}
							handleSearch={handleSearch}
							handleToggleBlock={handleToggleBlock}
						/>
					</TabsContent>

					<TabsContent value="analytics">
						<AnalyticsTab subjectPerformance={subjectPerformance} isLoading={isLoadingStats} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
