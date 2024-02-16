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
				<div>
					<button
						class="btn btn-square"
						type="button"
						on:click={() => {
							if (!codeData) return;

							const a = document.createElement('a');
							a.href = codeData;
							a.download = 'qr-code.png';
							document.body.appendChild(a);
							a.click();
							document.body.removeChild(a);
						}}
					>
						<span class="sr-only">Download QR code</span>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24"
							><path
								fill="currentColor"
								d="M4.75 17.25a.75.75 0 0 1 .75.75v2.25c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V18a.75.75 0 0 1 1.5 0v2.25A1.75 1.75 0 0 1 18.25 22H5.75A1.75 1.75 0 0 1 4 20.25V18a.75.75 0 0 1 .75-.75"
							/><path
								fill="currentColor"
								d="M5.22 9.97a.749.749 0 0 1 1.06 0l4.97 4.969V2.75a.75.75 0 0 1 1.5 0v12.189l4.97-4.969a.749.749 0 1 1 1.06 1.06l-6.25 6.25a.749.749 0 0 1-1.06 0l-6.25-6.25a.749.749 0 0 1 0-1.06"
							/></svg
						>
					</button>
				</div>
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
							><path
								fill="currentColor"
								d="M7.024 3.75c0-.966.784-1.75 1.75-1.75H20.25c.966 0 1.75.784 1.75 1.75v11.498a1.75 1.75 0 0 1-1.75 1.75H8.774a1.75 1.75 0 0 1-1.75-1.75Zm1.75-.25a.25.25 0 0 0-.25.25v11.498c0 .139.112.25.25.25H20.25a.25.25 0 0 0 .25-.25V3.75a.25.25 0 0 0-.25-.25Z"
							/><path
								fill="currentColor"
								d="M1.995 10.749a1.75 1.75 0 0 1 1.75-1.751H5.25a.75.75 0 1 1 0 1.5H3.745a.25.25 0 0 0-.25.25L3.5 20.25c0 .138.111.25.25.25h9.5a.25.25 0 0 0 .25-.25v-1.51a.75.75 0 1 1 1.5 0v1.51A1.75 1.75 0 0 1 13.25 22h-9.5A1.75 1.75 0 0 1 2 20.25z"
							/></svg
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
