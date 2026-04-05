'use client';

import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuestionManager } from '@/hooks/useQuestionManager';
import type { Question, Subject } from '@/lib/db/schema';
import { QuestionBasicTab } from './QuestionBasicTab';
import { QuestionCard } from './QuestionCard';
import { QuestionContentTab } from './QuestionContentTab';
import { QuestionOptionsTab } from './QuestionOptionsTab';

interface QuestionManagerProps {
	questions: Question[];
	subjects: Subject[];
	subjectMap: Map<number, string>;
	onRefresh: () => void;
	openCreateTrigger?: number;
}

export function QuestionManager({
	questions,
	subjects,
	subjectMap,
	onRefresh,
	openCreateTrigger,
}: QuestionManagerProps) {
	const {
		state,
		fileInputRef,
		fileInputId,
		handleEditQuestion,
		handleDeleteQuestion,
		handleSaveQuestion,
		handleImageSelect,
		handleRemoveImage,
		triggerFileInput,
		isFormValid,
		addOption,
		removeOption,
		updateOption,
		setEditingQuestion,
		setDrawerTab,
		closeModal,
	} = useQuestionManager({ onRefresh, openCreateTrigger });

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{questions.map((q) => (
					<QuestionCard
						key={q.id}
						question={q}
						subjectMap={subjectMap}
						onEdit={handleEditQuestion}
						onDelete={handleDeleteQuestion}
					/>
				))}
			</div>

			<Drawer
				open={state.isModalOpen}
				onOpenChange={(open) => {
					if (!open) closeModal();
				}}
			>
				<DrawerContent className="max-h-[90vh] flex flex-col z-50 rounded-t-[3rem] pb-8 lg:max-w-4xl lg:mx-auto">
					<DrawerHeader className="text-left border-b pb-8 px-8">
						<DrawerTitle className="text-3xl font-black tracking-tighter ">
							{state.editingQuestion?.id ? 'Edit Question' : 'New Question'}
						</DrawerTitle>
						<DrawerDescription className="font-bold">
							Manage educational content for students
						</DrawerDescription>

						<Tabs
							value={state.drawerTab}
							onValueChange={(v) => setDrawerTab(v as any)}
							className="w-full mt-8"
						>
							<TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 p-1 rounded-xl">
								<TabsTrigger
									value="basic"
									className="rounded-lg font-black text-[10px]  tracking-widest"
								>
									Basic
								</TabsTrigger>
								<TabsTrigger
									value="question"
									className="rounded-lg font-black text-[10px]  tracking-widest"
								>
									Content
								</TabsTrigger>
								<TabsTrigger
									value="options"
									className="rounded-lg font-black text-[10px]  tracking-widest"
								>
									Options
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</DrawerHeader>

					{state.editingQuestion && (
						<ScrollArea className="flex-1 px-8 py-8 no-scrollbar">
							<div className="space-y-8">
								{state.drawerTab === 'basic' && (
									<QuestionBasicTab
										editingQuestion={state.editingQuestion}
										setEditingQuestion={setEditingQuestion}
										subjects={subjects}
										fileInputId={fileInputId}
										fileInputRef={fileInputRef}
										handleImageSelect={handleImageSelect}
										handleRemoveImage={handleRemoveImage}
										triggerFileInput={triggerFileInput}
									/>
								)}

								{state.drawerTab === 'question' && (
									<QuestionContentTab
										editingQuestion={state.editingQuestion}
										setEditingQuestion={setEditingQuestion}
									/>
								)}

								{state.drawerTab === 'options' && (
									<QuestionOptionsTab
										editingQuestion={state.editingQuestion}
										addOption={addOption}
										removeOption={removeOption}
										updateOption={updateOption}
									/>
								)}
							</div>
						</ScrollArea>
					)}

					<DrawerFooter className="pt-8 border-t flex-row gap-4 px-8">
						<DrawerClose asChild>
							<Button
								variant="outline"
								disabled={state.isSaving}
								className="flex-1 h-14 rounded-2xl border-2 font-black  tracking-widest text-xs"
							>
								Discard
							</Button>
						</DrawerClose>
						<Button
							onClick={handleSaveQuestion}
							disabled={!isFormValid() || state.isSaving}
							className="flex-1 h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black  tracking-widest text-xs shadow-soft-lg shadow-primary/20"
						>
							{state.isSaving ? (
								<Spinner className="h-5 w-5 text-primary-foreground" />
							) : state.editingQuestion?.id ? (
								'Update Content'
							) : (
								'Save Content'
							)}
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	);
}
