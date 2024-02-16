<script lang="ts">
	import { page } from '$app/stores';
	import QRCode from 'qrcode';
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';

	export let data: PageData;

	let codeData: string | null = null;

	const generateQR = async (text: string) => {
		try {
			codeData = await QRCode.toDataURL(text);
		} catch (err) {
			console.error(err);
		}
	};

	const { form, message, errors, constraints, enhance, tainted, isTainted } = superForm(data.form);
</script>

{#if $page.url.searchParams.has('qr-code')}
	<form
		class="w-full max-w-md space-y-4 p-4"
		on:submit={(event) => {
			event.preventDefault();
			const formData = new FormData(event.currentTarget);
			const inputUrlData = formData.get('url');
			if (!inputUrlData) return;

			console.log(inputUrlData);
			generateQR(inputUrlData.toString());
		}}
	>
		<noscript>
			<div role="alert" class="alert alert-warning w-full max-w-md">
				<span
					>QR code generation only works with JavaScript enabled! We don't send any data to the
					server, it's all done in your browser.
				</span>
			</div>
		</noscript>

		{#if codeData}
			<div role="alert" class="alert alert-success w-full max-w-md">
				<img src={codeData} alt="QR Code" />
			</div>
		{/if}

		<div>
			<label class="form-control w-full max-w-md">
				<div class="label"><span class="label-text">URL</span></div>
				<input class="input input-bordered w-full max-w-md" type="url" name="url" />
			</label>
		</div>

		<button class="btn btn-primary w-full max-w-md" type="submit">Create Code</button>
	</form>
{:else}
	<form class="w-full max-w-md space-y-4 p-4" method="post" use:enhance>
		{#if $message}
			<div role="alert" class="alert alert-success w-full max-w-md">
				<span
					>Shortened link created successfully: <a
						href={$message}
						class="link link-neutral"
						target="_blank"
						rel="noopener noreferrer"
					>
						{$message}
					</a></span
				>
				<div>
					<button
						class="btn btn-square"
						type="button"
						on:click={() => $message && navigator.clipboard.writeText($message)}
					>
						<span class="sr-only">Copy to clipboard</span>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24"
							><g fill="none" fill-rule="evenodd"
								><path
									d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"
								/><path
									fill="currentColor"
									d="M9 2a2 2 0 0 0-2 2v2h2V4h11v11h-2v2h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM4 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm0 2h11v11H4z"
								/></g
							></svg
						>
					</button>
				</div>
			</div>
		{/if}

		<div>
			<label class="form-control w-full max-w-md">
				<div class="label"><span class="label-text">URL</span></div>
				<input
					class="input input-bordered w-full max-w-md"
					type="url"
					name="url"
					aria-invalid={$errors.url ? 'true' : undefined}
					bind:value={$form.url}
					{...$constraints.url}
				/>
				{#if $errors.url}
					<div class="label">
						<span class="label-text-alt text-error">{$errors.url}</span>
					</div>
				{/if}
			</label>

			<label class="form-control w-full max-w-md">
				<div class="label">
					<span class="label-text">Slug</span><span class="label-text-alt">(optional)</span>
				</div>
				<input
					class="input input-bordered w-full max-w-md"
					type="text"
					name="slug"
					aria-invalid={$errors.slug ? 'true' : undefined}
					bind:value={$form.slug}
					{...$constraints.slug}
				/>
				{#if $errors.slug}
					<div class="label">
						<span class="label-text-alt text-error">{$errors.slug}</span>
					</div>
				{/if}
			</label>
		</div>

		<button disabled={!isTainted($tainted)} class="btn btn-primary w-full max-w-md" type="submit"
			>Shorten URL</button
		>
	</form>
{/if}
