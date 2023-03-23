import Utils from "../utils.js";
import Validate from "../validate.js";
import Errors from "../errors.js";

export default class Minecraft{

	static async list(page = 1){
		if(!Validate.isPositiveInteger(page)) page = 1;
		if(page > 100) page = 100;

		let limit = 20;
		let offset = limit * (page - 1);

		let data = await Utils.getValue('servers-minecraft-list-' + page, 3600);
		if(data !== null) return { 'error': 0, 'info': 'success', 'data': JSON.parse(data) };

		try{
			const { results } = await Utils.env.DB.prepare("SELECT id, owner, name, ip, port, bedrock_ip, bedrock_port, website, discord, twitter, store, trailer, version, categories, country, description, players, players_max, online, votes, votes_total, created, updated FROM minecraft LIMIT " + limit + " OFFSET " + offset).all();
			await Utils.setValue('servers-minecraft-list-' + page, JSON.stringify(results), 3600);
			return { 'error': 0, 'info': 'success', 'data': results };
		}catch{
			return Errors.getJson(1009);
		}
	}

	static async get(id){
		if(!Validate.isPositiveInteger(id)) return Errors.getJson(1022);

		let data = await Utils.getValue('server-minecraft-' + id, 3600);
		if(data !== null) return { 'error': 0, 'info': 'success', 'data': JSON.parse(data) };

		try{
			const result = await Utils.env.DB.prepare("SELECT id, owner, name, ip, port, bedrock_ip, bedrock_port, website, discord, twitter, store, trailer, version, categories, country, description, players, players_max, online, votes, votes_total, created, updated FROM minecraft WHERE id = ?").bind(id).first();
			await Utils.setValue('server-minecraft-' + id, JSON.stringify(result), 3600);
			return { 'error': 0, 'info': 'success', 'data': result };
		}catch{
			return Errors.getJson(1009);
		}
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

		try{
			await Utils.env.DB.prepare("INSERT INTO minecraft(owner, name, ip, port, bedrock_ip, bedrock_port, website, discord, twitter, store, trailer, version, categories, country, description, votifierIP, votifierPort, votifierToken, created, updated) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
			.bind(username, data['name'], data['ip'], data['port'], data['bedrock_ip'], data['bedrock_port'], data['website'], data['discord'], data['twitter'], data['store'], data['trailer'], data['version'], categories, data['country'], data['description'], data['votifierIP'], data['votifierPort'], data['votifierToken'], Utils.date, Utils.date).run();
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

}