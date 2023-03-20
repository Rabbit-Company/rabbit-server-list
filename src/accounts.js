import Utils from "./utils.js";
import Validate from "./validate.js";
import Errors from "./errors.js";

export default class Accounts{

	static async create(username, email, password){
		if(!Validate.username(username)) return Errors.getJson(1001);
		if(!Validate.email(email)) return Errors.getJson(1002);
		if(!Validate.password(password)) return Errors.getJson(1003);

		return Errors.getJson(0);
	}

	static async delete(username, token){
		if(!Validate.username(username)) return Errors.getJson(1001);
		if(!Validate.token(token)) return Errors.getJson(1004);

		return Errors.getJson(0);
	}

}