import Utils from "../utils.js";
import Validate from "../validate.js";
import Errors from "../errors.js";

export default class Discord{

	static async list(page = 1){
		if(!Validate.isPositiveInteger(page)) page = 1;
		if(page > 100) page = 100;

		let limit = 20;
		let offset = limit * (page - 1);

		let data = await Utils.getValue('servers-discord-list-' + page);
		if(data !== null) return { 'error': 0, 'info': 'success', 'data': JSON.parse(data) };

		try{
			const { results } = await Utils.env.DB.prepare("SELECT id, owner, invite_code, guild_id, icon, banner, splash, name, category, keywords, description, members, members_total, votes, votes_total, created, updated FROM discord ORDER BY votes DESC LIMIT " + limit + " OFFSET " + offset).all();
			await Utils.setValue('servers-discord-list-' + page, JSON.stringify(results), 60);
			return { 'error': 0, 'info': 'success', 'data': results };
		}catch{
			return Errors.getJson(1009);
		}
	}

	static async listFilter(page, filter, value){
		if(!Validate.isPositiveInteger(page)) page = 1;
		if(!Validate.discordServerFilter(filter)) return Errors.getJson(1035);

		if(filter === 'query'){
			if(!Validate.query(value)) return Errors.getJson(1035);
		}else if(filter === 'category'){
			if(!Validate.discordServerCategory(value)) return Errors.getJson(1035);
		}

		if(page > 100) page = 100;

		let limit = 20;
		let offset = limit * (page - 1);

		let data = await Utils.getValue('servers-discord-list-' + page + '-filter-' + filter + '-' + value);
		if(data !== null) return { 'error': 0, 'info': 'success', 'data': JSON.parse(data) };

		let sql;
		if(filter === 'query'){
			sql = Utils.env.DB.prepare("SELECT id, owner, invite_code, guild_id, icon, banner, splash, name, category, keywords, description, members, members_total, votes, votes_total, created, updated FROM discord WHERE keywords LIKE '%" + value + "%' ORDER BY votes DESC LIMIT " + limit + " OFFSET " + offset);
		}else if(filter === 'category'){
			sql = Utils.env.DB.prepare("SELECT id, owner, invite_code, guild_id, icon, banner, splash, name, category, keywords, description, members, members_total, votes, votes_total, created, updated FROM discord WHERE category = ? ORDER BY votes DESC LIMIT " + limit + " OFFSET " + offset).bind(value);
		}

		try{
			const { results } = await sql.all();
			await Utils.setValue('servers-discord-list-' + page + '-filter-' + filter + '-' + value, JSON.stringify(results), 60);
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
			const { results } = await Utils.env.DB.prepare("SELECT id, owner, invite_code, guild_id, icon, banner, splash, name, category, keywords, description, members, members_total, votes, votes_total, secretToken, created, updated FROM discord WHERE owner = ?").bind(username).all();
			return { 'error': 0, 'info': 'success', 'data': results };
		}catch{
			return Errors.getJson(1009);
		}
	}

	static async get(id){
		if(!Validate.isPositiveInteger(id)) return Errors.getJson(1022);

		let data = await Utils.getValue('server-discord-' + id);
		if(data !== null) return { 'error': 0, 'info': 'success', 'data': JSON.parse(data) };

		try{
			const result = await Utils.env.DB.prepare("SELECT id, owner, invite_code, guild_id, icon, banner, splash, name, category, keywords, description, members, members_total, votes, votes_total, created, updated FROM discord WHERE id = ?").bind(id).first();
			await Utils.setValue('server-discord-' + id, JSON.stringify(result), 60);
			return { 'error': 0, 'info': 'success', 'data': result };
		}catch{
			return Errors.getJson(1009);
		}
	}

	static async getStats(id){
		if(!Validate.isPositiveInteger(id)) return Errors.getJson(1022);

		let data = await Utils.getValue('server-discord-stats-' + id);
		if(data !== null) return { 'error': 0, 'info': 'success', 'data': JSON.parse(data) };

		const dataset = "rabbit-server-list-discord";
		const endpoint = "https://api.cloudflare.com/client/v4/accounts/" + Utils.env.ACCOUNT_ID + "/analytics_engine/sql";

		const query_members = `SELECT toStartOfInterval(timestamp, INTERVAL '1' HOUR) AS hour, AVG(double1) as avg, MIN(double1) as min, MAX(double1) as max FROM '${dataset}' WHERE index1 = '${id}' GROUP BY hour`;
		const query_total_members = `SELECT toStartOfInterval(timestamp, INTERVAL '1' HOUR) AS hour, AVG(double2) as avg, MIN(double2) as min, MAX(double2) as max FROM '${dataset}' WHERE index1 = '${id}' GROUP BY hour`;

		let options = {
			method: 'POST',
			headers: {
				'Content-Type': 'text/plain',
				'Accept': 'application/json',
				'Authorization': `Bearer ${Utils.env.CF_TOKEN}`,
			},
			body: query_members,
		}

		let response = { 'error': 0, 'info': 'success', 'data': { 'members': {}, 'members_total': {} }};

		try{
			const membersResponse = await fetch(endpoint, options);
			let membersJson = await membersResponse.json();
			response.data.members = membersJson.data;

			options.body = query_total_members;

			const membersTotalResponse = await fetch(endpoint, options);
			let membersTotalJson = await membersTotalResponse.json();
			response.data.members_total = membersTotalJson.data;

			await Utils.setValue('server-discord-stats-' + id, JSON.stringify(response.data), 3600);
			return response;
		}catch{
			return Errors.getJson(1009);
		}

	}

	static async vote(id, token, turnstile){
		if(!Validate.isPositiveInteger(id)) return Errors.getJson(1022);
		if(!Validate.captcha(turnstile)) return Errors.getJson(1034);

		if(!Validate.bearer(token)) return Errors.getJson(1040);

		let formData = new FormData();
		formData.append('secret', Utils.env.CF_TURNSTILE_TOKEN);
		formData.append('response', turnstile);
		formData.append('remoteip', Utils.IP);

		let url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
		let result = await fetch(url, { body: formData, method: 'POST' });
		let outcome = await result.json();
		if(!outcome.success) return Errors.getJson(1034);

		let limitedIP = await Utils.getValue('server-discord-' + id + '-vote-limit-ip-' + Utils.IP);
		if(limitedIP !== null) return JSON.parse(limitedIP);

		url = 'https://discord.com/api/v10/oauth2/@me';
		result = await fetch(url, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, method: 'GET' });
		if(!result.ok || result.status !== 200) return Errors.getJson(1040);
		outcome = await result.json();

		let userData = outcome.user;
		if(typeof(userData) !== 'object' || typeof(userData.id) !== 'string') return Errors.getJson(1040);

		let limitedDiscordID = await Utils.getValue('server-discord-' + id + '-vote-limit-id-' + userData.id);
		if(limitedDiscordID !== null) return JSON.parse(limitedDiscordID);

		let doID = Utils.env.DVDO.idFromName(id);
		let request = new Request('https://api.rabbitserverlist.com/vote', {
			method: 'POST',
			body: JSON.stringify({ 'id': userData.id, 'ip': Utils.IP, 'username': userData.username, 'avatar': userData.avatar, 'discriminator': userData.discriminator }),
			headers: { 'Content-Type': 'application/json' },
		})
		let response = await Utils.env.DVDO.get(doID).fetch(request);
		let json = await response.json();
		if(json.error !== 0){
			if(json.error === 3001) await Utils.setValue('server-discord-' + id + '-vote-limit-ip-' + Utils.IP, JSON.stringify(json), 600);
			if(json.error === 3002) await Utils.setValue('server-discord-' + id + '-vote-limit-id-' + userData.id, JSON.stringify(json), 600);
			return json;
		}

		try{
			await Utils.env.DB.prepare("UPDATE discord SET votes = votes + 1, votes_total = votes_total + 1 WHERE id = ?").bind(id).run();
		}catch{
			return Errors.getJson(1009);
		}

		return { 'error': 0, 'info': 'success' };
	}

	static async getVotes(id){
		if(!Validate.isPositiveInteger(id)) return Errors.getJson(1022);

		let votes = await Utils.getValue('server-discord-' + id + '-votes', 600);
		if(votes !== null) return JSON.parse(votes);

		let doID = Utils.env.DVDO.idFromName(id);
		let request = new Request('https://api.rabbitserverlist.com/votes/get');
		let response = await Utils.env.DVDO.get(doID).fetch(request);
		let json = await response.json();

		await Utils.setValue('server-discord-' + id + '-votes', JSON.stringify(json), 3600);

		return json;
	}

	static async resetVotes(env){
		try{
			await env.DB.prepare("UPDATE discord SET votes = 0").run();
		}catch{}
	}

	static async add(username, token, data){
		if(!Validate.username(username)) return Errors.getJson(1001);
		if(!Validate.token(token)) return Errors.getJson(1004);

		if(!Validate.bearer(data['token'])) return Errors.getJson(1040);
		if(!Validate.discordInviteCode(data['invite_code'])) return Errors.getJson(1036);
		if(!Validate.discordServerCategory(data['category'])) return Errors.getJson(1039);
		if(!Validate.description(data['description'])) return Errors.getJson(1018);
		if(!Validate.keywords(data['keywords'])) return Errors.getJson(1038);

		if(!(await Utils.authenticate(username, token))) return Errors.getJson(1008);

		let secretToken = await Utils.generateSecret();
		let keywords = "";
		for(let i = 0; i < data['keywords'].length; i++){
			if(Validate.keyword(data['keywords'][i])) keywords += data['keywords'][i] + ',';
		}
		keywords = keywords.substring(0, keywords.length-1);
		if(keywords.length < 2) return Errors.getJson(1038);

		let res = await fetch('https://discord.com/api/v10/invites/' + data['invite_code'] + '?with_counts=true&with_expiration=true');
		if(!res.ok) return Errors.getJson(1009);
		if(res.status === 404) return Errors.getJson(1036);
		if(res.status !== 200) return Errors.getJson(1009);

		let resData = await res.json();
		if(resData['expires_at'] !== null) return Errors.getJson(1037);

		let guild_id = resData.guild?.id;
		let name = resData.guild?.name;
		let icon = resData.guild?.icon;
		let banner = resData.guild?.banner;
		let splash = resData.guild?.splash;

		if(!Validate.snowflake(guild_id)) return Errors.getJson(1009);

		res = await fetch('https://discord.com/api/v10/users/@me/guilds', { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data['token']}` }, method: 'GET' });
		if(!res.ok) return Errors.getJson(1040);
		if(res.status !== 200) return Errors.getJson(1040);

		let servers = await res.json();
		let authorized = false;
		for(let i = 0; i < servers.length; i++){
			if(servers[i].id !== guild_id) continue;
			if((servers[i].permissions & 0x8) === 0x8) authorized = true;
		}
		if(!authorized) return Errors.getJson(1041);

		let members = resData['approximate_presence_count'];
		let members_total = resData['approximate_member_count'];

		if(!Validate.isPositiveInteger(members)) return Errors.getJson(1009);
		if(!Validate.isPositiveInteger(members_total)) return Errors.getJson(1009);

		try{
			await Utils.env.DB.prepare("INSERT INTO discord(owner, invite_code, guild_id, icon, banner, splash, name, category, keywords, description, members, members_total, secretToken, created, updated) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
			.bind(username, data['invite_code'], guild_id, icon, banner, splash, name, data['category'], keywords, data['description'], members, members_total, secretToken, Utils.date, Utils.date).run();
		}catch{
			return Errors.getJson(1032);
		}

		return Errors.getJson(0);
	}

	static async edit(username, token, id, data){
		if(!Validate.username(username)) return Errors.getJson(1001);
		if(!Validate.token(token)) return Errors.getJson(1004);

		if(!Validate.isPositiveInteger(id)) return Errors.getJson(1022);

		if(!Validate.bearer(data['token'])) return Errors.getJson(1040);
		if(!Validate.discordInviteCode(data['invite_code'])) return Errors.getJson(1036);
		if(!Validate.discordServerCategory(data['category'])) return Errors.getJson(1039);
		if(!Validate.description(data['description'])) return Errors.getJson(1018);
		if(!Validate.keywords(data['keywords'])) return Errors.getJson(1038);

		if(!(await Utils.authenticate(username, token))) return Errors.getJson(1008);
		if(!(await Utils.ownsServer('discord', username, id))) return Errors.getJson(9999);

		let keywords = "";
		for(let i = 0; i < data['keywords'].length; i++){
			if(Validate.keyword(data['keywords'][i])) keywords += data['keywords'][i] + ',';
		}
		keywords = keywords.substring(0, keywords.length-1);
		if(keywords.length < 2) return Errors.getJson(1038);

		let res = await fetch('https://discord.com/api/v10/invites/' + data['invite_code'] + '?with_counts=true&with_expiration=true');
		if(!res.ok) return Errors.getJson(1009);
		if(res.status === 404) return Errors.getJson(1036);
		if(res.status !== 200) return Errors.getJson(1009);

		let resData = await res.json();
		if(resData['expires_at'] !== null) return Errors.getJson(1037);

		let guild_id = resData.guild?.id;

		if(!Validate.snowflake(guild_id)) return Errors.getJson(1009);

		res = await fetch('https://discord.com/api/v10/users/@me/guilds', { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data['token']}` }, method: 'GET' });
		if(!res.ok) return Errors.getJson(1040);
		if(res.status !== 200) return Errors.getJson(1040);

		let servers = await res.json();
		let authorized = false;
		for(let i = 0; i < servers.length; i++){
			if(servers[i].id !== guild_id) continue;
			if((servers[i].permissions & 0x8) === 0x8) authorized = true;
		}
		if(!authorized) return Errors.getJson(1041);

		try{
			await Utils.env.DB.prepare("UPDATE discord SET invite_code = ?, category = ?, description = ?, keywords = ? WHERE id = ?")
			.bind(data['invite_code'], data['category'], data['description'], keywords, id).run();
			await Utils.deleteValue('server-discord-' + id);
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
		if(!(await Utils.ownsServer('discord', username, id))) return Errors.getJson(9999);

		try{
			await Utils.deleteValue('server-discord-' + id);
			await Utils.env.DB.prepare("DELETE FROM discord WHERE id = ?").bind(id).run();
		}catch{
			return Errors.getJson(1009);
		}

		return Errors.getJson(0);
	}

	static async updateCrawledData(data){

		if(typeof(data.servers) !== 'object') return Errors.getJson(1000);

		data = data.servers;
		let updated = 0;
		for(let i = 0; i < data.length; i++){
			try{

				await Utils.env.DB.prepare("UPDATE discord SET icon = ?, banner = ?, splash = ?, name = ?, members = ?, members_total = ?, updated = ? WHERE id = ?")
				.bind(data[i].icon, data[i].banner, data[i].splash, data[i].name, data[i].members, data[i].members_total, data[i].updated, data[i].id).run();

				Utils.env.DAE.writeDataPoint({
					'doubles': [data[i].members, data[i].members_total],
					'indexes': [data[i].id]
				});

				updated++;
			}catch{}
		}

		return { 'error': 0, 'info': 'Success', 'data': { 'total': data.length, 'updated': updated } };
	}

}