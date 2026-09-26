/**
 * Build-output CSP test (task 6.1).
 *
 * Runs against a fresh build output in build/.
 * Execute with: npm run build && npm test
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';
import * as htmlparser2 from 'htmlparser2';

const BUILD_DIR = resolve('build');
const INDEX_HTML = resolve(BUILD_DIR, 'index.html');
const HEADERS_FILE = resolve(BUILD_DIR, '_headers');

let html = '';
let metaCspContent = '';
let scriptSrcDirective = '';
let inlineScripts: string[] = [];
let cspHashes: string[] = [];
let cspDirectives: Record<string, string[]> = {};
let metaPosition = -1;
let firstScriptPosition = -1;

beforeAll(() => {
	if (!existsSync(INDEX_HTML)) {
		throw new Error(`build/index.html not found — run npm run build first`);
	}
	html = readFileSync(INDEX_HTML, 'utf8');

	// Parse the HTML to extract meta CSP, inline scripts, and their positions
	let charPosition = 0;
	const parser = new htmlparser2.Parser(
		{
			onopentag(name, attribs) {
				if (name === 'meta' && attribs['http-equiv']?.toLowerCase() === 'content-security-policy') {
					metaCspContent = attribs['content'] ?? '';
					metaPosition = charPosition;
				}
				if (name === 'script' && !attribs['src']) {
					// inline script tag — content collected in ontext
					if (firstScriptPosition === -1) firstScriptPosition = charPosition;
				}
			},
			ontext(_text) {
				// Not tracking text here — we collect inline scripts via regex
			},
		},
		{ lowerCaseTags: true }
	);

	// Track byte positions using simple string search instead of event positions
	const metaMatch = html.match(/<meta[^>]+content-security-policy[^>]*>/i);
	if (metaMatch) {
		metaPosition = html.indexOf(metaMatch[0]);
		const contentMatch = metaMatch[0].match(/content="([^"]*)"/i);
		if (contentMatch) metaCspContent = contentMatch[1];
	}

	// Find inline script positions
	const scriptTagRegex = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
	let scriptMatch;
	while ((scriptMatch = scriptTagRegex.exec(html)) !== null) {
		if (firstScriptPosition === -1) firstScriptPosition = scriptMatch.index;
		if (scriptMatch[1].trim()) {
			inlineScripts.push(scriptMatch[1]);
		}
	}

	parser.end();

	// Parse directives from the meta CSP
	if (metaCspContent) {
		// Extract all script-related directives: script-src, script-src-elem, and default-src fallback
		const directives: Record<string, string[]> = {};
		metaCspContent.split(';').forEach((part) => {
			const [key, ...vals] = part.trim().split(/\s+/);
			if (key) directives[key.toLowerCase()] = vals;
		});
		cspDirectives = directives;

		// Effective script-src = script-src || script-src-elem || default-src (folded together)
		const effectiveScriptSrc = [
			...(directives['script-src'] ?? []),
			...(directives['script-src-elem'] ?? []),
			// include default-src only if neither script-src nor script-src-elem exist
			...(!directives['script-src'] && !directives['script-src-elem']
				? directives['default-src'] ?? []
				: []),
		];

		scriptSrcDirective = effectiveScriptSrc.join(' ');

		// Extract hashes from the directive
		cspHashes = effectiveScriptSrc.filter((v) => v.startsWith("'sha"));
	}
});

describe('build-output CSP assertions', () => {
	it('build/index.html exists', () => {
		expect(existsSync(INDEX_HTML)).toBe(true);
	});

	it('build/_headers exists', () => {
		expect(existsSync(HEADERS_FILE)).toBe(true);
	});

	it('build/_headers contains frame-ancestors', () => {
		const headers = readFileSync(HEADERS_FILE, 'utf8');
		expect(headers).toMatch(/frame-ancestors\s+'none'/);
	});

	it('build/_headers contains HSTS', () => {
		const headers = readFileSync(HEADERS_FILE, 'utf8');
		expect(headers).toMatch(/Strict-Transport-Security/);
	});

	it('build/_headers contains X-Content-Type-Options: nosniff', () => {
		const headers = readFileSync(HEADERS_FILE, 'utf8');
		expect(headers).toMatch(/X-Content-Type-Options:\s*nosniff/);
	});

	it('build/_headers contains Referrer-Policy', () => {
		const headers = readFileSync(HEADERS_FILE, 'utf8');
		expect(headers).toMatch(/Referrer-Policy/);
	});

	it('build/_headers does NOT contain script-src', () => {
		const headers = readFileSync(HEADERS_FILE, 'utf8');
		expect(headers).not.toMatch(/script-src/);
	});

	it('the policy allows no frames', () => {
		expect(cspDirectives['frame-src']).toEqual(["'none'"]);
	});

	it('the policy names no map provider', () => {
		const sources = Object.values(cspDirectives).flat();
		expect(sources.filter((source) => source.includes('www.google.com'))).toEqual([]);
	});

	it('index.html has a <meta> CSP tag', () => {
		expect(metaCspContent).toBeTruthy();
		expect(metaPosition).toBeGreaterThan(-1);
	});

	it('effective script-src includes self', () => {
		expect(scriptSrcDirective).toContain("'self'");
	});

	it('effective script-src does NOT contain unsafe-inline', () => {
		expect(scriptSrcDirective).not.toContain("'unsafe-inline'");
	});

	it('effective script-src contains at least one sha256 hash', () => {
		expect(cspHashes.length).toBeGreaterThan(0);
	});

	it('the <meta> CSP tag appears before the first executable <script>', () => {
		expect(metaPosition).toBeGreaterThan(-1);
		expect(firstScriptPosition).toBeGreaterThan(-1);
		expect(metaPosition).toBeLessThan(firstScriptPosition);
	});

	it('every inline script matches a hash in the CSP', () => {
		for (const scriptContent of inlineScripts) {
			const hash =
				"'sha256-" + createHash('sha256').update(scriptContent, 'utf8').digest('base64') + "'";
			expect(cspHashes, `Inline script not authorized: ${scriptContent.slice(0, 80)}...`).toContain(
				hash
			);
		}
	});
});
