export type Run = { text: string; strong: boolean; em: boolean };
export type Line = Run[];
export type Paragraph = Line[];

const plainLine = (text: string): Line => [{ text, strong: false, em: false }];

export function parseRichText(source: string): Paragraph[] {
	const normalized = source.replace(/\r\n/g, '\n');
	const rawParagraphs = normalized.split(/\n(?:[ \t]*\n)+/);
	return rawParagraphs
		.map((paragraph) => paragraph.split('\n').map((line) => line.replace(/[ \t]+$/, '')))
		.filter((lines) => lines.some((line) => line.trim().length > 0))
		.map((lines) => lines.map((line) => plainLine(line)));
}
