import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

// GitHub Pages では workflow から SITE / BASE_PATH を渡す（ローカルでは未設定で "/" 配信）
export default defineConfig({
  site: process.env.SITE,
  base: process.env.BASE_PATH || '/',
  integrations: [svelte()],
});
