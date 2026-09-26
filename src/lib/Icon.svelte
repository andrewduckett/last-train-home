<script lang="ts" module>
	export type IconName = 'checklist' | 'clock' | 'info' | 'map-pin' | 'train';

	// Build-time import of the repo's own SVG files. No crawl data reaches this map,
	// and icons.test.ts limits what markup the files may hold.
	const sources = import.meta.glob<string>('./icons/*.svg', { query: '?raw', import: 'default', eager: true });
	const ICONS: Record<string, string> = Object.fromEntries(
		Object.entries(sources).map(([path, svg]) => [path.replace(/^\.\/icons\/|\.svg$/g, ''), svg]),
	);
</script>

<script lang="ts">
	let { name, size = 24 }: { name: IconName; size?: number } = $props();

	// Fail closed: an unknown name renders an empty span.
	let svg = $derived(Object.hasOwn(ICONS, name) ? ICONS[name] : '');
</script>

<span class="icon" aria-hidden="true" data-icon={name} style:width={`${size}px`} style:height={`${size}px`}>{@html svg}</span>

<style>
	.icon {
		display: inline-flex;
		flex-shrink: 0;
	}

	.icon :global(svg) {
		width: 100%;
		height: 100%;
	}
</style>
