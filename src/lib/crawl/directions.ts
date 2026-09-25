export type MapsPlatform = 'apple' | 'other';

// An iPad in desktop mode reports "Macintosh", and a Mac gets Apple Maps too.
const appleDevice = /iPhone|iPad|iPod|Macintosh/;

export function detectMapsPlatform(userAgent: string | undefined): MapsPlatform {
	return userAgent && appleDevice.test(userAgent) ? 'apple' : 'other';
}

const searchBase: Record<MapsPlatform, string> = {
	apple: 'https://maps.apple.com/?q=',
	other: 'https://www.google.com/maps/search/?api=1&query=',
};

/** Builds a map search for the authored parts, such as a place's name, address, and town. */
export function directionsUrl(parts: string[], platform: MapsPlatform): string {
	return searchBase[platform] + encodeURIComponent(parts.join(', '));
}

/** Apple Maps opens in the same tab, so the system can hand it to the Maps app without leaving an empty tab. */
export function opensInNewTab(platform: MapsPlatform): boolean {
	return platform !== 'apple';
}
