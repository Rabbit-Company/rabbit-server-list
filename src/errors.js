export default class Errors{

	static list = {
		1000: 'Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long.',
		1001: 'Invalid email address.',
		1002: 'Password needs to be hashed with Argon2id. The length of hashed password needs to be 128 characters.',
	};

	static get(id){
		return this.list[id];
	}

	static getJson(id){
		return { 'error': id, 'info': this.list[id] };
	}

}