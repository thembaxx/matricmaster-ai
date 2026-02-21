'use client';

import dynamic from 'next/dynamic';

const ClientProviders = dynamic(
	() => import('./ClientProviders').then((mod) => mod.ClientProviders),
	{ ssr: false }
);

export default ClientProviders;
