export default class Validate{

	static countryList = { "AFG": "Afghanistan", "ALB": "Albania", "DZA": "Algeria", "ASM": "American Samoa", "AND": "Andorra", "AGO": "Angola", "AIA": "Anguilla", "ATA": "Antarctica", "ATG": "Antigua and Barbuda", "ARG": "Argentina", "ARM": "Armenia", "ABW": "Aruba", "AUS": "Australia", "AUT": "Austria", "AZE": "Azerbaijan", "BHS": "Bahamas", "BHR": "Bahrain", "BGD": "Bangladesh", "BRB": "Barbados", "BLR": "Belarus", "BEL": "Belgium", "BLZ": "Belize", "BEN": "Benin", "BMU": "Bermuda", "BTN": "Bhutan", "BOL": "Bolivia", "BIH": "Bosnia and Herzegovina", "BWA": "Botswana", "BVT": "Bouvet Island", "BRA": "Brazil", "IOT": "British Indian Ocean Territory", "BRN": "Brunei Darussalam", "BGR": "Bulgaria", "BFA": "Burkina Faso", "BDI": "Burundi", "CPV": "Cabo Verde", "KHM": "Cambodia", "CMR": "Cameroon", "CAN": "Canada", "CYM": "Cayman Islands", "CAF": "Central African Republic", "TCD": "Chad", "CHL": "Chile", "CHN": "China", "CXR": "Christmas Island", "CCK": "Cocos Islands", "COL": "Colombia", "COM": "Comoros", "COD": "Congo (the Democratic Republic of the)", "COG": "Congo", "COK": "Cook Islands", "CRI": "Costa Rica", "HRV": "Croatia", "CUB": "Cuba", "CUW": "Curaçao", "CYP": "Cyprus", "CZE": "Czechia", "CIV": "Côte d'Ivoire", "DNK": "Denmark", "DJI": "Djibouti", "DMA": "Dominica", "DOM": "Dominican Republic", "ECU": "Ecuador", "EGY": "Egypt", "SLV": "El Salvador", "GNQ": "Equatorial Guinea", "ERI": "Eritrea", "EST": "Estonia", "SWZ": "Eswatini", "ETH": "Ethiopia", "FLK": "Falkland Islands", "FRO": "Faroe Islands", "FJI": "Fiji", "FIN": "Finland", "FRA": "France", "GUF": "French Guiana", "PYF": "French Polynesia", "ATF": "French Southern Territories", "GAB": "Gabon", "GMB": "Gambia", "GEO": "Georgia", "DEU": "Germany", "GHA": "Ghana", "GIB": "Gibraltar", "GRC": "Greece", "GRL": "Greenland", "GRD": "Grenada", "GLP": "Guadeloupe", "GUM": "Guam", "GTM": "Guatemala", "GGY": "Guernsey", "GIN": "Guinea", "GNB": "Guinea-Bissau", "GUY": "Guyana", "HTI": "Haiti", "HMD": "Heard Island and McDonald Islands", "VAT": "Holy See", "HND": "Honduras", "HKG": "Hong Kong", "HUN": "Hungary", "ISL": "Iceland", "IND": "India", "IDN": "Indonesia", "IRN": "Iran", "IRQ": "Iraq", "IRL": "Ireland", "IMN": "Isle of Man", "ISR": "Israel", "ITA": "Italy", "JAM": "Jamaica", "JPN": "Japan", "JEY": "Jersey", "JOR": "Jordan", "KAZ": "Kazakhstan", "KEN": "Kenya", "KIR": "Kiribati", "PRK": "North Korea", "KOR": "South Korea", "KWT": "Kuwait", "KGZ": "Kyrgyzstan", "LAO": "Lao People's Democratic Republic", "LVA": "Latvia", "LBN": "Lebanon", "LSO": "Lesotho", "LBR": "Liberia", "LBY": "Libya", "LIE": "Liechtenstein", "LTU": "Lithuania", "LUX": "Luxembourg", "MAC": "Macao", "MDG": "Madagascar", "MWI": "Malawi", "MYS": "Malaysia", "MDV": "Maldives", "MLI": "Mali", "MLT": "Malta", "MHL": "Marshall Islands", "MTQ": "Martinique", "MRT": "Mauritania", "MUS": "Mauritius", "MYT": "Mayotte", "MEX": "Mexico", "FSM": "Micronesia", "MDA": "Moldova", "MCO": "Monaco", "MNG": "Mongolia", "MNE": "Montenegro", "MSR": "Montserrat", "MAR": "Morocco", "MOZ": "Mozambique", "MMR": "Myanmar", "NAM": "Namibia", "NRU": "Nauru", "NPL": "Nepal", "NLD": "Netherlands", "NCL": "New Caledonia", "NZL": "New Zealand", "NIC": "Nicaragua", "NER": "Niger", "NGA": "Nigeria", "NIU": "Niue", "NFK": "Norfolk Island", "MNP": "Northern Mariana Islands", "NOR": "Norway", "OMN": "Oman", "PAK": "Pakistan", "PLW": "Palau", "PSE": "Palestine, State of", "PAN": "Panama", "PNG": "Papua New Guinea", "PRY": "Paraguay", "PER": "Peru", "PHL": "Philippines", "PCN": "Pitcairn", "POL": "Poland", "PRT": "Portugal", "PRI": "Puerto Rico", "QAT": "Qatar", "MKD": "Republic of North Macedonia", "ROU": "Romania", "RUS": "Russian Federation", "RWA": "Rwanda", "REU": "Réunion", "BLM": "Saint Barthélemy", "SHN": "Saint Helena, Ascension and Tristan da Cunha", "KNA": "Saint Kitts and Nevis", "LCA": "Saint Lucia", "MAF": "Saint Martin (French part)", "SPM": "Saint Pierre and Miquelon", "VCT": "Saint Vincent and the Grenadines", "WSM": "Samoa", "SMR": "San Marino", "STP": "Sao Tome and Principe", "SAU": "Saudi Arabia", "SEN": "Senegal", "SRB": "Serbia", "SYC": "Seychelles", "SLE": "Sierra Leone", "SGP": "Singapore", "SXM": "Sint Maarten (Dutch part)", "SVK": "Slovakia", "SVN": "Slovenia", "SLB": "Solomon Islands", "SOM": "Somalia", "ZAF": "South Africa", "SGS": "South Georgia and the South Sandwich Islands", "SSD": "South Sudan", "ESP": "Spain", "LKA": "Sri Lanka", "SDN": "Sudan", "SUR": "Suriname", "SJM": "Svalbard and Jan Mayen", "SWE": "Sweden", "CHE": "Switzerland", "SYR": "Syrian Arab Republic", "TWN": "Taiwan", "TJK": "Tajikistan", "TZA": "Tanzania, United Republic of", "THA": "Thailand", "TLS": "Timor-Leste", "TGO": "Togo", "TKL": "Tokelau", "TON": "Tonga", "TTO": "Trinidad and Tobago", "TUN": "Tunisia", "TUR": "Turkey", "TKM": "Turkmenistan", "TCA": "Turks and Caicos Islands", "TUV": "Tuvalu", "UGA": "Uganda", "UKR": "Ukraine", "ARE": "United Arab Emirates", "GBR": "United Kingdom of Great Britain and Northern Ireland", "UMI": "United States Minor Outlying Islands", "USA": "United States of America", "URY": "Uruguay", "UZB": "Uzbekistan", "VUT": "Vanuatu", "VEN": "Venezuela", "VNM": "Viet Nam", "VGB": "Virgin Islands (British)", "VIR": "Virgin Islands (U.S.)", "WLF": "Wallis and Futuna", "ESH": "Western Sahara", "YEM": "Yemen", "ZMB": "Zambia", "ZWE": "Zimbabwe" };
	static minecraftServerVersionList = ['1.19.4', '1.19.3', '1.19.2', '1.19.1', '1.19', '1.18.2', '1.18.1', '1.18', '1.17.1', '1.17', '1.16.5', '1.16.4', '1.16.3', '1.16.2', '1.16.1', '1.16', '1.15.2', '1.15.1', '1.15', '1.14.4', '1.14.3', '1.14.2', '1.14.1', '1.14', '1.13.2', '1.13.1', '1.13', '1.12.2', '1.12.1', '1.12', '1.11.2', '1.11.1', '1.11', '1.10.2', '1.10.1', '1.10', '1.9.4', '1.9.3', '1.9.2', '1.9.1', '1.9', '1.8.9', '1.8.8', '1.8.7', '1.8.6', '1.8.5', '1.8.4', '1.8.3', '1.8.2', '1.8.1', '1.8', '1.7.10', '1.7.9', '1.7.8', '1.7.7', '1.7.6', '1.7.5', '1.7.4', '1.7.3', '1.7.2', '1.6.4', '1.6.2', '1.6.1', '1.5.2', '1.5.1', '1.4.7', '1.4.6', '1.4.5', '1.4.4', '1.4.2', '1.3.2', '1.3.1', '1.2.5', '1.2.4', '1.2.3', '1.2.2', '1.2.1', '1.1', '1.0'];
	static minecraftServerCategoryList = ['Anarchy', 'Bedwards', 'Creative', 'Cross-Play', 'Earth', 'Economy', 'Factions', 'FTB', 'Hardcore', 'KitPvP', 'LifeSeal', 'MCMMO', 'Mini Games', 'OneBlock', 'Parkour', 'Pixelmon', 'Prison', 'PvE', 'PvP', 'Raiding', 'Roleplay', 'Skyblock', 'Skywars', 'Survival', 'Survival Games', 'Tekkit', 'Towny', 'Vanilla', 'Whitelist'];

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

	static twitter(twitter){
		if(typeof(twitter) !== 'string') return false;
		if(!this.URL(twitter)) return false;
		if(!twitter.startsWith('https://twitter.com/')) return false;
		return true;
	}

	static youtubeVideo(video){
		if(typeof(video) !== 'string') return false;
		if(!this.URL(video)) return false;
		let validLinks = ['https://www.youtube.com/watch?v=', 'https://youtu.be/'];
		for(let i = 0; i < validLinks.length; i++){
			if(video.startsWith(validLinks[i])) return true;
		}
		return false;
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

	static country(country){
		if(typeof(country) !== 'string') return false;
		return Object.keys(this.countryList).includes(country);
	}

	static description(description){
		if(typeof(description) !== 'string') return false;
		if(!(description.length >= 50 && description.length <= 10_000)) return false;
		return true;
	}

	static minecraftServerVersion(version){
		if(typeof(version) !== 'string') return false;
		return this.minecraftServerVersionList.includes(version);
	}

	static minecraftServerCategory(category){
		if(typeof(category) !== 'object') return false;
		if(!(category.length >= 1 && category.length <= 5)) return false;
		for(let i = 0; i < category.length; i++){
			if(!this.minecraftServerCategoryList.includes(category[i])) return false;
		}
		return true;
	}

	static minecraftVotifierToken(token){
		if(typeof(token) !== 'string') return false;
		if(!(token.length >= 4 && token.length <= 40)) return false;
		return true;
	}

}