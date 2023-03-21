export default class Validate{

	static minecraftServerVersionList = ['1.19.4', '1.19.3', '1.19.2', '1.19.1', '1.19', '1.18.2', '1.18.1', '1.18', '1.17.1', '1.17', '1.16.5', '1.16.4', '1.16.3', '1.16.2', '1.16.1', '1.16', '1.15.2', '1.15.1', '1.15', '1.14.4', '1.14.3', '1.14.2', '1.14.1', '1.14', '1.13.2', '1.13.1', '1.13', '1.12.2', '1.12.1', '1.12', '1.11.2', '1.11.1', '1.11', '1.10.2', '1.10.1', '1.10', '1.9.4', '1.9.3', '1.9.2', '1.9.1', '1.9', '1.8.9', '1.8.8', '1.8.7', '1.8.6', '1.8.5', '1.8.4', '1.8.3', '1.8.2', '1.8.1', '1.8', '1.7.10', '1.7.9', '1.7.8', '1.7.7', '1.7.6', '1.7.5', '1.7.4', '1.7.3', '1.7.2', '1.6.4', '1.6.2', '1.6.1', '1.5.2', '1.5.1', '1.4.7', '1.4.6', '1.4.5', '1.4.4', '1.4.2', '1.3.2', '1.3.1', '1.2.5', '1.2.4', '1.2.3', '1.2.2', '1.2.1', '1.1', '1.0'];

	static username(username){
		if(typeof(username) !== 'string') return false;
		return /^([a-z][a-z0-9\-]{3,29})$/.test(username);
	}

	static password(password){
		if(typeof(password) !== 'string') return false;
		return /^([a-z0-9]{128})$/.test(password);
	}

	static email(email){
		if(typeof(email) !== 'string') return false;
		return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
	}

	static token(token){
		if(typeof(token) !== 'string') return false;
		return token.length === 128;
	}

	static isPositiveInteger = string => {
		const number = Number(string);
		const isInteger = Number.isInteger(number);
		const isPositive = number > 0;

		return isInteger && isPositive;
	}

	static URL(url){
		try{
			new URL(url);
			return true;
		}catch{}
		return false;
	}

	static website(website){
		if(typeof(website) !== 'string') return false;
		if(!this.URL(website)) return false;
		if(!website.startsWith('https://')) return false;
		return true;
	}

	static ip(ip){
		if(typeof(ip) !== 'string') return false;
		return /^([A-Za-z0-9\-. ]{4,50})$/.test(ip);
	}

	static port(port){
		if(!this.isPositiveInteger(port)) return false;
		if(!(port >= 1 && port <= 65535)) return false;
		return true;
	}

	static serverName(name){
		if(typeof(name) !== 'string') return false;
		return /^([A-Za-z0-9\-+. ]{3,30})$/.test(name);
	}

	static serverCommunication(communication){
		if(typeof(communication) !== 'string') return false;
		if(!this.URL(communication) && !this.email(communication)) return false;
		return true;
	}

	static minecraftServerVersion(version){
		if(typeof(version) !== 'string') return false;
		return this.minecraftServerVersionList.includes(version);
	}

}