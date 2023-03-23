export default class Errors{

	static list = {
		0: 'Success',
		1000: 'Not all required data provided in json format.',
		1001: 'Username can only contain lowercase characters, numbers and hyphens. It also needs to start with lowercase character and be between 4 and 30 characters long.',
		1002: 'Invalid email address.',
		1003: 'Password needs to be hashed with Argon2id. The length of hashed password needs to be 128 characters.',
		1004: 'Token is invalid. Please login first to get the token.',
		1005: 'Username is already registered.',
		1006: 'Basic Authentication is missing.',
		1007: 'Password is incorrect.',
		1008: 'The token is incorrect or it has expired. Please Sign in again.',
		1009: 'Something went wrong while trying to perform this action. Please try again later.',
		1010: 'Server name is invalid.',
		1011: 'Server IP is invalid.',
		1012: 'Server port is invalid.',
		1013: 'Server website is invalid.',
		1014: 'Server discord is invalid.',
		1015: 'Server version is invalid.',
		1016: 'Server categories are invalid.',
		1017: 'Server country is invalid.',
		1018: 'Server description is invalid.',
		1019: 'Votifier IP is invalid.',
		1020: 'Votifier Port is invalid.',
		1021: 'Votifier Token is invalid.',
		1022: 'ID is invalid.',
		1023: 'Content-Type header needs to be provided.',
		1024: 'File type is not supported.',
		1025: 'Image can not be bigger than 1MB. Please choose smaller image.',
		1026: 'Failed to fetch the image.',
		1027: 'Server twitter is invalid.',
		1028: 'Server store is invalid.',
		1029: 'Server trailer is invalid.',
		1030: 'Bedrock IP is invalid.',
		1031: 'Bedrock Port is invalid.',
		1032: 'Server is already on the website.',
		9999: 'Your do not have permission to perform this action.'
	};

	static get(id){
		return this.list[id];
	}

	static getJson(id){
		return { 'error': id, 'info': this.list[id] };
	}

}