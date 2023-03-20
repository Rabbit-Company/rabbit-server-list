import Utils from "./utils.js";
import Validate from "./validate.js";
import Errors from "./errors.js";

export default class Account{

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

	static async login(username, password, otp){
		if(!Validate.username(username)) return Errors.getJson(1001);
		if(!Validate.password(password)) return Errors.getJson(1003);
		if(!Validate.OTP(otp)) return Errors.getJson(1006);

		password = await Utils.generateHash(password);
		try{
			let { results } = await Utils.env.DB.prepare("SELECT * FROM accounts WHERE username = ? AND password = ?").bind(username, password).all();
			if(results.length !== 1) return Errors.getJson(1007);
		}catch{
			return Errors.getJson(1005);
		}

		let token = await Utils.generateToken(username);

		let message = Errors.getJson(0);
		message.data = { 'token': token };
		return message;
	}

	static async delete(username, token){
		if(!Validate.username(username)) return Errors.getJson(1001);
		if(!Validate.token(token)) return Errors.getJson(1004);

		return Errors.getJson(0);
	}

}