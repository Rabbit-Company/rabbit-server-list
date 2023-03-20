import Utils from './utils.js';
import Errors from './errors.js';
import Accounts from './accounts.js';

import { Hono } from 'hono';
import { cors } from 'hono/cors';
const router = new Hono();

router.use('*', cors({
	origin: '*',
	allowHeaders: ['*'],
	allowMethods: ['POST', 'GET', 'OPTIONS'],
	maxAge: 86400,
	credentials: true,
}));

router.post('/v1/account/create', async request => {
	let data = {};

	try{
		data = await request.req.json();
	}catch{
		return Utils.jsonResponse(Errors.getJson(1000));
	}

	let message = await Accounts.create(data['username'], data['email'], data['password']);
	return Utils.jsonResponse(message);
});

router.post('/v1/account/delete', async request => {
	let data = {};

	try{
		data = await request.req.json();
	}catch{
		return Utils.jsonResponse(Errors.getJson(1000));
	}

	let message = await Accounts.delete(data['username'], data['token']);
	return Utils.jsonResponse(message);
});

router.all("*", () => {
	return Utils.jsonResponse({ "error": 404, "info": "Invalid API endpoint" }, 404);
});

export default {
	fetch: router.fetch,
	async scheduled(event, env, ctx) {

	}
};
