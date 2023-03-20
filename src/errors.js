export default class Errors{

	static list = {
		0: 'Success',
		1000: 'Not all required data provided in json format.',
		1001: 'Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long.',
		1002: 'Invalid email address.',
		1003: 'Password needs to be hashed with Argon2id. The length of hashed password needs to be 128 characters.',
		1004: 'Token is invalid. Please login first to get the token.',
		1005: 'Username is already registered.',
		1006: 'OTP is invalid.',
		1007: 'Password is incorrect.',
		1008: '',
	};

	static get(id){
		return this.list[id];
	}

	static getJson(id){
		return { 'error': id, 'info': this.list[id] };
	}

}