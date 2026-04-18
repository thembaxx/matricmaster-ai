'use client';

import { CameraIcon, ImageIcon, PlayIcon, StopIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'motion/react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MockExamLockdownProps {
	defaultDuration?: number;
	onComplete?: (photos: string[]) => void;
}

export function MockExamLockdown({ defaultDuration = 180, onComplete }: MockExamLockdownProps) {
	const [timeLeft, setTimeLeft] = useState(defaultDuration * 60);
	const [photos, setPhotos] = useState<string[]>([]);
	const [showCamera, setShowCamera] = useState(false);
	const [cameraError, setCameraError] = useState<string | null>(null);
	const isActive = showCamera && timeLeft > 0;
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const formatTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		if (hours > 0) {
			return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	const startCamera = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'user', width: 640, height: 480 },
			});
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
			}
			setCameraError(null);
		} catch (_err) {
			setCameraError('Camera access denied. Please enable camera permissions.');
			toast.error('Camera access required for exam lockdown mode');
		}
	}, []);

	const stopCamera = useCallback(() => {
		if (videoRef.current?.srcObject) {
			const stream = videoRef.current.srcObject as MediaStream;
			stream.getTracks().forEach((track) => {
				track.stop();
			});
		}
	}, []);

	const capturePhoto = useCallback(() => {
		if (videoRef.current && canvasRef.current) {
			const context = canvasRef.current.getContext('2d');
			if (context) {
				canvasRef.current.width = videoRef.current.videoWidth;
				canvasRef.current.height = videoRef.current.videoHeight;
				context.drawImage(videoRef.current, 0, 0);
				const photoData = canvasRef.current.toDataURL('image/jpeg');
				setPhotos((prev) => [...prev, photoData]);
				toast.success('Photo captured for verification');
			}
		}
	}, []);

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;
		if (isActive && timeLeft > 0) {
			interval = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						stopCamera();
						toast.info('Exam time is up! Please submit your answers.');
						if (onComplete) {
							onComplete(photos);
						}
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isActive, timeLeft, onComplete, photos, stopCamera]);

	const handleStart = async () => {
		await startCamera();
		setShowCamera(true);
		setTimeLeft(defaultDuration * 60);
		toast.info('Mock exam started! Stay focused - the camera will capture periodic photos.');
	};

	const handleStop = () => {
		stopCamera();
		setShowCamera(false);
		toast.info('Mock exam paused. Your progress has been saved.');
	};

	return (
		<div className="space-y-6">
			<Card className="overflow-hidden">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={CameraIcon} className="w-5 h-5 text-primary" />
						Mock Exam Lockdown
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="aspect-video bg-secondary rounded-xl overflow-hidden relative">
						{showCamera ? (
							<>
								<video
									ref={videoRef}
									autoPlay
									playsInline
									muted
									className="w-full h-full object-cover transform scale-x-[-1]"
								/>
								<div className="absolute top-4 right-4 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
									REC
								</div>
								<div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm font-mono">
									{formatTime(timeLeft)}
								</div>
							</>
						) : (
							<div className="w-full h-full flex items-center justify-center">
								<div className="text-center">
									<HugeiconsIcon
										icon={CameraIcon}
										className="w-16 h-16 text-muted-foreground mx-auto mb-4"
									/>
									<p className="text-sm text-muted-foreground">
										{cameraError || 'Click Start to begin your mock exam'}
									</p>
								</div>
							</div>
						)}
					</div>

					<canvas ref={canvasRef} className="hidden" />

					<div className="flex gap-2">
						{!isActive ? (
							<Button onClick={handleStart} className="flex-1 gap-2">
								<HugeiconsIcon icon={PlayIcon} className="w-4 h-4" />
								Start Exam
							</Button>
						) : (
							<>
								<Button onClick={capturePhoto} variant="outline" className="flex-1 gap-2">
									<HugeiconsIcon icon={ImageIcon} className="w-4 h-4" />
									Capture Answer
								</Button>
								<Button onClick={handleStop} variant="destructive" className="gap-2">
									<HugeiconsIcon icon={StopIcon} className="w-4 h-4" />
									End
								</Button>
							</>
						)}
					</div>

					{photos.length > 0 && (
						<div className="space-y-2">
							<p className="text-xs font-bold text-muted-foreground">
								Captured Answers ({photos.length})
							</p>
							<div className="grid grid-cols-4 gap-2">
								{photos.map((photo, idx) => (
									<m.div
										key={photo}
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										className="aspect-square rounded-lg overflow-hidden bg-secondary"
									>
										<Image
											src={photo}
											alt={`Answer ${idx + 1}`}
											fill
											sizes="(max-width: 640px) 25vw, 128px"
											className="object-cover"
										/>
									</m.div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
				<h4 className="font-bold text-sm text-yellow-700 mb-2">How it works</h4>
				<ul className="text-xs text-muted-foreground space-y-1">
					<li>1. Start the exam and position your phone to capture your workspace</li>
					<li>2. The timer simulates real exam pressure</li>
					<li>3. Snap photos of your handwritten answers as you go</li>
					<li>4. At the end, review your answers and compare with the memo</li>
				</ul>
			</div>
		</div>
	);
}
