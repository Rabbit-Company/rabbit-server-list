import Utils from "../utils.js";
import Validate from "../validate.js";
import Errors from "../errors.js";

export default class Minecraft{

	static async list(page = 1){
		if(!Validate.isPositiveInteger(page)) page = 1;
		if(page > 100) page = 100;

		let limit = 20;
		let offset = limit * (page - 1);

		let data = await Utils.getValue('servers-minecraft-list-' + page);
		if(data !== null) return { 'error': 0, 'info': 'success', 'data': JSON.parse(data) };

		try{
			const { results } = await Utils.env.DB.prepare("SELECT id, owner, name, ip, port, bedrock_ip, bedrock_port, website, discord, twitter, store, trailer, version, categories, country, description, players, players_max, online, uptime, votes, votes_total, created, updated FROM minecraft ORDER BY votes LIMIT " + limit + " OFFSET " + offset).all();
			await Utils.setValue('servers-minecraft-list-' + page, JSON.stringify(results), 60);
			return { 'error': 0, 'info': 'success', 'data': results };
		}catch{
			return Errors.getJson(1009);
		}
	}

	static async listFilter(page, filter, value){
		if(!Validate.isPositiveInteger(page)) page = 1;
		if(!Validate.minecraftServerFilter(filter)) return Errors.getJson(1035);

		if(filter === 'version'){
			if(!Validate.minecraftServerVersion(value)) return Errors.getJson(1035);
		}else if(filter === 'category'){
			if(!Validate.minecraftServerCategoryList.includes(value)) return Errors.getJson(1035);
		}

		if(page > 100) page = 100;

		let limit = 20;
		let offset = limit * (page - 1);

		let data = await Utils.getValue('servers-minecraft-list-' + page + '-filter-' + filter + '-' + value);
		if(data !== null) return { 'error': 0, 'info': 'success', 'data': JSON.parse(data) };

		let sql;
		if(filter === 'version'){
			sql = Utils.env.DB.prepare("SELECT id, owner, name, ip, port, bedrock_ip, bedrock_port, website, discord, twitter, store, trailer, version, categories, country, description, players, players_max, online, uptime, votes, votes_total, created, updated FROM minecraft WHERE version = ? ORDER BY votes LIMIT " + limit + " OFFSET " + offset).bind(value);
		}else if(filter === 'category'){
			sql = Utils.env.DB.prepare("SELECT id, owner, name, ip, port, bedrock_ip, bedrock_port, website, discord, twitter, store, trailer, version, categories, country, description, players, players_max, online, uptime, votes, votes_total, created, updated FROM minecraft WHERE categories LIKE '%" + value + "%' ORDER BY votes LIMIT " + limit + " OFFSET " + offset);
		}

		try{
			const { results } = await sql.all();
			await Utils.setValue('servers-minecraft-list-' + page + '-filter-' + filter + '-' + value, JSON.stringify(results), 60);
			return { 'error': 0, 'info': 'success', 'data': results };
		}catch{
			return Errors.getJson(1009);
		}
	}

	static async listOwner(username, token){
		if(!Validate.username(username)) return Errors.getJson(1001);
		if(!Validate.token(token)) return Errors.getJson(1004);

		if(!(await Utils.authenticate(username, token))) return Errors.getJson(1008);

		try{
			const { results } = await Utils.env.DB.prepare("SELECT id, owner, name, ip, port, bedrock_ip, bedrock_port, website, discord, twitter, store, trailer, version, categories, country, description, players, players_max, online, uptime, votes, votes_total, votifierIP, votifierPort, votifierToken, secretToken, created, updated FROM minecraft WHERE owner = ?").bind(username).all();
			return { 'error': 0, 'info': 'success', 'data': results };
		}catch{
			return Errors.getJson(1009);
		}
	}

	static async get(id){
		if(!Validate.isPositiveInteger(id)) return Errors.getJson(1022);

		let data = await Utils.getValue('server-minecraft-' + id);
		if(data !== null) return { 'error': 0, 'info': 'success', 'data': JSON.parse(data) };

		try{
			const result = await Utils.env.DB.prepare("SELECT id, owner, name, ip, port, bedrock_ip, bedrock_port, website, discord, twitter, store, trailer, version, categories, country, description, players, players_max, online, uptime, votes, votes_total, created, updated FROM minecraft WHERE id = ?").bind(id).first();
			await Utils.setValue('server-minecraft-' + id, JSON.stringify(result), 60);
			return { 'error': 0, 'info': 'success', 'data': result };
		}catch{
			return Errors.getJson(1009);
		}
	}

	static async getStats(id){
		if(!Validate.isPositiveInteger(id)) return Errors.getJson(1022);

		let data = await Utils.getValue('server-minecraft-stats-' + id);
		if(data !== null) return { 'error': 0, 'info': 'success', 'data': JSON.parse(data) };

		const dataset = "rabbit-server-list-minecraft";
		const endpoint = "https://api.cloudflare.com/client/v4/accounts/" + Utils.env.ACCOUNT_ID + "/analytics_engine/sql";

		const query_players = `SELECT toStartOfInterval(timestamp, INTERVAL '1' HOUR) AS hour, AVG(double1) as avg, MIN(double1) as min, MAX(double1) as max FROM '${dataset}' WHERE index1 = '${id}' GROUP BY hour`;
		const query_uptime = `SELECT toStartOfInterval(timestamp, INTERVAL '1' HOUR) AS hour, ((SUM(double2) / COUNT()) * 100) as uptime FROM '${dataset}' WHERE index1 = '${id}' GROUP BY hour`;

		let options = {
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain',
				'Accept': 'application/json',
				'Authorization': `Bearer ${Utils.env.CF_TOKEN}`,
			},
			body: query_players,
		}

		let response = { 'error': 0, 'info': 'success', 'data': { 'players': {}, 'uptime': {} }};

		try{
			const playersResponse = await fetch(endpoint, options);
			let playersJson = await playersResponse.json();
			response.data.players = playersJson.data;

			options.body = query_uptime;

			const uptimeResponse = await fetch(endpoint, options);
			let uptimeJson = await uptimeResponse.json();
			response.data.uptime = uptimeJson.data;

			let uptimeAverage = 0;
			response.data.uptime.forEach(value => {
				uptimeAverage += value.uptime;
			});
			uptimeAverage /= response.data.uptime.length;
			uptimeAverage = Math.round((uptimeAverage + Number.EPSILON) * 100) / 100;

			try{
				await Utils.env.DB.prepare("UPDATE minecraft SET uptime = ? WHERE id = ?")
				.bind(uptimeAverage, id).run();
			}catch{}

			await Utils.setValue('server-minecraft-stats-' + id, JSON.stringify(response.data), 3600);
			return response;
		}catch{
			return Errors.getJson(1009);
		}

	}

	static async vote(id, username, turnstile){
		if(!Validate.isPositiveInteger(id)) return Errors.getJson(1022);
		if(!Validate.captcha(turnstile)) return Errors.getJson(1034);

		let formData = new FormData();
		formData.append('secret', Utils.env.CF_TURNSTILE_TOKEN);
		formData.append('response', turnstile);
		formData.append('remoteip', Utils.IP);

		const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
		const result = await fetch(url, { body: formData, method: 'POST' });
		const outcome = await result.json();
		if(!outcome.success) return Errors.getJson(1034);

		let limitedIP = await Utils.getValue('server-minecraft-' + id + '-vote-limit-ip-' + Utils.IP);
		if(limitedIP !== null) return JSON.parse(limitedIP);
		let limitedUsername = await Utils.getValue('server-minecraft-' + id + '-vote-limit-username-' + username);
		if(limitedUsername !== null) return JSON.parse(limitedUsername);

		let doID = Utils.env.MVDO.idFromName(id);
		let request = new Request('https://api.rabbitserverlist.com/vote', {
			method: 'POST',
			body: JSON.stringify({ 'username': username, 'ip': Utils.IP }),
			headers: { 'Content-Type': 'application/json' },
		})
		let response = await Utils.env.MVDO.get(doID).fetch(request);
		let json = await response.json();
		if(json.error !== 0){
			if(json.error === 3001) await Utils.setValue('server-minecraft-' + id + '-vote-limit-ip-' + Utils.IP, JSON.stringify(json), 600);
			if(json.error === 3002) await Utils.setValue('server-minecraft-' + id + '-vote-limit-username-' + username, JSON.stringify(json), 600);
			return json;
		}

		try{
			await Utils.env.DB.prepare("UPDATE minecraft SET votes = votes + 1, votes_total = votes_total + 1 WHERE id = ?").bind(id).run();
		}catch{
			return Errors.getJson(1009);
		}

		let votifierIP = null;
		let votifierPort = null;
		let votifierToken = null;

		let data = await Utils.getValue('server-minecraft-' + id + '-votifier');
		if(data !== null){
			data = JSON.parse(data);
			votifierIP = data.votifierIP;
			votifierPort = data.votifierPort;
			votifierToken = data.votifierToken;
		}else{
			try{
				const result = await Utils.env.DB.prepare("SELECT votifierIP, votifierPort, votifierToken FROM minecraft WHERE id = ?").bind(id).first();
				await Utils.setValue('server-minecraft-' + id + '-votifier', JSON.stringify(result), 3600);

				votifierIP = result.votifierIP;
				votifierPort = result.votifierPort;
				votifierToken = result.votifierToken;
			}catch{}
		}

		if(votifierIP && votifierPort && votifierToken){
			await fetch('https://crawler.rabbitserverlist.com/v1/servers/minecraft/vote', {
				method: 'POST',
				body: JSON.stringify({
					'authToken': Utils.env.CRAWLER_SECRET_TOKEN,
					'ip': votifierIP,
					'port': votifierPort,
					'token': votifierToken,
					'username': username
				})
			});
		}

		return { 'error': 0, 'info': 'success' };
	}

	static async getVotes(id){
		if(!Validate.isPositiveInteger(id)) return Errors.getJson(1022);

		let votes = await Utils.getValue('server-minecraft-' + id + '-votes', 600);
		if(votes !== null) return JSON.parse(votes);

		let doID = Utils.env.MVDO.idFromName(id);
		let request = new Request('https://api.rabbitserverlist.com/votes/get');
		let response = await Utils.env.MVDO.get(doID).fetch(request);
		let json = await response.json();

		await Utils.setValue('server-minecraft-' + id + '-votes', JSON.stringify(json), 3600);

		return json;
	}

	static async resetVotes(env){
		try{
			await env.DB.prepare("UPDATE minecraft SET votes = 0").run();
		}catch{}
	}

	static async add(username, token, data){
		if(!Validate.username(username)) return Errors.getJson(1001);
		if(!Validate.token(token)) return Errors.getJson(1004);

		if(!Validate.serverName(data['name'])) return Errors.getJson(1010);
		if(!Validate.ip(data['ip'])) return Errors.getJson(1011);
		if(!Validate.port(data['port'])) return Errors.getJson(1012);
		if(!Validate.minecraftServerVersion(data['version'])) return Errors.getJson(1015);
		if(!Validate.minecraftServerCategory(data['categories'])) return Errors.getJson(1016);
		if(!Validate.country(data['country'])) return Errors.getJson(1017);
		if(!Validate.description(data['description'])) return Errors.getJson(1018);

		if(data['bedrock_ip'] !== null && (!Validate.ip(data['bedrock_ip']))) return Errors.getJson(1030);
		if(data['bedrock_port'] !== null && (!Validate.port(data['bedrock_port']))) return Errors.getJson(1031);

		if(data['website'] !== null && (!Validate.website(data['website']))) return Errors.getJson(1013);
		if(data['discord'] !== null && (!Validate.website(data['discord']))) return Errors.getJson(1014);
		if(data['twitter'] !== null && (!Validate.twitter(data['twitter']))) return Errors.getJson(1027);
		if(data['store'] !== null && (!Validate.website(data['store']))) return Errors.getJson(1028);
		if(data['trailer'] !== null && (!Validate.youtubeVideo(data['trailer']))) return Errors.getJson(1029);

		if(data['votifierIP'] !== null && (!Validate.ip(data['votifierIP']))) return Errors.getJson(1019);
		if(data['votifierPort'] !== null && (!Validate.port(data['votifierPort']))) return Errors.getJson(1020);
		if(data['votifierToken'] !== null && (!Validate.minecraftVotifierToken(data['votifierToken']))) return Errors.getJson(1021);

		if(!(await Utils.authenticate(username, token))) return Errors.getJson(1008);

		let categories = "";
		for(let i = 0; i < data['categories'].length; i++){
			categories += data['categories'][i] + ',';
		}
		categories = categories.substring(0, categories.length-1);

		let secretToken = await Utils.generateSecret();

		try{
			await Utils.env.DB.prepare("INSERT INTO minecraft(owner, name, ip, port, bedrock_ip, bedrock_port, website, discord, twitter, store, trailer, version, categories, country, description, votifierIP, votifierPort, votifierToken, secretToken, created, updated) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
			.bind(username, data['name'], data['ip'], data['port'], data['bedrock_ip'], data['bedrock_port'], data['website'], data['discord'], data['twitter'], data['store'], data['trailer'], data['version'], categories, data['country'], data['description'], data['votifierIP'], data['votifierPort'], data['votifierToken'], secretToken, Utils.date, Utils.date).run();
		}catch{
			return Errors.getJson(1032);
		}

		return Errors.getJson(0);
	}

	static async edit(username, token, id, data){
		if(!Validate.username(username)) return Errors.getJson(1001);
		if(!Validate.token(token)) return Errors.getJson(1004);

		if(!Validate.isPositiveInteger(id)) return Errors.getJson(1022);

		if(!Validate.serverName(data['name'])) return Errors.getJson(1010);
		if(!Validate.ip(data['ip'])) return Errors.getJson(1011);
		if(!Validate.port(data['port'])) return Errors.getJson(1012);
		if(!Validate.minecraftServerVersion(data['version'])) return Errors.getJson(1015);
		if(!Validate.minecraftServerCategory(data['categories'])) return Errors.getJson(1016);
		if(!Validate.country(data['country'])) return Errors.getJson(1017);
		if(!Validate.description(data['description'])) return Errors.getJson(1018);

		if(!Validate.token(data['secretToken'])) return Errors.getJson(1033);

		if(data['bedrock_ip'] !== null && (!Validate.ip(data['bedrock_ip']))) return Errors.getJson(1030);
		if(data['bedrock_port'] !== null && (!Validate.port(data['bedrock_port']))) return Errors.getJson(1031);

		if(data['website'] !== null && (!Validate.website(data['website']))) return Errors.getJson(1013);
		if(data['discord'] !== null && (!Validate.website(data['discord']))) return Errors.getJson(1014);
		if(data['twitter'] !== null && (!Validate.twitter(data['twitter']))) return Errors.getJson(1027);
		if(data['store'] !== null && (!Validate.website(data['store']))) return Errors.getJson(1028);
		if(data['trailer'] !== null && (!Validate.youtubeVideo(data['trailer']))) return Errors.getJson(1029);

		if(data['votifierIP'] !== null && (!Validate.ip(data['votifierIP']))) return Errors.getJson(1019);
		if(data['votifierPort'] !== null && (!Validate.port(data['votifierPort']))) return Errors.getJson(1020);
		if(data['votifierToken'] !== null && (!Validate.minecraftVotifierToken(data['votifierToken']))) return Errors.getJson(1021);

		if(!(await Utils.authenticate(username, token))) return Errors.getJson(1008);
		if(!(await Utils.ownsServer('minecraft', username, id))) return Errors.getJson(9999);

		let categories = "";
		for(let i = 0; i < data['categories'].length; i++){
			categories += data['categories'][i] + ',';
		}
		categories = categories.substring(0, categories.length-1);

		try{
			await Utils.env.DB.prepare("UPDATE minecraft SET name = ?, ip = ?, port = ?, bedrock_ip = ?, bedrock_port = ?, website = ?, discord = ?, twitter = ?, store = ?, trailer = ?, version = ?, categories = ?, country = ?, description = ?, votifierIP = ?, votifierPort = ?, votifierToken = ?, secretToken = ? WHERE id = ?")
			.bind(data['name'], data['ip'], data['port'], data['bedrock_ip'], data['bedrock_port'], data['website'], data['discord'], data['twitter'], data['store'], data['trailer'], data['version'], categories, data['country'], data['description'], data['votifierIP'], data['votifierPort'], data['votifierToken'], data['secretToken'], id).run();
			await Utils.deleteValue('server-minecraft-' + id);
		}catch{
			return Errors.getJson(1009);
		}

		return Errors.getJson(0);
	}

	static async delete(username, token, id){
		if(!Validate.username(username)) return Errors.getJson(1001);
		if(!Validate.token(token)) return Errors.getJson(1004);

		if(!Validate.isPositiveInteger(id)) return Errors.getJson(1022);

		if(!(await Utils.authenticate(username, token))) return Errors.getJson(1008);
		if(!(await Utils.ownsServer('minecraft', username, id))) return Errors.getJson(9999);

		try{
			await Utils.deleteValue('server-minecraft-' + id);
			await Utils.env.R2.delete('servers/minecraft/banners/' + id);
			await Utils.env.DB.prepare("DELETE FROM minecraft WHERE id = ?").bind(id).run();
		}catch{
			return Errors.getJson(1009);
		}

		return Errors.getJson(0);
	}

	static async saveBanner(username, token, id, image, options){
		if(!Validate.username(username)) return Errors.getJson(1001);
		if(!Validate.token(token)) return Errors.getJson(1004);

		if(!Validate.isPositiveInteger(id)) return Errors.getJson(1022);

		if(!(await Utils.authenticate(username, token))) return Errors.getJson(1008);
		if(!(await Utils.ownsServer('minecraft', username, id))) return Errors.getJson(9999);

		await Utils.env.R2.put('servers/minecraft/banners/' + id, image, options);
		return Errors.getJson(0);
	}

	static async getBanner(id){
		if(!Validate.isPositiveInteger(id)) return Errors.getJson(1022);

		let headers = new Headers();
		headers.set('Content-Type', 'image/gif');

		let banner = await Utils.getCacheR2('minecraft-banner-' + id);
		if(banner !== null) return new Response(banner, { headers });

		banner = await Utils.env.R2.get('servers/minecraft/banners/' + id);
		if(banner !== null){
			let body = banner.body.tee();
			await Utils.setCacheR2('minecraft-banner-' + id, body[0], 3600);
			return new Response(body[1], { headers });
		}

		headers.set('Content-Type', 'image/png');

		banner = await Utils.getCacheR2('minecraft-banner-default');
		if(banner !== null) return new Response(banner, { headers });

		banner = await Utils.env.R2.get('servers/minecraft/banners/default');
		if(banner !== null){
			let body = banner.body.tee();
			await Utils.setCacheR2('minecraft-banner-default', body[0], 3600);
			return new Response(body[1], { headers });
		}

		return null;
	}

	static async updateCrawledData(data){

		if(typeof(data.servers) !== 'object') return Errors.getJson(1000);

		data = data.servers;
		let updated = 0;
		for(let i = 0; i < data.length; i++){
			try{
				if(data[i].online === true){
					await Utils.env.DB.prepare("UPDATE minecraft SET players = ?, players_max = ?, online = ?, updated = ? WHERE id = ?")
					.bind(data[i].players, data[i].players_max, data[i].updated, data[i].updated, data[i].id).run();
				}else{
					await Utils.env.DB.prepare("UPDATE minecraft SET players = ?, players_max = ?, updated = ? WHERE id = ?")
					.bind(data[i].players, data[i].players_max, data[i].updated, data[i].id).run();
				}

				let uptime = (data[i].online) ? 1 : 0;
				Utils.env.MAE.writeDataPoint({
					'doubles': [data[i].players, uptime],
					'indexes': [data[i].id]
				});

				updated++;
			}catch{}
		}

		return { 'error': 0, 'info': 'Success', 'data': { 'total': data.length, 'updated': updated } };
	}

}