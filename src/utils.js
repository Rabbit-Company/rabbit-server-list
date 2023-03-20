export default class Utils{
	static env;
	static date;
	static cache = caches.default;

	static initialize(env){
		this.env = env;
		this.date = new Date().toISOString().split('T')[0];
	}

	static jsonResponse(json, statusCode = 200){
		if(typeof(json) !== 'string') json = JSON.stringify(json);
		return new Response(json, {
			headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
			status: statusCode
		});
	}

	static async setValue(key, value, expirationTime = null, cacheTime = 60){
		let cacheKey = "https://api.rabbitserverlist.com?key=" + key;
		if(expirationTime === null){
			await this.env.KV.put(key, value);
		}else{
			await this.env.KV.put(key, value, { expirationTtl: expirationTime });
		}
		let nres = new Response(value);
		nres.headers.append('Cache-Control', 's-maxage=' + cacheTime);
		await Utils.cache.put(cacheKey, nres);
	}

	static async getValue(key, cacheTime = 60){
		let value = null;

		let cacheKey = "https://api.rabbitserverlist.com?key=" + key;
		let res = await cache.match(cacheKey);
		if(res) value = await res.text();

		if(value == null){
			value = await this.env.KV.get(key, { cacheTtl: cacheTime });
			let nres = new Response(value);
			nres.headers.append('Cache-Control', 's-maxage=' + cacheTime);
			if(value != null) await Utils.cache.put(cacheKey, nres);
		}

		return value;
	}

	static async deleteValue(key){
		await this.env.KV.delete(key);
		await Utils.cache.delete("https://api.rabbitserverlist.com?key=" + key);
	}

	static async generateHash(message, hash = 'SHA-512'){
		const msgUint8 = new TextEncoder().encode(message);
		const hashBuffer = await crypto.subtle.digest(hash, msgUint8);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	}
}