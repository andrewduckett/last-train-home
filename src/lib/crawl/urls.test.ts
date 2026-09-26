import { expect, it } from 'vitest';
import { isQuickLinkUrl, resolveLinks } from './urls.js';

it.each(['http://example.com/pass', 'https://example.com/pass'])('accepts a quick link at %s', (url) => {
	expect(isQuickLinkUrl(url)).toBe(true);
});

it.each(['javascript:alert(1)', 'data:text/html,hi', '/relative', 'https://'])('rejects unsafe quick link %s', (url) => {
	expect(isQuickLinkUrl(url)).toBe(false);
});

it('drops malformed links while retaining a valid sibling', () => {
	expect(resolveLinks([{ label: 'Good', url: 'https://example.com' }, { label: '', url: 'https://example.com' }, { label: 'Bad', url: 'javascript:alert(1)' }])).toEqual([{ label: 'Good', url: 'https://example.com' }]);
});

it('resolves a malformed link container without throwing', () => {
	expect(resolveLinks(null)).toEqual([]);
});
