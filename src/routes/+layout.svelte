<script lang="ts">
	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { inject } from '@vercel/analytics';
	import '../app.css';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	inject({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();
</script>

<main class="flex min-h-svh w-full flex-col items-center gap-4 p-4">
	<div class="flex w-full flex-1 flex-col items-center justify-center gap-4">
		<h1 class="font-mono text-2xl">miksu-link</h1>
		<div role="tablist" class="tabs tabs-bordered tabs-lg">
			<a
				href="/?shorten"
				role="tab"
				class="tab"
				aria-current={$page.url.searchParams.has('shorten') ||
					($page.url.pathname === '/' && !$page.url.searchParams.has('qr-code'))}
				class:tab-active={$page.url.searchParams.has('shorten') ||
					($page.url.pathname === '/' && !$page.url.searchParams.has('qr-code'))}>Shorten</a
			>
			<a
				href="/?qr-code"
				role="tab"
				class="tab"
				aria-current={$page.url.searchParams.has('qr-code')}
				class:tab-active={$page.url.searchParams.has('qr-code')}>QR Code</a
			>
		</div>
		{@render children?.()}
	</div>
	<footer>
		<a
			class="link"
			href="https://github.com/mikaelsiidorow/miksu-link"
			target="_blank"
			rel="noopener noreferrer"
		>
			Source Code
		</a>
	</footer>
</main>
