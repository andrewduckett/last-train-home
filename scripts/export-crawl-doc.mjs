// Export a crawl as a styled HTML page for import into Google Docs.
// Sections, in order: Info, Schedule, Places. The scavenger hunt is left out.
//
// Usage: node scripts/export-crawl-doc.mjs <crawl-id> [out.html]
// Default output: .workspace/<crawl-id>.html
import fs from 'node:fs';
import { resolve } from 'node:path';
import YAML from 'yaml';

const id = process.argv[2];
if (!id) {
	console.error('Usage: node scripts/export-crawl-doc.mjs <crawl-id> [out.html]');
	process.exit(1);
}
const out = process.argv[3] ?? `.workspace/${id}.html`;
const crawl = YAML.parse(fs.readFileSync(resolve('static/crawls', `${id}.yaml`), 'utf8'));
const d = crawl.definition;

// Neutral greys: accent for headings and table headers, tint for stop rows.
const A = '#3c4043',
	TINT = '#f1f3f4',
	LINE = '#dadce0',
	MUTED = '#5f6368';
const F = 'font-family:Roboto,Arial,sans-serif;';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rich = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>');
const td = (s, x = '') =>
	`<td style="${F}border:1px solid ${LINE};padding:6pt 8pt;vertical-align:top;${x}">${s}</td>`;
const th = (s) =>
	`<th style="${F}border:1px solid ${A};padding:6pt 8pt;background:${A};color:#ffffff;text-align:left;font-weight:bold;">${s}</th>`;
const h2 = (s) => `<h2 style="${F}color:${A};font-size:16pt;font-weight:bold;margin-top:18pt;">${s}</h2>`;
const h3 = (s) => `<h3 style="${F}font-size:13pt;font-weight:bold;margin-top:12pt;">${s}</h3>`;
const maps = (p) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.join(', '));

let h = `<html><head><meta charset="utf-8"></head><body style="${F}font-size:11pt;">`;
h += `<h1 style="${F}color:${A};font-size:24pt;font-weight:bold;">${esc(d.appTitle ?? crawl.title)}</h1>`;
if (d.line) h += `<p style="${F}color:${MUTED};font-size:12pt;">${esc(d.line)}</p>`;

// Info
h += h2('Info');
for (const p of (d.intro ?? '').trim().split(/\n\s*\n/).filter(Boolean))
	h += `<p style="${F}line-height:1.4;">${rich(p.trim()).replace(/\n/g, '<br>')}</p>`;
if (d.links?.length) {
	h += h3('Quick links');
	h += `<table style="border-collapse:collapse;width:100%;"><tr>${th('Link')}${th('What it’s for')}</tr>`;
	for (const l of d.links)
		h += `<tr>${td(`<a href="${esc(l.url)}" style="color:${A};font-weight:bold;">${esc(l.label)}</a>`)}${td(esc(l.hint ?? ''), `color:${MUTED};`)}</tr>`;
	h += '</table>';
}

// Schedule
h += h2('Schedule');
h += `<table style="border-collapse:collapse;width:100%;"><tr>${th('Time')}${th('Type')}${th('What')}${th('Details')}</tr>`;
for (const e of d.schedule ?? []) {
	const bg = e.kind === 'stop' ? `background:${TINT};` : '';
	const tag = `<span style="color:${A};font-weight:bold;">${esc(e.tag ?? '')}</span>`;
	const title = e.kind === 'stop' ? `<b>${esc(e.title)}</b>` : esc(e.title);
	const det = [e.mode, e.note].filter(Boolean).map(esc).join('<br>');
	h += `<tr>${td(`<b>${esc(e.time)}</b>`, bg + 'white-space:nowrap;')}${td(tag, bg)}${td(title, bg)}${td(det, bg + `color:${MUTED};`)}</tr>`;
}
h += '</table>';

// Places
h += h2('Places');
for (const s of d.places ?? []) {
	h += h3(`${esc(s.stop)} <span style="color:${MUTED};font-weight:normal;">· ${esc(s.town)}</span>`);
	h += `<table style="border-collapse:collapse;width:100%;"><tr>${th('Place')}${th('Type')}${th('Address')}${th('Directions')}</tr>`;
	for (const l of s.locations)
		h += `<tr>${td(`<b>${esc(l.name)}</b>`)}${td(esc(l.label ?? ''), `color:${A};`)}${td(esc(l.address))}${td(`<a href="${esc(maps([l.name, l.address, s.town]))}" style="color:${A};">Open in Maps</a>`)}</tr>`;
	h += '</table>';
}

h += '</body></html>';
fs.writeFileSync(out, h);
console.log(`Wrote ${out}`);
