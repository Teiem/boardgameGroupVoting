import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";
import { telefunc } from 'telefunc/vite';
import { config } from 'telefunc'

config.disableNamingConvention = true

export default defineConfig({
	plugins: [sveltekit(), telefunc()],

	test: {
		include: ["src/**/*.{test,spec}.{js,ts}"],
	},

	server: {
		allowedHosts: true,
	}
});
