// The only authored UI colors. Named palettes replace accent values; shared
// surfaces and semantic success colors stay the same for every crawl.
const shared = {
	light: {
		bg: '#eef1f4', surface: '#ffffff', ink: '#181c22', muted: '#5a6472',
		line: '#e2e6eb', 'control-line': '#707b89', rail: '#177567', good: '#177567',
		'on-good': '#ffffff', shadow: 'rgba(20, 25, 33, 0.09)',
		board: '#12161c', 'board-2': '#1b2129', 'board-ink': '#edeff3',
		'board-muted': '#a5afbd', 'board-line': '#4c5868',
	},
	dark: {
		bg: '#0f1319', surface: '#181d25', ink: '#e9ecf0', muted: '#aab4c2',
		line: '#2a313c', 'control-line': '#8492a4', rail: '#2fb7a0', good: '#2fb7a0',
		'on-good': '#0f1319', shadow: 'rgba(0, 0, 0, 0.45)',
		board: '#12161c', 'board-2': '#1b2129', 'board-ink': '#edeff3',
		'board-muted': '#a5afbd', 'board-line': '#4c5868',
	},
};

const accents = {
	light: {
		neutral: { accent: '#40566e', 'accent-ink': '#40566e', 'on-accent': '#ffffff', 'accent-tint': '#e7edf3', 'board-accent': '#b9c9d9' },
		amber: { accent: '#8a4e14', 'accent-ink': '#8a4e14', 'on-accent': '#ffffff', 'accent-tint': '#f8efe6', 'board-accent': '#f2a93b' },
		teal: { accent: '#08695d', 'accent-ink': '#08695d', 'on-accent': '#ffffff', 'accent-tint': '#e5f4f1', 'board-accent': '#65ddc8' },
	},
	dark: {
		neutral: { accent: '#b9c9d9', 'accent-ink': '#b9c9d9', 'on-accent': '#12161c', 'accent-tint': '#24313e', 'board-accent': '#b9c9d9' },
		amber: { accent: '#f2a93b', 'accent-ink': '#f2a93b', 'on-accent': '#12161c', 'accent-tint': '#332616', 'board-accent': '#f2a93b' },
		teal: { accent: '#65ddc8', 'accent-ink': '#65ddc8', 'on-accent': '#12161c', 'accent-tint': '#18332f', 'board-accent': '#65ddc8' },
	},
};

export const palettes = Object.fromEntries(
	Object.entries(shared).map(([scheme, common]) => [scheme, Object.fromEntries(
		Object.entries(accents[/** @type {'light' | 'dark'} */ (scheme)]).map(([name, accent]) => [name, { ...common, ...accent }]),
	)]),
);

// [foreground token, background token, required ratio]. All text is ordinary size.
/** @type {Array<[string, string, number]>} */
export const textPairs = [
	['ink', 'surface', 4.5], ['muted', 'surface', 4.5], ['ink', 'bg', 4.5],
	['muted', 'bg', 4.5], ['board-ink', 'board', 4.5],
	['board-muted', 'board', 4.5], ['board-accent', 'board', 4.5],
	['board-accent', 'board-2', 4.5], ['accent-ink', 'surface', 4.5],
	['accent-ink', 'accent-tint', 4.5], ['on-accent', 'accent', 4.5],
	['rail', 'surface', 4.5], ['good', 'surface', 4.5], ['on-good', 'good', 4.5],
];

// Focus rings and boundaries of controls against their adjacent surfaces.
/** @type {Array<[string, string]>} */
export const boundaryPairs = [
	['accent', 'surface'], ['accent', 'bg'], ['accent', 'accent-tint'],
	['accent', 'line'], ['board-accent', 'board'],
	['control-line', 'surface'], ['control-line', 'bg'],
	['good', 'surface'], ['rail', 'surface'],
];
