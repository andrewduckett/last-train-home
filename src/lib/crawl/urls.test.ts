import { expect, it } from 'vitest';
import { isQuickLinkUrl, isMapEmbedUrl, isMapViewerUrl, resolveLinks, resolveMap } from './urls.js';

it.each(['http://example.com/pass', 'https://example.com/pass'])('accepts a quick link at %s', (url) => {
	expect(isQuickLinkUrl(url)).toBe(true);
});

it.each(['javascript:alert(1)', 'data:text/html,hi', '/relative', 'https://'])('rejects unsafe quick link %s', (url) => {
	expect(isQuickLinkUrl(url)).toBe(false);
});

it.each(['https://www.google.com/maps/d/embed?mid=x', 'https://www.google.com/maps/embed/place', 'https://www.google.com:443/maps/embed'])('accepts map embed %s', (url) => {
	expect(isMapEmbedUrl(url)).toBe(true);
	expect(isMapViewerUrl(url)).toBe(false);
});

it.each(['https://www.google.com/maps/d/viewer?mid=x', 'https://www.google.com/maps/search/?api=1', 'https://www.google.com/maps/'])('accepts map viewer %s', (url) => {
	expect(isMapViewerUrl(url)).toBe(true);
	expect(isMapEmbedUrl(url)).toBe(false);
});

it.each(['https://www.google.com:444/maps/d/embed', 'https://www.google.com.evil.example/maps/embed', 'http://www.google.com/maps/embed', 'https://www.google.com/maps/embedding'])('rejects unsupported embed %s', (url) => {
	expect(isMapEmbedUrl(url)).toBe(false);
});

it.each(['https://www.google.com:444/maps/d/viewer', 'https://maps.app.goo.gl/example', 'https://www.google.com/maps/embed'])('rejects unsupported viewer %s', (url) => {
	expect(isMapViewerUrl(url)).toBe(false);
});

it('drops malformed links while retaining a valid sibling', () => {
	expect(resolveLinks([{ label: 'Good', url: 'https://example.com' }, { label: '', url: 'https://example.com' }, { label: 'Bad', url: 'javascript:alert(1)' }])).toEqual([{ label: 'Good', url: 'https://example.com' }]);
});

it('resolves malformed link and map containers without throwing', () => {
	expect(resolveLinks(null)).toEqual([]);
	expect(resolveMap(null)).toBeNull();
	expect(resolveMap({ embed: 'https://www.google.com/maps/embed', app: 'javascript:alert(1)' })).toBeNull();
});
