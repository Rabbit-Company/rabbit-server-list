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

	static durationBetween(date, date2){
		const diffTime = Math.abs(date2 - date);
		const diffSeconds = Math.ceil(diffTime / (1000));
		const diffMinutes = Math.ceil(diffTime / (1000 * 60));
		const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if(diffSeconds < 60) return diffSeconds + ' second(s)';
		if(diffMinutes < 60) return diffMinutes + ' minute(s)';
		if(diffHours < 24) return diffHours + ' hour(s)';
		return diffDays + ' day(s)';
	}

	async alarm(){
		await this.state.storage.deleteAll();
	}

	async fetch(request) {
		let url = new URL(request.url);

		let currentAlarm = await this.state.storage.getAlarm();
		if(currentAlarm == null){
			let nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getTime();
      this.state.storage.setAlarm(nextMonth);
    }

		if(url.pathname === '/votes/get'){
			let map = await this.state.storage.list({ prefix: 'votes-', limit: 100 });

			const data = {};
			map.forEach((value, key) => {
				data[key.replace('votes-', '')] = value;
			});

			return MinecraftVoteDO.jsonResponse({ 'error': 0, 'info': 'success', 'data': data });
		}

		// Vote
		if(url.pathname === '/vote'){
			let data = await request.json();

			if(!data['username'] || !data['ip']) return MinecraftVoteDO.jsonResponse({ 'error': 1000, 'info': 'Not all required data provided in json format.' });

			let ipVoteDate = await this.state.storage.get('votedate-ip-' + data['ip']);
			if(ipVoteDate != null){
				if((Date.now() - MinecraftVoteDO.voteLimit) < Number(ipVoteDate)){
					return MinecraftVoteDO.jsonResponse({ 'error': 3001, 'info': 'You have already voted for this server today.\nYou will be able to vote again in approximately ' + MinecraftVoteDO.durationBetween(Number(ipVoteDate) + MinecraftVoteDO.voteLimit, Date.now()) });
				}
			}

			let usernameVoteDate = await this.state.storage.get('votedate-username-' + data['username']);
			if(usernameVoteDate != null){
				if((Date.now() - MinecraftVoteDO.voteLimit) < Number(usernameVoteDate)){
					return MinecraftVoteDO.jsonResponse({ 'error': 3002, 'info': 'You have already voted for this server today.\nYou will be able to vote again in approximately ' + MinecraftVoteDO.durationBetween(Number(usernameVoteDate) + MinecraftVoteDO.voteLimit, Date.now()) });
				}
			}

			await this.state.storage.put('votedate-ip-' + data['ip'], Date.now());
			await this.state.storage.put('votedate-username-' + data['username'], Date.now());

			let votes = await this.state.storage.get('votes-' + data['username']);
			if(votes == null){
				await this.state.storage.put('votes-' + data['username'], 1);
			}else{
				await this.state.storage.put('votes-' + data['username'], ++votes);
			}

			return MinecraftVoteDO.jsonResponse({ 'error': 0, 'info': 'success' });
		}

		return MinecraftVoteDO.jsonResponse({ "error": 404, "info": "Invalid API endpoint" }, 404);
	}
}

export class DiscordVoteDO{
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

	static durationBetween(date, date2){
		const diffTime = Math.abs(date2 - date);
		const diffSeconds = Math.ceil(diffTime / (1000));
		const diffMinutes = Math.ceil(diffTime / (1000 * 60));
		const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if(diffSeconds < 60) return diffSeconds + ' second(s)';
		if(diffMinutes < 60) return diffMinutes + ' minute(s)';
		if(diffHours < 24) return diffHours + ' hour(s)';
		return diffDays + ' day(s)';
	}

	async alarm(){
		await this.state.storage.deleteAll();
	}

	async fetch(request) {
		let url = new URL(request.url);

		let currentAlarm = await this.state.storage.getAlarm();
		if(currentAlarm == null){
			let nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getTime();
      this.state.storage.setAlarm(nextMonth);
    }

		if(url.pathname === '/votes/get'){
			let map = await this.state.storage.list({ prefix: 'votes-', limit: 100 });

			let data = {};
			for(let [key, value] of map){
				let id = key.replace('votes-', '');
				let userData = await this.state.storage.get('user-data-' + id);
				if(userData == null) continue;
				data[id] = { 'username': userData.username, 'avatar': userData.avatar, 'discriminator': userData.discriminator, 'votes': value };
			}

			return DiscordVoteDO.jsonResponse({ 'error': 0, 'info': 'success', 'data': data });
		}

		// Vote
		if(url.pathname === '/vote'){
			let data = await request.json();

			if(!data['id'] || !data['ip'] || !data['username'] || !data['avatar'] || !data['discriminator']) return DiscordVoteDO.jsonResponse({ 'error': 1000, 'info': 'Not all required data provided in json format.' });

			let ipVoteDate = await this.state.storage.get('votedate-ip-' + data['ip']);
			if(ipVoteDate != null){
				if((Date.now() - DiscordVoteDO.voteLimit) < Number(ipVoteDate)){
					return DiscordVoteDO.jsonResponse({ 'error': 3001, 'info': 'You have already voted for this server today.\nYou will be able to vote again in approximately ' + DiscordVoteDO.durationBetween(Number(ipVoteDate) + DiscordVoteDO.voteLimit, Date.now()) });
				}
			}

			let idVoteDate = await this.state.storage.get('votedate-id-' + data['id']);
			if(idVoteDate != null){
				if((Date.now() - DiscordVoteDO.voteLimit) < Number(idVoteDate)){
					return DiscordVoteDO.jsonResponse({ 'error': 3002, 'info': 'You have already voted for this server today.\nYou will be able to vote again in approximately ' + DiscordVoteDO.durationBetween(Number(idVoteDate) + DiscordVoteDO.voteLimit, Date.now()) });
				}
			}

			await this.state.storage.put('votedate-ip-' + data['ip'], Date.now());
			await this.state.storage.put('votedate-id-' + data['id'], Date.now());

			let votes = await this.state.storage.get('votes-' + data['id']);
			if(votes == null){
				await this.state.storage.put('votes-' + data['id'], 1);
				await this.state.storage.put('user-data-' + data['id'], { 'username': data['username'], 'avatar': data['avatar'], 'discriminator': data['discriminator'] });
			}else{
				await this.state.storage.put('votes-' + data['id'], ++votes);
			}

			return DiscordVoteDO.jsonResponse({ 'error': 0, 'info': 'success' });
		}

		return DiscordVoteDO.jsonResponse({ "error": 404, "info": "Invalid API endpoint" }, 404);
	}
}