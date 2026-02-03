import App from '@/App';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('App', () => {
	it('renders without crashing', () => {
		const { container } = render(<App />);
		expect(container).toBeInTheDocument();
	});
});
