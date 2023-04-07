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
			const { results } = await Utils.env.DB.prepare("SELECT id, owner, invite_code, guild_id, icon, name, keywords, description, members, members_total, votes, votes_total, created, updated FROM discord ORDER BY votes DESC LIMIT " + limit + " OFFSET " + offset).all();
			await Utils.setValue('servers-discord-list-' + page, JSON.stringify(results), 60);
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
			const { results } = await Utils.env.DB.prepare("SELECT id, owner, invite_code, guild_id, icon, name, keywords, description, members, members_total, votes, votes_total, created, updated FROM discord WHERE owner = ?").bind(username).all();
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
			const result = await Utils.env.DB.prepare("SELECT id, owner, invite_code, guild_id, icon, name, keywords, description, members, members_total, votes, votes_total, created, updated FROM discord WHERE id = ?").bind(id).first();
			await Utils.setValue('server-discord-' + id, JSON.stringify(result), 60);
			return { 'error': 0, 'info': 'success', 'data': result };
		}catch{
			return Errors.getJson(1009);
		}
	}

	static async add(username, token, data){
		if(!Validate.username(username)) return Errors.getJson(1001);
		if(!Validate.token(token)) return Errors.getJson(1004);

		if(!Validate.discordInviteCode(data['invite_code'])) return Errors.getJson(1036);
		if(!Validate.description(data['description'])) return Errors.getJson(1018);
		if(!Validate.keywords(data['keywords'])) return Errors.getJson(1038);

		if(!(await Utils.authenticate(username, token))) return Errors.getJson(1008);

		let keywords = "";
		for(let i = 0; i < data['keywords'].length; i++){
			keywords += data['keywords'][i] + ',';
		}
		keywords = keywords.substring(0, keywords.length-1);

		let res = await fetch('https://discord.com/api/v10/invites/' + data['invite_code'] + '?with_counts=true&with_expiration=true');
		if(!res.ok) return Errors.getJson(1009);
		if(res.status === 404) return Errors.getJson(1036);
		if(res.status !== 200) return Errors.getJson(1009);

		let resData = await res.json();
		if(resData['expires_at'] !== null) return Errors.getJson(1037);

		let guild_id = resData.guild?.id;
		let name = resData.guild?.name;
		let icon = resData.guild?.icon;

		if(!Validate.snowflake(guild_id)) return Errors.getJson(1009);

		let members = resData['approximate_presence_count'];
		let members_total = resData['approximate_member_count'];

		if(!Validate.isPositiveInteger(members)) return Errors.getJson(1009);
		if(!Validate.isPositiveInteger(members_total)) return Errors.getJson(1009);

		try{
			await Utils.env.DB.prepare("INSERT INTO discord(owner, invite_code, guild_id, icon, name, keywords, description, members, members_total, created, updated) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
			.bind(username, data['invite_code'], guild_id, icon, name, keywords, data['description'], members, members_total, Utils.date, Utils.date).run();
		}catch{
			return Errors.getJson(1032);
		}

		return Errors.getJson(0);
	}

	static async edit(username, token, id, data){
		if(!Validate.username(username)) return Errors.getJson(1001);
		if(!Validate.token(token)) return Errors.getJson(1004);

		if(!Validate.isPositiveInteger(id)) return Errors.getJson(1022);

		if(!Validate.discordInviteCode(data['invite_code'])) return Errors.getJson(1036);
		if(!Validate.description(data['description'])) return Errors.getJson(1018);
		if(!Validate.keywords(data['keywords'])) return Errors.getJson(1038);

		if(!(await Utils.authenticate(username, token))) return Errors.getJson(1008);
		if(!(await Utils.ownsServer('discord', username, id))) return Errors.getJson(9999);

		let keywords = "";
		for(let i = 0; i < data['keywords'].length; i++){
			keywords += data['keywords'][i] + ',';
		}
		keywords = keywords.substring(0, keywords.length-1);

		try{
			await Utils.env.DB.prepare("UPDATE discord SET invite_code = ?, description = ?, keywords = ? WHERE id = ?")
			.bind(data['invite_code'], data['description'], data['keywords'], id).run();
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

}