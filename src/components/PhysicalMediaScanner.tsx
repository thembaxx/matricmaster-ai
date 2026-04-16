import { type FC, useEffect, useRef } from 'react';

export const PhysicalMediaScanner: FC<{ onPaperLoad: (paperId: string) => void }> = ({
	onPaperLoad,
}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const scannerRef = useRef<any>(null); // Ref to hold the scanner instance

	useEffect(() => {
		if (!videoRef.current) return;

		// Check if the browser supports the Shape Detection API for QR codes
		if ('BarcodeDetector' in window) {
			const detector = new BarcodeDetector({ formats: ['qr_code'] });
			const detect = async () => {
				if (!videoRef.current) return;
				try {
					const barcodes = await detector.detect(videoRef.current);
					for (const barcode of barcodes) {
						onPaperLoad(barcode.rawValue);
					}
				} catch (err) {
					console.error('Barcode detection failed:', err);
				}
				requestAnimationFrame(detect);
			};
			detect();
			return () => {
				// Cleanup if needed
			};
		}
		// Fallback to a library if Shape Detection API is not available
		// We'll use a mock for now; replace with actual library like @zxing/browser
		console.warn(
			'BarcodeDetector not available, using mock scanner. Install a proper library for production.'
		);
		// Mock: simulate a scan every 5 seconds for demonstration
		const interval = setInterval(() => {
			// In a real app, we would get data from the scanner
			// For now, we'll just send a test paperId
			onPaperLoad('nsc-practice-2020');
		}, 5000);
		return () => clearInterval(interval);
	}, [onPaperLoad]);

	return (
		<div className="flex flex-col items-center space-y-4">
			<p className="text-sm font-medium">Scan the QR code on the paper to load it</p>
			<video ref={videoRef} className="w-64 h-64 border rounded" playsInline muted autoPlay />
		</div>
	);
};
