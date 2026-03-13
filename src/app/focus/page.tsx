'use client';

import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import FocusScreen from '@/screens/Focus';

export default function FocusPage() {
	return <FocusScreen />;
}
