import dynamic from 'next/dynamic';

const ChatPage = dynamic(
	() => import('@/components/Chat/ChatPage').then((mod) => ({ default: mod.ChatPage })),
	{ ssr: true, loading: () => <div className="min-h-[60vh]" /> }
);

export default function Chat() {
	return <ChatPage />;
}
