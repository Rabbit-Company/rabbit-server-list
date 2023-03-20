export default class Utils{
	static cache = caches.default;

	static jsonResponse(json, statusCode = 200){
		if(typeof(json) !== 'string') json = JSON.stringify(json);
		return new Response(json, {
			headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
			status: statusCode
		});
	}

	static async setValue(env, key, value, expirationTime = null, cacheTime = 60){
		let cacheKey = "https://api.rabbitserverlist.com?key=" + key;
		if(expirationTime === null){
			await env.KV.put(key, value);
		}else{
			await env.KV.put(key, value, { expirationTtl: expirationTime });
		}
		let nres = new Response(value);
		nres.headers.append('Cache-Control', 's-maxage=' + cacheTime);
		await Utils.cache.put(cacheKey, nres);
	}

	static async getValue(env, key, cacheTime = 60){
		let value = null;

		let cacheKey = "https://api.rabbitserverlist.com?key=" + key;
		let res = await cache.match(cacheKey);
		if(res) value = await res.text();

		if(value == null){
			value = await env.KV.get(key, { cacheTtl: cacheTime });
			let nres = new Response(value);
			nres.headers.append('Cache-Control', 's-maxage=' + cacheTime);
			if(value != null) await Utils.cache.put(cacheKey, nres);
		}

		return value;
	}

	static async deleteValue(env, key){
		await env.KV.delete(key);
		await Utils.cache.delete("https://api.rabbitserverlist.com?key=" + key);
	}
}