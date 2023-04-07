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
			const { results } = await Utils.env.DB.prepare("SELECT id, owner, invite_code, guild_id, name, categories, country, description, members, members_total, votes, votes_total, created, updated FROM discord ORDER BY votes DESC LIMIT " + limit + " OFFSET " + offset).all();
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
			const { results } = await Utils.env.DB.prepare("SELECT id, owner, invite_code, guild_id, name, categories, country, description, members, members_total, votes, votes_total, created, updated FROM discord WHERE owner = ?").bind(username).all();
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
			const result = await Utils.env.DB.prepare("SELECT id, owner, invite_code, guild_id, name, categories, country, description, members, members_total, votes, votes_total, created, updated FROM discord WHERE id = ?").bind(id).first();
			await Utils.setValue('server-discord-' + id, JSON.stringify(result), 60);
			return { 'error': 0, 'info': 'success', 'data': result };
		}catch{
			return Errors.getJson(1009);
		}
	}

}