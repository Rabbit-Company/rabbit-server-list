import Utils from './utils.js';
import Errors from './errors.js';
import Account from './account.js';

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
	if(contentType !== 'image/gif') return Utils.jsonResponse(Errors.getJson(1024));

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

	}
};

/*

	DURABLE OBJECTS

*/

export class MinecraftVoteDO{
	constructor(state, env) {
    this.state = state;
  }

	// Once every 23 hours
	static voteLimit = 82800000;

	static jsonResponse(json, statusCode = 200){
		if(typeof(json) !== 'string') json = JSON.stringify(json);
		return new Response(json, {
			headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
			status: statusCode
		});
	}

	async alarm(){
		let votes = await this.state.storage.get('votes');
		if(votes !== null){
			let monthlyVotes = votes['monthly'];

			let votesHistory = await this.state.storage.get('votes-history');
			let prevDate = new Date(new Date().getFullYear(), new Date().getMonth()-1, 1);
			if(votesHistory === null) votesHistory = {};
			votesHistory[prevDate.getFullYear() + '-' + prevDate.getMonth()] = monthlyVotes;
			await this.state.storage.put('votes-history', votesHistory);

			votes['monthly'] = 0;
			await this.state.storage.put('votes', votes);
		}
	}

	async fetch(request) {
		let url = new URL(request.url);

		let currentAlarm = await this.state.storage.getAlarm();
		if(currentAlarm == null){
			let nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getTime() + 7_200_000;
      this.state.storage.setAlarm(nextMonth);
    }

		// Get number of votes
		if(url.pathname === '/votes/get'){
			let votes = await this.state.storage.get('votes');
			if(votes == null) return MinecraftVoteDO.jsonResponse({ 'error': 0, 'info': 'success2', 'data': { 'monthly': 0, 'total': 0 } });
			return MinecraftVoteDO.jsonResponse({ 'error': 0, 'info': 'success3', 'data': votes });
		}

		// Get history of votes
		if(url.pathname === '/votes/history/get'){
			let historyVotes = await this.state.storage.get('votes-history');
			if(historyVotes == null) return MinecraftVoteDO.jsonResponse({ 'error': 0, 'info': 'success4', 'data': {} });
			return MinecraftVoteDO.jsonResponse({ 'error': 0, 'info': 'success5', 'data': historyVotes });
		}

		// Vote
		if(url.pathname === '/vote'){
			let data = await request.json();

			if(!data['username'] || !data['ip']) return MinecraftVoteDO.jsonResponse({ 'error': 1000, 'info': 'Not all required data provided in json format.' });

			let ipVoteDate = await this.state.storage.get('votedate-ip-' + data['ip']);
			if(ipVoteDate != null){
				if((Date.now() - MinecraftVoteDO.voteLimit) < Number(ipVoteDate)){
					return MinecraftVoteDO.jsonResponse({ 'error': 3001, 'info': 'You have already voted today.' });
				}
			}

			let usernameVoteDate = await this.state.storage.get('votedate-username-' + data['username']);
			if(usernameVoteDate != null){
				if((Date.now() - MinecraftVoteDO.voteLimit) < Number(usernameVoteDate)){
					return MinecraftVoteDO.jsonResponse({ 'error': 3002, 'info': 'You have already voted today.' });
				}
			}

			await this.state.storage.put('votedate-ip-' + data['ip'], Date.now());
			await this.state.storage.put('votedate-username-' + data['username'], Date.now());

			let votes = await this.state.storage.get('votes');
			if(votes == null) votes = { 'monthly': 0, 'total': 0 };
			votes['monthly']++;
			votes['total']++;
			await this.state.storage.put('votes', votes);

			return MinecraftVoteDO.jsonResponse({ 'error': 0, 'info': 'success' });
		}

		return MinecraftVoteDO.jsonResponse({ "error": 404, "info": "Invalid API endpoint" }, 404);
	}
}