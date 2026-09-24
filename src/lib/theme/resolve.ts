export type PaletteName = 'neutral' | 'amber' | 'teal';

export function resolvePalette(color: string | undefined): PaletteName {
	return color === 'amber' || color === 'teal' ? color : 'neutral';
}
