import Utils from "./utils.js";
import Validate from "./validate.js";
import Errors from "./errors.js";

export default class Accounts{

	static create(username, email, password){
		if(!Validate.username(username)) return Errors.getJson(1000);
		if(!Validate.email(email)) return Errors.getJson(1001);
		if(!Validate.password(password)) return Errors.getJson(1002);
	}

	static delete(username, token){
		if(!Validate.username(username)) return Errors.getJson(1000);
	}

}