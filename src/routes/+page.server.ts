import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

const schema = z.object({
	url: z.string().url().max(1000, {
		message: 'Sorry, max length is 1000 characters'
	}),
	slug: z.string().min(1).max(32).optional()
});

export const load: PageServerLoad = async () => {
	const form = await superValidate(schema);

	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, schema);

		if (!form.valid) {
			fail(400, { form });
		}

		const { url, slug } = form.data;

		console.log('Creating...', url, slug);

		return { form };
	}
};
