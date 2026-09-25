import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import InfoView from './InfoView.svelte';
import type { Crawl } from './types.js';

function show(intro: unknown, links: unknown) {
	return render(InfoView, { crawl: { id: 'walk', title: 'Walk', definition: { intro, links } } as unknown as Crawl });
}

it('renders introduction markup as plain Unicode text', () => {
	const { container } = show('Hello <strong>friends</strong> 🚆', []);
	expect(screen.getByText('Hello <strong>friends</strong> 🚆')).toBeInTheDocument();
	expect(container.querySelector('strong')).toBeNull();
});

it('keeps valid quick links in authored order', () => {
	const { container } = show(undefined, [
		{ label: 'Ventra', hint: 'Buy a pass', url: 'https://example.com/ventra' },
		{ label: 'Metra', url: 'https://example.com/metra' },
		{ label: 'Album', url: 'https://example.com/album' },
	]);
	expect([...container.querySelectorAll('.quick-link')].map((link) => link.textContent?.trim())).toEqual(['Ventra Buy a pass', 'Metra', 'Album']);
	expect(screen.getByRole('link', { name: /Ventra/ })).toHaveAttribute('target', '_blank');
	expect(screen.getByRole('link', { name: /Ventra/ })).toHaveAttribute('rel', 'noopener noreferrer');
});

it('omits malformed optional content while keeping valid links', () => {
	show(42, [{ url: 'https://example.com/no-label' }, { label: 'Unsafe', url: 'javascript:alert(1)' }, { label: 'Good', url: 'https://example.com/good' }]);
	expect(screen.queryByText('42')).not.toBeInTheDocument();
	expect(screen.getByRole('link', { name: 'Good' })).toHaveAttribute('href', 'https://example.com/good');
	expect(screen.queryByRole('link', { name: 'Unsafe' })).not.toBeInTheDocument();
});

it('treats a malformed link list as empty', () => {
	show('Welcome', 'broken');
	expect(screen.getByText('Welcome')).toBeInTheDocument();
	expect(screen.queryByRole('link')).not.toBeInTheDocument();
});

it('wraps intro paragraphs in a single card container', () => {
	const { container } = show('One\n\nTwo', []);
	const card = container.querySelector('.intro-card');
	expect(card?.tagName).not.toBe('P');
	expect(card?.querySelectorAll(':scope > p')).toHaveLength(2);
});

it('renders one paragraph per blank-line-separated block', () => {
	const { container } = show('First paragraph\n\nSecond paragraph', []);
	const paragraphs = container.querySelectorAll('.intro-card p');
	expect(paragraphs).toHaveLength(2);
	expect(paragraphs[0]).toHaveTextContent('First paragraph');
	expect(paragraphs[1]).toHaveTextContent('Second paragraph');
});

it('renders a line break inside one paragraph', () => {
	const { container } = show('Line one\nLine two', []);
	const paragraphs = container.querySelectorAll('.intro-card p');
	expect(paragraphs).toHaveLength(1);
	expect(paragraphs[0].querySelectorAll('br')).toHaveLength(1);
	expect(paragraphs[0].innerHTML).toBe('Line one<br>Line two');
});

it('renders a bold marker without literal asterisks', () => {
	const { container } = show('**Bold** and plain', []);
	const card = container.querySelector('.intro-card');
	expect(card?.textContent).not.toContain('*');
	expect(card?.querySelector('strong')).toHaveTextContent('Bold');
});

it('renders an italic marker without literal asterisks', () => {
	const { container } = show('*Italic* and plain', []);
	const card = container.querySelector('.intro-card');
	expect(card?.textContent).not.toContain('*');
	expect(card?.querySelector('em')).toHaveTextContent('Italic');
});

it('renders a run that is both bold and italic', () => {
	const { container } = show('***Both***', []);
	const card = container.querySelector('.intro-card');
	const strong = card?.querySelector('strong');
	expect(strong).toHaveTextContent('Both');
	expect(strong?.querySelector('em')).toHaveTextContent('Both');
});
