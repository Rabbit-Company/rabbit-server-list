import Utils from './utils.js';
import Errors from './errors.js';
import Validate from './validate.js';
import Account from './account.js';

// Durable Objects
export { MinecraftVoteDO } from './dos.js';

// Servers
import Minecraft from './servers/minecraft.js';

import { Hono } from 'hono';
import { cors } from 'hono/cors';
const router = new Hono();

router.use('*', cors({
	origin: '*',
	allowHeaders: ['*'],
	allowMethods: ['POST', 'PUT', 'DELETE', 'GET', 'OPTIONS'],
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

	let message = await Account.create(auth.user, data['email'], auth.pass, data['turnstile']);
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

router.post('/v1/account/servers/minecraft', async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	const auth = Utils.basicAuthentication(request.req.headers.get('Authorization'));
	if(auth === null) return Utils.jsonResponse(Errors.getJson(1006));

	let data = {};
	try{
		data = await request.req.json();
	}catch{
		return Utils.jsonResponse(Errors.getJson(1000));
	}

	let message = await Minecraft.add(auth.user, auth.pass, data);
	return Utils.jsonResponse(message);
}).get(async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	const auth = Utils.basicAuthentication(request.req.headers.get('Authorization'));
	if(auth === null) return Utils.jsonResponse(Errors.getJson(1006));

	let message = await Minecraft.listOwner(auth.user, auth.pass);
	return Utils.jsonResponse(message);
});

router.post('/v1/servers/minecraft/crawler', async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	const auth = Utils.basicAuthentication(request.req.headers.get('Authorization'));
	if(auth === null) return Utils.jsonResponse(Errors.getJson(1006));

	if(auth.user !== 'crawler') return Utils.jsonResponse(Errors.getJson(9999));
	if(auth.pass !== request.env.CRAWLER_SECRET_TOKEN) return Utils.jsonResponse(Errors.getJson(9999));

	let data = {};
	try{
		data = await request.req.json();
	}catch{
		return Utils.jsonResponse(Errors.getJson(1000));
	}

	let message = await Minecraft.updateCrawledData(data);
	return Utils.jsonResponse(message);
});

router.get('/v1/servers/minecraft/page/:page', async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	let message = await Minecraft.list(request.req.param('page'));
	return Utils.jsonResponse(message);
});

router.get('/v1/servers/minecraft/page/:page/filter/:filter/:value', async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	let message = await Minecraft.listFilter(request.req.param('page'), request.req.param('filter'), request.req.param('value'));
	return Utils.jsonResponse(message);
});

router.post('/v1/server/minecraft/:id', async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	const auth = Utils.basicAuthentication(request.req.headers.get('Authorization'));
	if(auth === null) return Utils.jsonResponse(Errors.getJson(1006));

	let data = {};
	try{
		data = await request.req.json();
	}catch{
		return Utils.jsonResponse(Errors.getJson(1000));
	}

	let message = await Minecraft.edit(auth.user, auth.pass, request.req.param('id'), data);
	return Utils.jsonResponse(message);
}).get(async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	let message = await Minecraft.get(request.req.param('id'));
	return Utils.jsonResponse(message);
}).delete(async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	const auth = Utils.basicAuthentication(request.req.headers.get('Authorization'));
	if(auth === null) return Utils.jsonResponse(Errors.getJson(1006));

	let message = await Minecraft.delete(auth.user, auth.pass, request.req.param('id'));
	return Utils.jsonResponse(message);
});

router.get('/v1/server/minecraft/:id/stats', async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	let message = await Minecraft.getStats(request.req.param('id'));
	return Utils.jsonResponse(message);
});

router.post('/v1/server/minecraft/:id/vote', async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	let data = {};
	try{
		data = await request.req.json();
	}catch{
		return Utils.jsonResponse(Errors.getJson(1000));
	}

	let message = await Minecraft.vote(request.req.param('id'), data['username'], data['turnstile']);
	return Utils.jsonResponse(message);
}).get(async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	let message = await Minecraft.getVotes(request.req.param('id'));
	return Utils.jsonResponse(message);
});

router.get('/v1/server/minecraft/:id/banner', async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	let banner = await Minecraft.getBanner(request.req.param('id'));
	if(banner !== null) return banner;

	return Utils.jsonResponse(Errors.getJson(1026));
}).put(async request => {
	await Utils.initialize(request.env, request.req.headers.get('CF-Connecting-IP'));

	if(!request.req.headers.has('Content-Type')) return Utils.jsonResponse(Errors.getJson(1023));
	let contentType = request.req.headers.get('Content-Type');
	if(!Validate.bannerType(contentType)) return Utils.jsonResponse(Errors.getJson(1024));

	let fileSize = request.req.headers.get('Content-Length');
	if(fileSize > 3_000_000) return Utils.jsonResponse(Errors.getJson(1025));

	const auth = Utils.basicAuthentication(request.req.headers.get('Authorization'));
	if(auth === null) return Utils.jsonResponse(Errors.getJson(1006));

	const options = { httpMetadata: { contentType: contentType, } };
	let message = await Minecraft.saveBanner(auth.user, auth.pass, request.req.param('id'), request.req.body, options);
	return Utils.jsonResponse(message);
});

router.all("*", () => {
	return Utils.jsonResponse({ "error": 404, "info": "Invalid API endpoint" }, 404);
});

export default {
	fetch: router.fetch,
	async scheduled(event, env, ctx) {
		await Minecraft.resetVotes(env);
	}
};