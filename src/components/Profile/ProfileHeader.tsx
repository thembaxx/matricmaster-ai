'use client';

import {
	PencilEdit01Icon,
	SaveIcon,
	SchoolReportCardIcon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo } from 'react';
import { toast } from 'sonner';
import { AvatarPicker } from '@/components/Profile/AvatarPicker';
import { SafeImage } from '@/components/SafeImage';
import { Button } from '@/components/ui/button';
import { authClient, useSession } from '@/lib/auth-client';
import { updateUserProfileAction } from '@/lib/db/actions';

interface User {
	id: string;
	name: string;
	email: string;
	image?: string | null;
	school?: string | null;
	avatarId?: string | null;
}

interface ProfileHeaderProps {
	isEditing: boolean;
	editForm: { name: string; school: string; avatarId: string };
	onEditFormChange: (form: { name: string; school: string; avatarId: string }) => void;
	onSetEditing: (editing: boolean) => void;
}

export const ProfileHeader = memo(function ProfileHeader({
	isEditing,
	editForm,
	onEditFormChange,
	onSetEditing,
}: ProfileHeaderProps) {
	const { data: session } = useSession();
	const u = session?.user as User;

	const handleSave = async () => {
		const result = await updateUserProfileAction(editForm);
		if (result.success) {
			toast.success('Profile updated successfully!');
			onSetEditing(false);
			await authClient.getSession();
		} else {
			toast.error('Failed to update profile');
		}
	};

	return (
		<div className="flex flex-col sm:flex-row items-center gap-8 bg-card/30 p-8 rounded-[2.5rem] border border-border/50">
			<div className="relative">
				<div className="w-32 h-32 rounded-[2.5rem] overflow-hidden shadow-2xl relative border-4 border-background bg-muted flex items-center justify-center">
					{editForm.avatarId ? (
						<AvatarPicker selectedId={editForm.avatarId} onSelect={() => {}} />
					) : (
						<SafeImage
							src={session?.user?.image || '/default-avatar.png'}
							alt={session?.user?.name || 'User'}
							className="w-full h-full object-cover"
						/>
					)}
				</div>
				{!isEditing && (
					<button
						type="button"
						onClick={() => onSetEditing(true)}
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
								className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1"
							>
								Display Name
							</label>
							<input
								id="displayName"
								type="text"
								value={editForm.name}
								onChange={(e) => onEditFormChange({ ...editForm, name: e.target.value })}
								className="w-full bg-background border-2 border-border rounded-2xl px-4 py-3 font-bold"
							/>
						</div>
						<div className="space-y-2">
							<label
								htmlFor="school"
								className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1"
							>
								Current School
							</label>
							<input
								id="school"
								type="text"
								value={editForm.school}
								onChange={(e) => onEditFormChange({ ...editForm, school: e.target.value })}
								placeholder="e.g. Pretoria Boys High"
								className="w-full bg-background border-2 border-border rounded-2xl px-4 py-3 font-bold"
							/>
						</div>
						<div className="pt-4">
							<p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4 ml-1">
								Choose Mascot
							</p>
							<AvatarPicker
								selectedId={editForm.avatarId}
								onSelect={(id) => onEditFormChange({ ...editForm, avatarId: id })}
							/>
						</div>
						<div className="flex gap-2 pt-6">
							<Button
								onClick={handleSave}
								className="rounded-full flex-1 gap-2 h-12 shadow-xl shadow-primary/20"
							>
								<HugeiconsIcon icon={SaveIcon} className="w-4 h-4" />
								Save Changes
							</Button>
							<Button
								variant="ghost"
								onClick={() => onSetEditing(false)}
								className="rounded-full h-12"
							>
								Cancel
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-2">
						<h2 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
							{session?.user?.name || 'Matric Scholar'}
						</h2>
						<div className="flex flex-wrap justify-center sm:justify-start gap-4">
							<div className="flex items-center gap-2 text-muted-foreground font-bold">
								<HugeiconsIcon icon={SchoolReportCardIcon} className="w-4 h-4" />
								<span className="text-sm uppercase tracking-widest">
									{u?.school || 'High School Student'}
								</span>
							</div>
							<div className="flex items-center gap-2 text-muted-foreground font-bold">
								<HugeiconsIcon icon={Target01Icon} className="w-4 h-4" />
								<span className="text-sm uppercase tracking-widest">Class of 2026</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
});
