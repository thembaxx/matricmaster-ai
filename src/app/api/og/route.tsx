import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

import { appConfig } from '@/app.config';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const title = searchParams.get('title') || `${appConfig.name} AI`;
		const description = searchParams.get('description') || 'Master your Matric exams';

		return new ImageResponse(
			<div
				style={{
					height: '100%',
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: '#0f172a',
					backgroundImage: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
					padding: '60px',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						marginBottom: '40px',
					}}
				>
					<div
						style={{
							width: '80px',
							height: '80px',
							borderRadius: '20px',
							background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontSize: '48px',
							marginRight: '24px',
						}}
					>
						🎓
					</div>
					<div
						style={{
							fontSize: '56px',
							fontWeight: 'bold',
							color: '#ffffff',
							fontFamily: 'Inter',
						}}
					>
						{appConfig.name}
					</div>
				</div>
				<div
					style={{
						fontSize: '64px',
						fontWeight: 'bold',
						color: '#ffffff',
						textAlign: 'center',
						marginBottom: '24px',
						fontFamily: 'Inter',
						maxWidth: '900px',
						lineHeight: 1.2,
					}}
				>
					{title}
				</div>
				<div
					style={{
						fontSize: '32px',
						color: '#94a3b8',
						textAlign: 'center',
						fontFamily: 'Inter',
						maxWidth: '800px',
					}}
				>
					{description}
				</div>
				<div
					style={{
						position: 'absolute',
						bottom: '40px',
						display: 'flex',
						gap: '16px',
						fontSize: '24px',
						color: '#64748b',
						fontFamily: 'Inter',
					}}
				>
					<span>lumni.ai</span>
					<span>•</span>
					<span>Grade 12 NSC</span>
					<span>•</span>
					<span>South Africa</span>
				</div>
			</div>,
			{
				width: 1200,
				height: 630,
			}
		);
	} catch (e) {
		console.debug(e);
		return new Response('Failed to generate OG image', { status: 500 });
	}
}
