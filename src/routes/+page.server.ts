import { KV_REST_API_TOKEN, KV_REST_API_URL } from '$env/static/private';
import { fail } from '@sveltejs/kit';
import { createClient } from '@vercel/kv';
import { message, setError, superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

// alphanumeric, dashes and underscores
const allowedCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789-_'.split('');

const schema = z.object({
	url: z.string().url().max(1000, {
		message: 'Sorry, max length is 1000 characters'
	}),
	slug: z
		.string()
		.min(1)
		.max(32)
		.refine((value) => value.split('').every((char) => allowedCharacters.includes(char)), {
			message: 'Sorry, the slug can only contain alphanumberic characters, dashes and underscores'
		})
		.optional()
});

const generateSlug = () => {
	const uuid = crypto.randomUUID();
	return uuid.slice(0, 8);
};

export const load: PageServerLoad = async () => {
	const form = await superValidate(schema);

	return { form };
};

export const actions: Actions = {
	default: async ({ request, url: baseUrl }) => {
		const form = await superValidate(request, schema);

		if (!form.valid) {
			fail(400, { form });
		}

		const { url, slug } = form.data;

		const kv = createClient({
			url: KV_REST_API_URL,
			token: KV_REST_API_TOKEN
		});

		if (slug) {
			const existingSlug = await kv.get(slug);
			if (existingSlug) {
				return setError(form, 'slug', 'Slug already in use');
			}
		}
		const pageSlug = slug ?? generateSlug();
		const result = await kv.set(pageSlug, url);
		if (result !== 'OK') {
			fail(500, { form });
		}

		const createdUrl = new URL(`/${pageSlug}`, baseUrl).toString();

		return message(form, createdUrl);
	}
};
