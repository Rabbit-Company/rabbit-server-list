import Utils from "./utils.js";
import Validate from "./validate.js";
import Errors from "./errors.js";

export default class Accounts{

	static async create(username, email, password){
		if(!Validate.username(username)) return Errors.getJson(1001);
		if(!Validate.email(email)) return Errors.getJson(1002);
		if(!Validate.password(password)) return Errors.getJson(1003);

		password = await Utils.generateHash(password);
		try{
			await Utils.env.DB.prepare("INSERT INTO accounts(username, password, email, created, accessed) VALUES(?, ?, ?, ?, ?)").bind(username, password, email, Utils.date, Utils.date).run();
		}catch{
			return Errors.getJson(1005);
		}

		return Errors.getJson(0);
	}

	static async delete(username, token){
		if(!Validate.username(username)) return Errors.getJson(1001);
		if(!Validate.token(token)) return Errors.getJson(1004);

		return Errors.getJson(0);
	}

}