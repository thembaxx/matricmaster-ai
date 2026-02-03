import App from '@/App';
import { ThemeProvider } from '@/components/theme-provider';
import '@/styles/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');
if (!rootElement) {
	throw new Error('Could not find root element to mount to');
}

const root = createRoot(rootElement);
root.render(
	<StrictMode>
		<ThemeProvider defaultTheme="light" storageKey="matric-master-theme">
			<App />
		</ThemeProvider>
	</StrictMode>
);
