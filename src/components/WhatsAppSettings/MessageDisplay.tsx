interface MessageDisplayProps {
	message: {
		type: 'success' | 'error';
		text: string;
	};
}

export function MessageDisplay({ message }: MessageDisplayProps) {
	return (
		<div
			className={`p-3 rounded-md text-sm ${
				message.type === 'success'
					? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
					: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
			}`}
		>
			{message.text}
		</div>
	);
}
