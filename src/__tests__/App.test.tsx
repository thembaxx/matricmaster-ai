import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Home from '@/app/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
	}),
	usePathname: () => '/',
}));

describe('Home Page', () => {
	it('renders without crashing', () => {
		const { container } = render(<Home />);
		expect(container).toBeInTheDocument();
	});
});
