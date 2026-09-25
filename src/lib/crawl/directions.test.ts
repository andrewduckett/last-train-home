import { expect, it } from 'vitest';
import { detectMapsPlatform, directionsUrl, opensInNewTab } from './directions.js';

const userAgents = {
	iPhone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
	iPhoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0 Mobile/15E148 Safari/604.1',
	iPad: 'Mozilla/5.0 (iPad; CPU OS 17_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.7 Mobile/15E148 Safari/604.1',
	iPadDesktopMode: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
	iPod: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 15_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.8 Mobile/15E148 Safari/604.1',
	macChrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
	android: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
	windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
	jsdom: 'Mozilla/5.0 (linux) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/26.1.0',
};

it.each(['iPhone', 'iPhoneChrome', 'iPad', 'iPadDesktopMode', 'iPod', 'macChrome'] as const)(
	'detects an Apple device from the %s user agent',
	(device) => {
		expect(detectMapsPlatform(userAgents[device])).toBe('apple');
	},
);

it.each(['android', 'windows', 'jsdom'] as const)('detects another device from the %s user agent', (device) => {
	expect(detectMapsPlatform(userAgents[device])).toBe('other');
});

it.each([undefined, ''])('falls back to another device for the user agent %j', (userAgent) => {
	expect(detectMapsPlatform(userAgent)).toBe('other');
});

const seedPlace = ['Station 34', '34 S Main St', 'Mt. Prospect, IL'];

it('builds a Google Maps search from the authored parts', () => {
	expect(directionsUrl(seedPlace, 'other')).toBe(
		'https://www.google.com/maps/search/?api=1&query=Station%2034%2C%2034%20S%20Main%20St%2C%20Mt.%20Prospect%2C%20IL',
	);
});

it('builds an Apple Maps search from the authored parts', () => {
	expect(directionsUrl(seedPlace, 'apple')).toBe(
		'https://maps.apple.com/?q=Station%2034%2C%2034%20S%20Main%20St%2C%20Mt.%20Prospect%2C%20IL',
	);
});

it.each(['other', 'apple'] as const)('keeps authored text inside the %s query parameter', (platform) => {
	const url = new URL(directionsUrl(['Pub & Grill #2?', '1 Main St', 'River Town'], platform));
	const param = platform === 'apple' ? 'q' : 'query';
	expect(url.searchParams.get(param)).toBe('Pub & Grill #2?, 1 Main St, River Town');
	expect(url.hash).toBe('');
	expect([...url.searchParams.keys()]).toEqual(platform === 'apple' ? ['q'] : ['api', 'query']);
});

it('opens a Google Maps search in a new tab', () => {
	expect(opensInNewTab('other')).toBe(true);
});

it('opens an Apple Maps search in the same tab', () => {
	expect(opensInNewTab('apple')).toBe(false);
});
