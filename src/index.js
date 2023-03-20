import Utils from './utils.js';
import Errors from './errors.js';
import Accounts from './accounts.js';
import Account from './account.js';

// Servers
import Minecraft from './servers/minecraft.js';

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

router.post('/v1/account', async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	const auth = Utils.basicAuthentication(request.req.headers.get('Authorization'));
	if(auth === null) return Utils.jsonResponse(Errors.getJson(1006));

	let data = {};
	try{
		data = await request.req.json();
	}catch{
		return Utils.jsonResponse(Errors.getJson(1000));
	}

	let message = await Account.create(auth.user, data['email'], auth.pass);
	return Utils.jsonResponse(message);
}).get(async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	const auth = Utils.basicAuthentication(request.req.headers.get('Authorization'));
	if(auth === null) return Utils.jsonResponse(Errors.getJson(1006));

	let message = await Account.data(auth.user, auth.pass);
	return Utils.jsonResponse(message);
}).delete(async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	const auth = Utils.basicAuthentication(request.req.headers.get('Authorization'));
	if(auth === null) return Utils.jsonResponse(Errors.getJson(1006));

	let message = await Account.delete(auth.user, auth.pass);
	return Utils.jsonResponse(message);
});

router.get('/v1/account/token', async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	const auth = Utils.basicAuthentication(request.req.headers.get('Authorization'));
	if(auth === null) return Utils.jsonResponse(Errors.getJson(1006));

	let message = await Account.token(auth.user, auth.pass);
	return Utils.jsonResponse(message);
});

router.get('/v1/servers/minecraft', async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	let message = await Minecraft.list(1);
	return Utils.jsonResponse(message);
});

router.get('/v1/servers/minecraft/:page', async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	let message = await Minecraft.list(request.req.param('page'));
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
