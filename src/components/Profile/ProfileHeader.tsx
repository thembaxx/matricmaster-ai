'use client';

import {
	PencilEdit01Icon,
	SaveIcon,
	SchoolReportCardIcon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AvatarPicker } from '@/components/Profile/AvatarPicker';
import { SafeImage } from '@/components/SafeImage';
import { Button } from '@/components/ui/button';

interface ProfileHeaderProps {
	session: any;
	isEditing: boolean;
	setIsEditing: (editing: boolean) => void;
	editForm: { name: string; school: string; avatarId: string };
	setEditForm: (form: any) => void;
	handleSaveProfile: () => void;
	isSaving?: boolean;
}

export function ProfileHeader({
	session,
	isEditing,
	setIsEditing,
	editForm,
	setEditForm,
	handleSaveProfile,
	isSaving = false,
}: ProfileHeaderProps) {
	const user = session?.user;

	return (
		<div className="flex flex-col sm:flex-row items-center gap-8 bg-card/30 p-8 rounded-2xl border border-border/50">
			<div className="relative">
				<div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl relative border-4 border-background bg-muted flex items-center justify-center">
					{editForm.avatarId ? (
						<AvatarPicker
							selectedId={editForm.avatarId}
							onSelect={(id) => {
								if (isEditing) {
									setEditForm({ ...editForm, avatarId: id });
								} else {
									setIsEditing(true);
									setEditForm({ ...editForm, avatarId: id });
								}
							}}
						/>
					) : (
						<SafeImage
							src={user?.image || '/default-avatar.png'}
							alt={user?.name || 'User'}
							className="w-full h-full object-cover"
						/>
					)}
				</div>
				{!isEditing && (
					<button
						type="button"
						onClick={() => setIsEditing(true)}
						aria-label="Edit profile"
						className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
					>
						<HugeiconsIcon icon={PencilEdit01Icon} className="w-5 h-5" />
					</button>
				)}
			</div>

			<div className="flex-1 space-y-4 text-center sm:text-left w-full">
				{isEditing ? (
					<div className="space-y-4 max-w-md">
						<div className="space-y-2">
							<label
								htmlFor="displayName"
								className="text-[10px] font-black text-muted-foreground tracking-widest ml-1"
							>
								display name
							</label>
							<input
								id="displayName"
								type="text"
								value={editForm.name}
								onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
								className="w-full bg-background border-2 border-border rounded-2xl px-4 py-3 font-bold"
							/>
						</div>
						<div className="space-y-2">
							<label
								htmlFor="school"
								className="text-[10px] font-black text-muted-foreground tracking-widest ml-1"
							>
								current school
							</label>
							<input
								id="school"
								type="text"
								value={editForm.school}
								onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
								placeholder="e.g. Pretoria Boys High"
								className="w-full bg-background border-2 border-border rounded-2xl px-4 py-3 font-bold"
							/>
						</div>
						<div className="pt-4">
							<p className="text-[10px] font-black text-muted-foreground tracking-widest mb-4 ml-1">
								choose mascot
							</p>
							<AvatarPicker
								selectedId={editForm.avatarId}
								onSelect={(id) => setEditForm({ ...editForm, avatarId: id })}
							/>
						</div>
						<div className="flex gap-2 pt-6">
							<Button
								onClick={handleSaveProfile}
								disabled={isSaving}
								className="rounded-full flex-1 gap-2 h-12 shadow-xl shadow-primary/20"
							>
								<HugeiconsIcon icon={SaveIcon} className="w-4 h-4" />
								{isSaving ? 'saving...' : 'save changes'}
							</Button>
							<Button
								variant="ghost"
								onClick={() => setIsEditing(false)}
								disabled={isSaving}
								className="rounded-full h-12"
							>
								cancel
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-2">
						<h2 className="text-4xl font-black text-foreground tracking-tighter leading-none">
							{user?.name?.toLowerCase() || 'matric scholar'}
						</h2>
						<div className="flex flex-wrap justify-center sm:justify-start gap-4">
							<div className="flex items-center gap-2 text-muted-foreground font-bold">
								<HugeiconsIcon icon={SchoolReportCardIcon} className="w-4 h-4" />
								<span className="text-sm tracking-widest">
									{user?.school?.toLowerCase() || 'high school student'}
								</span>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground font-bold">
								<HugeiconsIcon icon={Target01Icon} className="w-4 h-4" />
								<span className="text-sm tracking-widest">class of 2026</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
