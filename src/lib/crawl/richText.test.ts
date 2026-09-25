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
