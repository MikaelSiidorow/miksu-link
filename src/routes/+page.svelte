<script lang="ts">
	import { page } from '$app/stores';
	import QRCode from 'qrcode';
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let codeData: string | null = $state(null);
	let centerEmoji: string = $state('');
	let centerImage: File | null = $state(null);

	const generateQR = async (text: string) => {
		try {
			// Generate base QR code
			const baseQR = await QRCode.toDataURL(text, {
				errorCorrectionLevel: 'H',
				type: 'image/png',
				width: 300,
				margin: 1
			});

			// If no emoji or image, just use the base QR code
			if (!centerEmoji && !centerImage) {
				codeData = baseQR;
				return;
			}

			// Create canvas to overlay emoji/image
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			// Load base QR code image
			const qrImage = new Image();
			await new Promise<void>((resolve, reject) => {
				qrImage.onload = () => resolve();
				qrImage.onerror = reject;
				qrImage.src = baseQR;
			});

			canvas.width = qrImage.width;
			canvas.height = qrImage.height;

			// Draw QR code
			ctx.drawImage(qrImage, 0, 0);

			// Calculate center position and size for overlay
			const centerSize = Math.floor(qrImage.width * 0.3); // 30% of QR code size
			const centerX = (qrImage.width - centerSize) / 2;
			const centerY = (qrImage.height - centerSize) / 2;

			// Draw white background circle for better contrast
			ctx.fillStyle = 'white';
			ctx.beginPath();
			ctx.arc(qrImage.width / 2, qrImage.height / 2, centerSize / 2 + 5, 0, 2 * Math.PI);
			ctx.fill();

			if (centerEmoji) {
				// Draw emoji in center
				ctx.font = `${centerSize}px Arial`;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(centerEmoji, qrImage.width / 2, qrImage.height / 2);
			} else if (centerImage) {
				// Draw uploaded image in center
				const imgElement = new Image();
				await new Promise<void>((resolve, reject) => {
					imgElement.onload = () => resolve();
					imgElement.onerror = reject;
					imgElement.src = URL.createObjectURL(centerImage);
				});

				// Draw image with circular clipping
				ctx.save();
				ctx.beginPath();
				ctx.arc(qrImage.width / 2, qrImage.height / 2, centerSize / 2, 0, 2 * Math.PI);
				ctx.clip();
				ctx.drawImage(imgElement, centerX, centerY, centerSize, centerSize);
				ctx.restore();

				URL.revokeObjectURL(imgElement.src);
			}

			codeData = canvas.toDataURL('image/png');
		} catch (err) {
			console.error(err);
		}
	};

	const { form, message, errors, constraints, enhance, tainted, isTainted } = superForm(data.form);
</script>

{#if $page.url.searchParams.has('qr-code')}
	<form
		class="w-full max-w-md space-y-4 p-4"
		onsubmit={(event) => {
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
						onclick={() => {
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

		<div class="divider">Customize (optional)</div>

		<div>
			<label class="form-control w-full max-w-md">
				<div class="label">
					<span class="label-text">Center Emoji</span>
					<span class="label-text-alt">(e.g., ❤️, 🔗, 🎉)</span>
				</div>
				<input
					class="input input-bordered w-full max-w-md"
					type="text"
					placeholder="Paste an emoji here"
					maxlength="2"
					bind:value={centerEmoji}
					oninput={() => {
						if (centerEmoji) centerImage = null;
					}}
				/>
			</label>
		</div>

		<div class="divider">OR</div>

		<div>
			<label class="form-control w-full max-w-md">
				<div class="label">
					<span class="label-text">Center Image</span>
					<span class="label-text-alt">(PNG, JPG, SVG)</span>
				</div>
				<input
					class="file-input file-input-bordered w-full max-w-md"
					type="file"
					accept="image/*"
					onchange={(e) => {
						const files = e.currentTarget.files;
						if (files && files.length > 0) {
							centerImage = files[0];
							centerEmoji = '';
						}
					}}
				/>
				{#if centerImage}
					<div class="label">
						<span class="label-text-alt">Selected: {centerImage.name}</span>
						<button
							type="button"
							class="label-text-alt link link-error"
							onclick={() => {
								centerImage = null;
							}}
						>
							Clear
						</button>
					</div>
				{/if}
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
						onclick={() => $message && navigator.clipboard.writeText($message)}
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
