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
		/*
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
		*/
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

		// Get number of votes
		/*
		if(url.pathname === '/votes/get'){
			let votes = await this.state.storage.get('votes');
			if(votes == null) return MinecraftVoteDO.jsonResponse({ 'error': 0, 'info': 'success', 'data': { 'monthly': 0, 'total': 0 } });
			return MinecraftVoteDO.jsonResponse({ 'error': 0, 'info': 'success', 'data': votes });
		}
		*/

		// Get history of votes
		/*
		if(url.pathname === '/votes/history/get'){
			let historyVotes = await this.state.storage.get('votes-history');
			if(historyVotes == null) return MinecraftVoteDO.jsonResponse({ 'error': 0, 'info': 'success', 'data': {} });
			return MinecraftVoteDO.jsonResponse({ 'error': 0, 'info': 'success', 'data': historyVotes });
		}
		*/

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

			/*
			let votes = await this.state.storage.get('votes');
			if(votes == null) votes = { 'monthly': 0, 'total': 0 };
			votes['monthly']++;
			votes['total']++;
			await this.state.storage.put('votes', votes);
			*/

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

			const data = {};
			map.forEach((value, key) => {
				data[key.replace('votes-', '')] = value;
			});

			return DiscordVoteDO.jsonResponse({ 'error': 0, 'info': 'success', 'data': data });
		}

		// Vote
		if(url.pathname === '/vote'){
			let data = await request.json();

			if(!data['username'] || !data['ip']) return DiscordVoteDO.jsonResponse({ 'error': 1000, 'info': 'Not all required data provided in json format.' });

			let ipVoteDate = await this.state.storage.get('votedate-ip-' + data['ip']);
			if(ipVoteDate != null){
				if((Date.now() - DiscordVoteDO.voteLimit) < Number(ipVoteDate)){
					return DiscordVoteDO.jsonResponse({ 'error': 3001, 'info': 'You have already voted for this server today.\nYou will be able to vote again in approximately ' + DiscordVoteDO.durationBetween(Number(ipVoteDate) + DiscordVoteDO.voteLimit, Date.now()) });
				}
			}

			let usernameVoteDate = await this.state.storage.get('votedate-username-' + data['username']);
			if(usernameVoteDate != null){
				if((Date.now() - DiscordVoteDO.voteLimit) < Number(usernameVoteDate)){
					return DiscordVoteDO.jsonResponse({ 'error': 3002, 'info': 'You have already voted for this server today.\nYou will be able to vote again in approximately ' + DiscordVoteDO.durationBetween(Number(usernameVoteDate) + DiscordVoteDO.voteLimit, Date.now()) });
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

			return DiscordVoteDO.jsonResponse({ 'error': 0, 'info': 'success' });
		}

		return DiscordVoteDO.jsonResponse({ "error": 404, "info": "Invalid API endpoint" }, 404);
	}
}