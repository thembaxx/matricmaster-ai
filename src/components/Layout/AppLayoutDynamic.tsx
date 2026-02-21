'use client';

import dynamic from 'next/dynamic';

const AppLayout = dynamic(() => import('./AppLayout'), {
	ssr: false,
});

export default AppLayout;
