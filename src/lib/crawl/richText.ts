export type Run = { text: string; strong: boolean; em: boolean };
export type Line = Run[];
export type Paragraph = Line[];

type Marker = {
	start: number;
	end: number;
	total: number;
	consumed: number;
	canOpen: boolean;
	canClose: boolean;
};

const isWhitespace = (char: string | undefined): boolean => char === undefined || /\s/.test(char);

function findMarkers(chars: string[]): Marker[] {
	const markers: Marker[] = [];
	let i = 0;
	while (i < chars.length) {
		if (chars[i] === '*') {
			let j = i;
			while (j < chars.length && chars[j] === '*') j++;
			const total = j - i;
			if (total <= 3) {
				const before = i > 0 ? chars[i - 1] : undefined;
				const after = j < chars.length ? chars[j] : undefined;
				markers.push({
					start: i,
					end: j,
					total,
					consumed: 0,
					canOpen: !isWhitespace(after) && after !== undefined,
					canClose: !isWhitespace(before) && before !== undefined,
				});
			}
			i = j;
		} else {
			i++;
		}
	}
	return markers;
}

function pairMarkers(line: string): Line {
	const chars = Array.from(line);
	const strongFlags = new Array<boolean>(chars.length).fill(false);
	const emFlags = new Array<boolean>(chars.length).fill(false);
	const hidden = new Array<boolean>(chars.length).fill(false);
	const markers = findMarkers(chars);

	const markSpan = (from: number, to: number, strong: boolean) => {
		const flags = strong ? strongFlags : emFlags;
		for (let k = from; k < to; k++) flags[k] = true;
	};

	const consumeOpenerInner = (marker: Marker, take: number) => {
		const to = marker.end - marker.consumed;
		for (let k = to - take; k < to; k++) hidden[k] = true;
		marker.consumed += take;
	};

	const consumeCloserInner = (marker: Marker, take: number) => {
		const from = marker.start + marker.consumed;
		for (let k = from; k < from + take; k++) hidden[k] = true;
		marker.consumed += take;
	};

	const stack: Marker[] = [];
	for (const marker of markers) {
		if (marker.canClose) {
			while (marker.total - marker.consumed > 0 && stack.length > 0) {
				const top = stack[stack.length - 1];
				const closerRemaining = marker.total - marker.consumed;
				const openerRemaining = top.total - top.consumed;
				const take = closerRemaining >= 2 && openerRemaining >= 2 ? 2 : 1;
				markSpan(top.end, marker.start, take === 2);
				consumeOpenerInner(top, take);
				consumeCloserInner(marker, take);
				if (top.total - top.consumed === 0) stack.pop();
			}
		}
		if (marker.total - marker.consumed > 0 && marker.canOpen) {
			stack.push(marker);
		}
	}

	const runs: Line = [];
	let buffer = '';
	let bufferStrong = false;
	let bufferEm = false;
	for (let idx = 0; idx < chars.length; idx++) {
		if (hidden[idx]) continue;
		const strong = strongFlags[idx];
		const em = emFlags[idx];
		if (buffer && strong === bufferStrong && em === bufferEm) {
			buffer += chars[idx];
		} else {
			if (buffer) runs.push({ text: buffer, strong: bufferStrong, em: bufferEm });
			buffer = chars[idx];
			bufferStrong = strong;
			bufferEm = em;
		}
	}
	if (buffer) runs.push({ text: buffer, strong: bufferStrong, em: bufferEm });
	return runs;
}

export function parseRichText(source: string): Paragraph[] {
	const normalized = source.replace(/\r\n/g, '\n');
	const rawParagraphs = normalized.split(/\n(?:[ \t]*\n)+/);
	return rawParagraphs
		.map((paragraph) => paragraph.split('\n').map((line) => line.replace(/[ \t]+$/, '')))
		.filter((lines) => lines.some((line) => line.trim().length > 0))
		.map((lines) => lines.map((line) => pairMarkers(line)));
}
