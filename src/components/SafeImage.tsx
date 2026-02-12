'use client';

import Image from 'next/image';
import { useState } from 'react';

interface SafeImageProps {
	src: string | null | undefined;
	alt: string;
	width?: number;
	height?: number;
	className?: string;
	priority?: boolean;
	fill?: boolean;
	sizes?: string;
	fallback?: React.ReactNode;
}

export function SafeImage({
	src,
	alt,
	width,
	height,
	className = '',
	priority = false,
	fill = false,
	sizes,
	fallback,
}: SafeImageProps) {
	const [error, setError] = useState(false);

	// Default fallback avatar if no custom fallback provided
	const defaultFallback = (
		<div
			className={`bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ${className}`}
		>
			<span className="text-white font-bold text-xl">{alt.charAt(0).toUpperCase()}</span>
		</div>
	);

	// If no src or error occurred, show fallback
	if (!src || error) {
		return fallback ?? defaultFallback;
	}

	// Use regular img for external images that might have dynamic URLs
	// Next.js Image requires width/height or fill mode
	if (fill) {
		return (
			<Image
				src={src}
				alt={alt}
				fill
				className={className}
				priority={priority}
				sizes={sizes}
				onError={() => setError(true)}
			/>
		);
	}

	// For external images, we need explicit dimensions
	// If not provided, use fill mode with object-fit for responsive behavior
	if (!width || !height) {
		return (
			<div className={`relative ${className}`}>
				<Image
					src={src}
					alt={alt}
					fill
					className="object-cover"
					priority={priority}
					sizes={sizes || '100vw'}
					onError={() => setError(true)}
				/>
			</div>
		);
	}

	return (
		<Image
			src={src}
			alt={alt}
			width={width}
			height={height}
			className={className}
			priority={priority}
			onError={() => setError(true)}
		/>
	);
}
