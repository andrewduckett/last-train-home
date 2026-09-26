import { expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import Icon from './Icon.svelte';

it('renders a known icon as inline SVG in a hidden, named span', () => {
	const { container } = render(Icon, { name: 'clock' });
	const span = container.querySelector('span[data-icon="clock"]');
	expect(span).toHaveAttribute('aria-hidden', 'true');
	expect(span?.querySelector('svg')).not.toBeNull();
});

it('sets the span width and height from the size prop', () => {
	const { container } = render(Icon, { name: 'train', size: 20 });
	const span = container.querySelector<HTMLElement>('span[data-icon="train"]');
	expect(span?.style.width).toBe('20px');
	expect(span?.style.height).toBe('20px');
});

it('renders an empty span for an unknown name', () => {
	const { container } = render(Icon, { name: 'missing' as never });
	const span = container.querySelector('span[data-icon]');
	expect(span).not.toBeNull();
	expect(span?.innerHTML.replace(/<!---->/g, '')).toBe('');
});
