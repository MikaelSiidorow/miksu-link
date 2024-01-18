import { KV_REST_API_TOKEN, KV_REST_API_URL } from '$env/static/private';
import { error, redirect } from '@sveltejs/kit';
import { createClient } from '@vercel/kv';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { slug } = params;
	const kv = createClient({
		url: KV_REST_API_URL,
		token: KV_REST_API_TOKEN
	});
	const url = (await kv.get(slug)) as string | undefined;

	if (!url) {
		error(404, { message: 'Not found' });
	}

	redirect(301, url);
};
