import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { expect, it } from 'vitest';
import { parseRichText } from './richText.js';

const plain = (text: string) => [{ text, strong: false, em: false }];

it('parses a single line as one paragraph with one line', () => {
	expect(parseRichText('Hello there')).toEqual([[plain('Hello there')]]);
});

it('splits paragraphs on a blank line', () => {
	expect(parseRichText('First para\n\nSecond para')).toEqual([[plain('First para')], [plain('Second para')]]);
});

it('splits paragraphs on a whitespace-only line', () => {
	expect(parseRichText('First para\n   \nSecond para')).toEqual([[plain('First para')], [plain('Second para')]]);
});

it('splits paragraphs on more than one blank line', () => {
	expect(parseRichText('First para\n\n\n\nSecond para')).toEqual([[plain('First para')], [plain('Second para')]]);
});

it('keeps a single line break inside one paragraph', () => {
	expect(parseRichText('Line one\nLine two')).toEqual([[plain('Line one'), plain('Line two')]]);
});

it('normalizes \\r\\n line endings', () => {
	expect(parseRichText('Line one\r\nLine two\r\n\r\nSecond para')).toEqual([
		[plain('Line one'), plain('Line two')],
		[plain('Second para')],
	]);
});

it('trims trailing whitespace from each line', () => {
	expect(parseRichText('Trailing spaces   \nNo trailing')).toEqual([
		[plain('Trailing spaces'), plain('No trailing')],
	]);
});

it('drops a leading blank paragraph', () => {
	expect(parseRichText('\n\nFirst para')).toEqual([[plain('First para')]]);
});

it('drops a trailing blank paragraph', () => {
	expect(parseRichText('First para\n\n')).toEqual([[plain('First para')]]);
});

it('returns no paragraphs for an entirely blank source', () => {
	expect(parseRichText('   \n\n  \n')).toEqual([]);
});

it('returns no paragraphs for an empty string', () => {
	expect(parseRichText('')).toEqual([]);
});

type RunTuple = [text: string, strong: boolean, em: boolean];
const line = (...runs: RunTuple[]) => runs.map(([text, strong, em]) => ({ text, strong, em }));
const oneLineParagraph = (...runs: RunTuple[]) => [[line(...runs)]];

it('makes bold and italic from ***wow***', () => {
	expect(parseRichText('***wow***')).toEqual(oneLineParagraph(['wow', true, true]));
});

it('closes bold inside an open italic span', () => {
	expect(parseRichText('*italic **both***')).toEqual(
		oneLineParagraph(['italic ', false, true], ['both', true, true]),
	);
});

it('pairs a marker inside a word', () => {
	expect(parseRichText('a*b*c')).toEqual(
		oneLineParagraph(['a', false, false], ['b', false, true], ['c', false, false]),
	);
});

it('leaves an unpaired opening asterisk literal next to a paired one', () => {
	expect(parseRichText('**a*')).toEqual(oneLineParagraph(['*', false, false], ['a', false, true]));
});

it('lets an outer opener skip past an inner pair to reach its own closer', () => {
	expect(parseRichText('*a **b* c**')).toEqual(oneLineParagraph(['a b c', false, true]));
});

it('keeps spaced asterisks entirely literal', () => {
	expect(parseRichText('2 * 3 * 4')).toEqual(oneLineParagraph(['2 * 3 * 4', false, false]));
});

it('renders **bold** as bold', () => {
	expect(parseRichText('**bold**')).toEqual(oneLineParagraph(['bold', true, false]));
});

it('renders *italic* as italic', () => {
	expect(parseRichText('*italic*')).toEqual(oneLineParagraph(['italic', false, true]));
});

it('nests an italic span inside a bold span', () => {
	expect(parseRichText('**a *b* c**')).toEqual(
		oneLineParagraph(['a ', true, false], ['b', true, true], [' c', true, false]),
	);
});

it('leaves one leftover asterisk literal after an unbalanced closer', () => {
	expect(parseRichText('**bold***')).toEqual(oneLineParagraph(['bold', true, false], ['*', false, false]));
});

it('keeps a run of more than 3 asterisks entirely literal', () => {
	expect(parseRichText('****text****')).toEqual(oneLineParagraph(['****text****', false, false]));
});

it('keeps an opening marker literal when no closer follows', () => {
	expect(parseRichText("**Don't forget")).toEqual(oneLineParagraph(["**Don't forget", false, false]));
});

it('keeps a closing-shaped marker literal when no opener precedes it', () => {
	expect(parseRichText('lone*')).toEqual(oneLineParagraph(['lone*', false, false]));
});

it('does not pair markers split across two lines', () => {
	expect(parseRichText('**Meet\nearly**')).toEqual([[line(['**Meet', false, false]), line(['early**', false, false])]]);
});

it('parses the seed intro into three paragraphs with one bold run', () => {
	const source = readFileSync(resolve('static/crawls/cory-trent.yaml'), 'utf8');
	const intro = parse(source).definition.intro as string;

	const paragraphs = parseRichText(intro);

	expect(paragraphs).toHaveLength(3);
	const boldRuns = paragraphs[2][0].filter((run) => run.strong);
	expect(boldRuns).toEqual([{ text: "Don't forget", strong: true, em: false }]);
});
