export type MapsPlatform = 'apple' | 'other';

// An iPad in desktop mode reports "Macintosh", and a Mac gets Apple Maps too.
const appleDevice = /iPhone|iPad|iPod|Macintosh/;

export function detectMapsPlatform(userAgent: string | undefined): MapsPlatform {
	return userAgent && appleDevice.test(userAgent) ? 'apple' : 'other';
}
