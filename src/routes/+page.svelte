<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';

	export let data: PageData;

	const { form, errors, constraints, enhance } = superForm(data.form);
</script>

<h1 class="font-mono text-2xl">miksu-link</h1>
<form class="space-y-4" method="post" use:enhance>
	<div>
		<label class="form-control w-full max-w-xs">
			<div class="label"><span class="label-text">URL</span></div>
			<input
				class="input input-bordered w-full max-w-xs"
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

		<label class="form-control w-full max-w-xs">
			<div class="label">
				<span class="label-text">Slug</span><span class="label-text-alt">(optional)</span>
			</div>
			<input
				class="input input-bordered w-full max-w-xs"
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

	<button class="btn btn-primary w-full max-w-xs" type="submit">Shorten URL</button>
</form>
