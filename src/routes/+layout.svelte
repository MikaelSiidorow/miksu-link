<script lang="ts">
	import { page } from '$app/stores';
	import '../app.css';
</script>

<main class="flex min-h-svh w-full flex-col items-center gap-4">
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
		<slot />
	</div>
	<footer class="p-4">
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
