import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		}
	},
	build: {
		// Babel performs the Chrome 47 downlevel pass after Vite bundles the app.
		target: 'esnext',
		outDir: 'build/legacy',
		emptyOutDir: false,
		minify: 'esbuild',
		lib: {
			entry: 'src/legacy-entry.js',
			name: 'JustRainLegacy',
			formats: ['iife'],
			fileName: () => 'app.js'
		}
	}
});
