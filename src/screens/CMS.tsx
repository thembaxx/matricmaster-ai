import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { SUBJECTS } from '@/constants';
import type { ContentItem } from '@/types';

export default function CMS() {
	const router = useRouter();
	const [items, setItems] = useState<ContentItem[]>([
		{
			id: '1',
			title: 'Calculus: Chain Rule',
			topic: 'Derivatives',
			category: 'Mathematics',
			content: '# Chain Rule\nThis is a standard lesson on the chain rule.',
			difficulty: 'Medium',
			status: 'Published',
			updatedAt: '2023-10-15',
		},
		{
			id: '2',
			title: "Physics: Newton's Laws",
			topic: 'Mechanics',
			category: 'Physical Sciences',
			content: "# Newton's Laws\nFocus on the 2nd law: F=ma",
			difficulty: 'Easy',
			status: 'Draft',
			updatedAt: '2023-10-14',
		},
	]);

	const [editingItem, setEditingItem] = useState<Partial<ContentItem> | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('All');
	const fileInputRef = useRef<HTMLInputElement>(null);

	const filteredItems = items.filter((item) => {
		const matchesSearch =
			item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			item.topic.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const handleSave = () => {
		if (!editingItem?.title || !editingItem?.category) return;

		if (editingItem.id) {
			setItems((prev) =>
				prev.map((item) =>
					item.id === editingItem.id ? ({ ...item, ...editingItem } as ContentItem) : item
				)
			);
		} else {
			const newItem: ContentItem = {
				...editingItem,
				id: Math.random().toString(36).substr(2, 9),
				updatedAt: new Date().toISOString().split('T')[0],
				status: 'Draft',
				difficulty: editingItem.difficulty || 'Medium',
				content: editingItem.content || '',
				topic: editingItem.topic || 'General',
			} as ContentItem;
			setItems((prev) => [newItem, ...prev]);
		}
		setEditingItem(null);
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setEditingItem((prev) => ({ ...prev, image: reader.result as string }));
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-lexend relative">
			{/* Header */}
			<header className="px-6 pt-10 pb-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
				<div className="flex justify-between items-center mb-4">
					<button
						type="button"
						onClick={() => router.push('/profile')}
						className="material-symbols-rounded text-zinc-500"
					>
						arrow_back
					</button>
					<h1 className="font-bold text-zinc-900 dark:text-white">Content Manager</h1>
					<button
						type="button"
						onClick={() =>
							setEditingItem({
								title: '',
								topic: '',
								category: 'Mathematics',
								difficulty: 'Medium',
								content: '',
							})
						}
						className="w-10 h-10 bg-brand-purple text-white rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20 active:scale-90 transition-all"
					>
						<span className="material-symbols-rounded">add</span>
					</button>
				</div>

				{/* Filters */}
				<div className="space-y-3">
					<div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 items-center">
						<span className="material-symbols-rounded text-zinc-400 text-sm">search</span>
						<input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="bg-transparent border-none focus:ring-0 text-xs w-full py-2.5"
							placeholder="Search by title or topic..."
						/>
					</div>
					<div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
						{['All', ...SUBJECTS.map((s) => s.name)].map((cat) => (
							<button
								type="button"
								key={cat}
								onClick={() => setSelectedCategory(cat)}
								className={`px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-brand-purple text-white shadow-lg shadow-purple-500/20' : 'bg-white dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700'}`}
							>
								{cat}
							</button>
						))}
					</div>
				</div>
			</header>

			{/* Content List */}
			<main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
				{filteredItems.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
						<span className="material-symbols-rounded text-6xl mb-4 text-zinc-300">
							history_edu
						</span>
						<p className="text-sm font-bold">No items found</p>
					</div>
				) : (
					filteredItems.map((item) => (
						<div
							key={item.id}
							className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow"
						>
							{item.image ? (
								<img
									src={item.image}
									className="w-16 h-16 rounded-2xl object-cover bg-zinc-100"
									alt={item.title}
								/>
							) : (
								<div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
									<span className="material-symbols-rounded">image</span>
								</div>
							)}
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-0.5">
									<span
										className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${item.status === 'Published' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}
									>
										{item.status}
									</span>
									<span className="text-[8px] font-bold text-zinc-400">{item.updatedAt}</span>
								</div>
								<h4 className="font-bold text-zinc-900 dark:text-white truncate text-sm">
									{item.title}
								</h4>
								<div className="flex items-center gap-1 text-[10px] text-zinc-500">
									<span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
										{item.category}
									</span>
									<span>•</span>
									<span className="font-medium text-brand-purple">{item.topic}</span>
									<span>•</span>
									<span>{item.difficulty}</span>
								</div>
							</div>
							<div className="flex flex-col gap-2">
								<button
									type="button"
									onClick={() => setEditingItem(item)}
									className="p-2 text-zinc-400 hover:text-brand-purple transition-colors"
								>
									<span className="material-symbols-rounded text-xl">edit</span>
								</button>
								<button
									type="button"
									onClick={() => setItems(items.filter((i) => i.id !== item.id))}
									className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
								>
									<span className="material-symbols-rounded text-xl">delete</span>
								</button>
							</div>
						</div>
					))
				)}
			</main>

			{/* Editor Modal */}
			{editingItem && (
				<div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col justify-end">
					<div className="bg-white dark:bg-zinc-900 w-full h-[90%] rounded-t-[3rem] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
						<header className="px-6 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
							<h2 className="text-lg font-bold text-zinc-900 dark:text-white">
								{editingItem.id ? 'Edit Lesson' : 'New Lesson'}
							</h2>
							<button
								type="button"
								onClick={() => setEditingItem(null)}
								className="material-symbols-rounded text-zinc-400"
							>
								close
							</button>
						</header>

						<div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
							{/* Title & Topic Row */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="cms-title"
										className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2"
									>
										Title
									</label>
									<input
										id="cms-title"
										value={editingItem.title}
										onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
										className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-brand-purple"
										placeholder="e.g. Euclidean Geometry Intro"
									/>
								</div>
								<div>
									<label
										htmlFor="cms-topic"
										className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2"
									>
										Topic
									</label>
									<input
										id="cms-topic"
										value={editingItem.topic}
										onChange={(e) => setEditingItem({ ...editingItem, topic: e.target.value })}
										className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-brand-purple"
										placeholder="e.g. Geometry"
									/>
								</div>
							</div>

							{/* Image Upload */}
							<div>
								<label
									htmlFor="cms-image"
									className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2"
								>
									Featured Image
								</label>
								<input
									id="cms-image"
									type="file"
									ref={fileInputRef}
									className="hidden"
									accept="image/*"
									onChange={handleImageUpload}
								/>
								<div
									onClick={() => fileInputRef.current?.click()}
									className="w-full h-32 bg-zinc-50 dark:bg-zinc-800 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group"
								>
									{editingItem.image ? (
										<>
											<img
												src={editingItem.image}
												className="w-full h-full object-cover"
												alt="Preview"
											/>
											<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
												<span className="text-white text-xs font-bold">Change Image</span>
											</div>
										</>
									) : (
										<>
											<span className="material-symbols-rounded text-zinc-300 text-3xl mb-1">
												upload_file
											</span>
											<span className="text-xs text-zinc-400">Click to upload image</span>
										</>
									)}
								</div>
							</div>

							{/* Category & Difficulty */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="cms-category"
										className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2"
									>
										Category
									</label>
									<select
										id="cms-category"
										value={editingItem.category}
										onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
										className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-xs focus:ring-2 ring-brand-purple appearance-none"
									>
										{SUBJECTS.map((s) => (
											<option key={s.id} value={s.name}>
												{s.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label
										htmlFor="cms-difficulty"
										className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2"
									>
										Difficulty
									</label>
									<select
										id="cms-difficulty"
										value={editingItem.difficulty}
										onChange={(e) =>
											setEditingItem({
												...editingItem,
												difficulty: e.target.value as ContentItem['difficulty'],
											})
										}
										className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-4 text-xs focus:ring-2 ring-brand-purple appearance-none"
									>
										<option value="Easy">Easy</option>
										<option value="Medium">Medium</option>
										<option value="Hard">Hard</option>
									</select>
								</div>
							</div>

							{/* Content Editor */}
							<div>
								<label
									htmlFor="cms-content"
									className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2"
								>
									Lesson Content (Markdown)
								</label>
								<textarea
									id="cms-content"
									rows={8}
									value={editingItem.content}
									onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
									className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-3xl p-4 text-sm focus:ring-2 ring-brand-purple font-mono"
									placeholder="# My Lesson\nWrite your curriculum content here..."
								/>
							</div>
						</div>

						<footer className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
							<button
								type="button"
								onClick={handleSave}
								className="w-full py-4 bg-brand-purple text-white font-black rounded-2xl shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
							>
								Save Lesson
							</button>
						</footer>
					</div>
				</div>
			)}
		</div>
	);
}
