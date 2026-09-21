import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.{ts,svelte}', 'tests/**/*.test.{ts,svelte}'],
		setupFiles: ['src/test-setup.ts'],
		globals: true,
	},
});
